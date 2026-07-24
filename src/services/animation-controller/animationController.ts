import type {
  AnimationControllerEvent,
  AnimationSnapshot,
  AnimationStateDefinition,
  AnimationStateId,
} from "../../models/animation";
import type { CompanionMode } from "../../models/settings";

export const CLICK_CHAIN_WINDOW_MS = 720;
export const MODE_FADE_OUT_MS = 170;
export const MODE_FADE_IN_MS = 210;

export const ANIMATION_STATE_DEFINITIONS: Readonly<
  Record<AnimationStateId, AnimationStateDefinition>
> = Object.freeze({
  "sync-idle": {
    id: "sync-idle",
    priority: 10,
    playback: "loop",
    interruptible: true,
    durationMs: null,
  },
  "life-idle": {
    id: "life-idle",
    priority: 10,
    playback: "loop",
    interruptible: true,
    durationMs: null,
  },
  "click-look": {
    id: "click-look",
    priority: 60,
    playback: "one-shot",
    interruptible: true,
    durationMs: 620,
  },
  "click-tilt": {
    id: "click-tilt",
    priority: 64,
    playback: "one-shot",
    interruptible: true,
    durationMs: 680,
  },
  "click-shadow-gather": {
    id: "click-shadow-gather",
    priority: 68,
    playback: "one-shot",
    interruptible: true,
    durationMs: 760,
  },
  "click-vanish": {
    id: "click-vanish",
    priority: 72,
    playback: "one-shot",
    interruptible: true,
    durationMs: 980,
  },
  dragging: {
    id: "dragging",
    priority: 90,
    playback: "protected",
    interruptible: false,
    durationMs: null,
  },
  "mode-transition": {
    id: "mode-transition",
    priority: 100,
    playback: "protected",
    interruptible: false,
    durationMs: null,
  },
});

function idleState(mode: CompanionMode): AnimationStateId {
  return mode === "sync" ? "sync-idle" : "life-idle";
}

function settleToIdle(snapshot: AnimationSnapshot): AnimationSnapshot {
  return {
    ...snapshot,
    stateId: idleState(snapshot.mode),
    stateEndsAt: null,
  };
}

function clickState(clickCount: number): AnimationStateId {
  if (clickCount === 1) {
    return "click-look";
  }
  if (clickCount === 2) {
    return "click-tilt";
  }
  if (clickCount === 3) {
    return "click-shadow-gather";
  }
  return "click-vanish";
}

export function createAnimationSnapshot(
  mode: CompanionMode,
): AnimationSnapshot {
  return {
    mode,
    targetMode: mode,
    stateId: idleState(mode),
    transitionStage: "steady",
    clickCount: 0,
    lastClickAt: null,
    stateEndsAt: null,
    paused: false,
  };
}

export function reduceAnimationSnapshot(
  snapshot: AnimationSnapshot,
  event: AnimationControllerEvent,
): AnimationSnapshot {
  switch (event.type) {
    case "mode-requested": {
      if (
        event.mode === snapshot.mode &&
        snapshot.transitionStage === "steady"
      ) {
        return snapshot;
      }

      if (
        event.mode === snapshot.mode &&
        snapshot.transitionStage === "fade-out"
      ) {
        return settleToIdle({
          ...snapshot,
          targetMode: snapshot.mode,
          transitionStage: "steady",
        });
      }

      if (
        event.mode === snapshot.mode &&
        snapshot.transitionStage === "fade-in"
      ) {
        return snapshot;
      }

      return {
        ...snapshot,
        targetMode: event.mode,
        stateId: "mode-transition",
        transitionStage: "fade-out",
        stateEndsAt: null,
      };
    }
    case "transition-midpoint":
      return snapshot.transitionStage === "fade-out"
        ? {
            ...snapshot,
            mode: snapshot.targetMode,
            transitionStage: "fade-in",
          }
        : snapshot;
    case "transition-complete":
      return snapshot.transitionStage === "fade-in"
        ? settleToIdle({
            ...snapshot,
            transitionStage: "steady",
          })
        : snapshot;
    case "interaction-clicked": {
      if (
        snapshot.paused ||
        snapshot.transitionStage !== "steady" ||
        snapshot.stateId === "dragging"
      ) {
        return snapshot;
      }

      const chained =
        snapshot.lastClickAt !== null &&
        event.at - snapshot.lastClickAt <= CLICK_CHAIN_WINDOW_MS;
      const nextCount = chained
        ? Math.min(4, snapshot.clickCount + 1)
        : 1;
      const nextState = clickState(nextCount);
      const duration =
        ANIMATION_STATE_DEFINITIONS[nextState].durationMs ?? 0;

      return {
        ...snapshot,
        stateId: nextState,
        clickCount: nextCount,
        lastClickAt: event.at,
        stateEndsAt: event.at + duration,
      };
    }
    case "drag-started":
      return snapshot.paused ||
        snapshot.transitionStage !== "steady"
        ? snapshot
        : {
            ...snapshot,
            stateId: "dragging",
            stateEndsAt: null,
          };
    case "drag-ended":
      return snapshot.stateId === "dragging"
        ? settleToIdle(snapshot)
        : snapshot;
    case "state-expired":
      return snapshot.stateEndsAt !== null &&
        event.at >= snapshot.stateEndsAt
        ? settleToIdle(snapshot)
        : snapshot;
    case "pause-changed":
      return {
        ...snapshot,
        paused: event.paused,
      };
  }
}
