import { describe, expect, it } from "vitest";
import {
  createAnimationSnapshot,
  reduceAnimationSnapshot,
} from "./animationController";

describe("animation controller", () => {
  it("switches modes through fade-out and fade-in without mixing visuals", () => {
    let state = createAnimationSnapshot("sync");
    state = reduceAnimationSnapshot(state, {
      type: "mode-requested",
      mode: "life",
    });
    expect(state).toMatchObject({
      mode: "sync",
      targetMode: "life",
      stateId: "mode-transition",
      transitionStage: "fade-out",
    });

    state = reduceAnimationSnapshot(state, {
      type: "transition-midpoint",
    });
    expect(state).toMatchObject({
      mode: "life",
      transitionStage: "fade-in",
    });

    state = reduceAnimationSnapshot(state, {
      type: "transition-complete",
    });
    expect(state).toMatchObject({
      mode: "life",
      targetMode: "life",
      stateId: "life-idle",
      transitionStage: "steady",
    });
  });

  it("cancels an outgoing transition when the user selects the visible mode", () => {
    const outgoing = reduceAnimationSnapshot(
      createAnimationSnapshot("sync"),
      { type: "mode-requested", mode: "life" },
    );
    const cancelled = reduceAnimationSnapshot(outgoing, {
      type: "mode-requested",
      mode: "sync",
    });

    expect(cancelled).toMatchObject({
      mode: "sync",
      targetMode: "sync",
      stateId: "sync-idle",
      transitionStage: "steady",
    });
  });

  it("advances the four-step click response and returns to mode idle", () => {
    let state = createAnimationSnapshot("sync");
    const expected = [
      "click-look",
      "click-tilt",
      "click-shadow-gather",
      "click-vanish",
    ];

    expected.forEach((stateId, index) => {
      state = reduceAnimationSnapshot(state, {
        type: "interaction-clicked",
        at: 1_000 + index * 300,
      });
      expect(state.stateId).toBe(stateId);
    });

    state = reduceAnimationSnapshot(state, {
      type: "state-expired",
      at: state.stateEndsAt ?? 0,
    });
    expect(state.stateId).toBe("sync-idle");
  });

  it("protects mode transitions and drag feedback from click interruption", () => {
    const transition = reduceAnimationSnapshot(
      createAnimationSnapshot("sync"),
      { type: "mode-requested", mode: "life" },
    );
    expect(
      reduceAnimationSnapshot(transition, {
        type: "interaction-clicked",
        at: 100,
      }),
    ).toEqual(transition);

    const dragging = reduceAnimationSnapshot(
      createAnimationSnapshot("sync"),
      { type: "drag-started" },
    );
    expect(
      reduceAnimationSnapshot(dragging, {
        type: "interaction-clicked",
        at: 100,
      }),
    ).toEqual(dragging);
    expect(
      reduceAnimationSnapshot(dragging, { type: "drag-ended" }).stateId,
    ).toBe("sync-idle");
  });
});
