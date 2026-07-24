import { useCallback, useEffect, useReducer } from "react";
import type { CompanionMode } from "../../models/settings";
import {
  createAnimationSnapshot,
  MODE_FADE_IN_MS,
  MODE_FADE_OUT_MS,
  reduceAnimationSnapshot,
} from "./animationController";

export function useAnimationController(targetMode: CompanionMode) {
  const [snapshot, dispatch] = useReducer(
    reduceAnimationSnapshot,
    targetMode,
    createAnimationSnapshot,
  );

  useEffect(() => {
    dispatch({ type: "mode-requested", mode: targetMode });
  }, [targetMode]);

  useEffect(() => {
    if (snapshot.transitionStage === "fade-out") {
      const timer = window.setTimeout(() => {
        dispatch({ type: "transition-midpoint" });
      }, MODE_FADE_OUT_MS);
      return () => window.clearTimeout(timer);
    }

    if (snapshot.transitionStage === "fade-in") {
      const timer = window.setTimeout(() => {
        dispatch({ type: "transition-complete" });
      }, MODE_FADE_IN_MS);
      return () => window.clearTimeout(timer);
    }
  }, [snapshot.transitionStage, snapshot.targetMode]);

  useEffect(() => {
    if (snapshot.paused || snapshot.stateEndsAt === null) {
      return;
    }

    const delay = Math.max(0, snapshot.stateEndsAt - Date.now());
    const timer = window.setTimeout(() => {
      dispatch({ type: "state-expired", at: Date.now() });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [snapshot.paused, snapshot.stateEndsAt]);

  const triggerClick = useCallback(() => {
    dispatch({ type: "interaction-clicked", at: Date.now() });
  }, []);
  const beginDrag = useCallback(() => {
    dispatch({ type: "drag-started" });
  }, []);
  const endDrag = useCallback(() => {
    dispatch({ type: "drag-ended" });
  }, []);
  const setPaused = useCallback((paused: boolean) => {
    dispatch({ type: "pause-changed", paused });
  }, []);

  return {
    snapshot,
    triggerClick,
    beginDrag,
    endDrag,
    setPaused,
  };
}
