import type { CharacterActionId } from "./character";
import type { CompanionMode } from "./settings";

export const ANIMATION_STATE_IDS = [
  "sync-idle",
  "life-idle",
  "click-look",
  "click-tilt",
  "click-shadow-gather",
  "click-vanish",
  "dragging",
  "mode-transition",
] as const;

export type AnimationStateId = (typeof ANIMATION_STATE_IDS)[number];
export type AnimationTransitionStage = "steady" | "fade-out" | "fade-in";
export type AnimationPlaybackKind = "loop" | "one-shot" | "protected";

export interface AnimationStateDefinition {
  id: AnimationStateId;
  priority: number;
  playback: AnimationPlaybackKind;
  interruptible: boolean;
  durationMs: number | null;
}

export interface AnimationSnapshot {
  mode: CompanionMode;
  targetMode: CompanionMode;
  stateId: AnimationStateId;
  transitionStage: AnimationTransitionStage;
  clickCount: number;
  lastClickAt: number | null;
  stateEndsAt: number | null;
  paused: boolean;
}

export type AnimationControllerEvent =
  | { type: "mode-requested"; mode: CompanionMode }
  | { type: "transition-midpoint" }
  | { type: "transition-complete" }
  | { type: "interaction-clicked"; at: number }
  | { type: "drag-started" }
  | { type: "drag-ended" }
  | { type: "state-expired"; at: number }
  | { type: "pause-changed"; paused: boolean };

export type PetAssetLayerId =
  | "character"
  | "desk"
  | "keyboard"
  | "mouse"
  | "book"
  | "coffee"
  | "game-device"
  | "meal";

export interface PetAssetLayer {
  id: PetAssetLayerId;
  src: string;
  zIndex: number;
}

export interface CharacterAnimationPack {
  schemaVersion: 1;
  characterId: string;
  renderer: "layered-image";
  layers: Readonly<Record<PetAssetLayerId, PetAssetLayer>>;
  modes: Readonly<
    Record<
      CompanionMode,
      {
        idleState: AnimationStateId;
        visibleLayers: readonly PetAssetLayerId[];
      }
    >
  >;
  previewResources: Readonly<Record<CharacterActionId, string>>;
}
