import type {
  AppSettings,
  CompanionMode,
  DefaultStartMode,
  EffectsLevel,
} from "../models/settings";

export const SETTINGS_SCHEMA_VERSION = 2;

export const SUPPORTED_MODES: readonly CompanionMode[] = ["sync", "life"];

export const DEFAULT_START_MODES: readonly DefaultStartMode[] = [
  "sync",
  "life",
  "last-used",
];

export const PET_SCALE_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5] as const;

export const FRAME_RATE_OPTIONS = [30, 45, 60, 120] as const;

export const EFFECTS_LEVELS: readonly EffectsLevel[] = [
  "low",
  "medium",
  "high",
];

export const DEFAULT_APP_SETTINGS: Readonly<AppSettings> = Object.freeze({
  schemaVersion: SETTINGS_SCHEMA_VERSION,
  currentCharacterId: "omen",
  currentMode: "sync",
  defaultStartMode: "sync",
  petScale: 1,
  petOpacity: 1,
  petPositionX: null,
  petPositionY: null,
  alwaysOnTop: true,
  positionLocked: false,
  rememberPosition: true,

  launchAtStartup: false,
  showPetOnStartup: true,
  startupAnimationEnabled: true,
  continueRunningOnSettingsClose: true,
  trayEnabled: false,

  keyboardEnabled: true,
  mouseMoveEnabled: true,
  mouseClickEnabled: true,
  mouseWheelEnabled: true,
  keyboardSensitivity: 1,
  mouseSensitivity: 1,
  highFrequencyAnimationEnabled: true,
  idleAnimationEnabled: true,

  wakeTime: "07:00",
  breakfastTime: "07:30",
  lunchTime: "12:00",
  dinnerTime: "18:30",
  sleepTime: "23:30",
  napEnabled: true,
  studyWeight: 60,
  gamingWeight: 40,
  coffeeFrequency: 2,
  breakfastCompletedDate: null,
  lunchCompletedDate: null,
  dinnerCompletedDate: null,

  frameRateLimit: 60,
  reduceFrameRateWhenIdle: true,
  effectsLevel: "medium",
  shadowEffectsEnabled: true,
  lowPerformanceMode: false,
  reduceAnimationInFullscreen: true,
});
