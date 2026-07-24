import {
  DEFAULT_APP_SETTINGS,
  DEFAULT_START_MODES,
  EFFECTS_LEVELS,
  FRAME_RATE_OPTIONS,
  PET_SCALE_OPTIONS,
  SETTINGS_SCHEMA_VERSION,
  SUPPORTED_MODES,
} from "../config/defaultSettings";
import { normalizeCurrentCharacterId } from "../characters/registry";

export type CompanionMode = "sync" | "life";
export type DefaultStartMode = CompanionMode | "last-used";
export type EffectsLevel = "low" | "medium" | "high";

export interface AppSettings {
  schemaVersion: number;
  currentCharacterId: string;
  currentMode: CompanionMode;
  defaultStartMode: DefaultStartMode;
  petScale: number;
  petOpacity: number;
  petPositionX: number | null;
  petPositionY: number | null;
  alwaysOnTop: boolean;
  positionLocked: boolean;
  rememberPosition: boolean;

  launchAtStartup: boolean;
  showPetOnStartup: boolean;
  startupAnimationEnabled: boolean;
  continueRunningOnSettingsClose: boolean;
  trayEnabled: boolean;

  keyboardEnabled: boolean;
  mouseMoveEnabled: boolean;
  mouseClickEnabled: boolean;
  mouseWheelEnabled: boolean;
  keyboardSensitivity: number;
  mouseSensitivity: number;
  highFrequencyAnimationEnabled: boolean;
  idleAnimationEnabled: boolean;

  wakeTime: string;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  sleepTime: string;
  napEnabled: boolean;
  studyWeight: number;
  gamingWeight: number;
  coffeeFrequency: number;
  breakfastCompletedDate: string | null;
  lunchCompletedDate: string | null;
  dinnerCompletedDate: string | null;

  frameRateLimit: number;
  reduceFrameRateWhenIdle: boolean;
  effectsLevel: EffectsLevel;
  shadowEffectsEnabled: boolean;
  lowPerformanceMode: boolean;
  reduceAnimationInFullscreen: boolean;
}

export type AppSettingsPatch = Partial<
  Omit<AppSettings, "schemaVersion">
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function validScale(value: unknown): number {
  return PET_SCALE_OPTIONS.includes(
    value as (typeof PET_SCALE_OPTIONS)[number],
  )
    ? (value as number)
    : DEFAULT_APP_SETTINGS.petScale;
}

function validSteppedNumber(
  value: unknown,
  min: number,
  max: number,
  step: number,
  fallback: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  const clamped = Math.min(max, Math.max(min, value));
  return Number((Math.round(clamped / step) * step).toFixed(4));
}

function validInteger(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function validPosition(value: unknown): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    Math.abs(value) > 100_000
  ) {
    return null;
  }

  return Math.round(value);
}

function validBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function validTime(value: unknown, fallback: string): string {
  return typeof value === "string" &&
    /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)
    ? value
    : fallback;
}

function validDate(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
    ? value
    : null;
}

function validFrameRate(value: unknown): number {
  return FRAME_RATE_OPTIONS.includes(
    value as (typeof FRAME_RATE_OPTIONS)[number],
  )
    ? (value as number)
    : DEFAULT_APP_SETTINGS.frameRateLimit;
}

export function normalizeAppSettings(candidate: unknown): AppSettings {
  const source = isRecord(candidate) ? candidate : {};
  const positionX = validPosition(source.petPositionX);
  const positionY = validPosition(source.petPositionY);
  const hasCompletePosition = positionX !== null && positionY !== null;
  let studyWeight = validInteger(
    source.studyWeight,
    0,
    100,
    DEFAULT_APP_SETTINGS.studyWeight,
  );
  let gamingWeight = validInteger(
    source.gamingWeight,
    0,
    100,
    DEFAULT_APP_SETTINGS.gamingWeight,
  );

  if (studyWeight === 0 && gamingWeight === 0) {
    studyWeight = DEFAULT_APP_SETTINGS.studyWeight;
    gamingWeight = DEFAULT_APP_SETTINGS.gamingWeight;
  }

  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    currentCharacterId: normalizeCurrentCharacterId(
      source.currentCharacterId,
    ),
    currentMode: validEnum(
      source.currentMode,
      SUPPORTED_MODES,
      DEFAULT_APP_SETTINGS.currentMode,
    ),
    defaultStartMode: validEnum(
      source.defaultStartMode,
      DEFAULT_START_MODES,
      DEFAULT_APP_SETTINGS.defaultStartMode,
    ),
    petScale: validScale(source.petScale),
    petOpacity: validSteppedNumber(
      source.petOpacity,
      0.25,
      1,
      0.05,
      DEFAULT_APP_SETTINGS.petOpacity,
    ),
    petPositionX: hasCompletePosition ? positionX : null,
    petPositionY: hasCompletePosition ? positionY : null,
    alwaysOnTop: validBoolean(
      source.alwaysOnTop,
      DEFAULT_APP_SETTINGS.alwaysOnTop,
    ),
    positionLocked: validBoolean(
      source.positionLocked,
      DEFAULT_APP_SETTINGS.positionLocked,
    ),
    rememberPosition: validBoolean(
      source.rememberPosition,
      DEFAULT_APP_SETTINGS.rememberPosition,
    ),

    launchAtStartup: validBoolean(
      source.launchAtStartup,
      DEFAULT_APP_SETTINGS.launchAtStartup,
    ),
    showPetOnStartup: DEFAULT_APP_SETTINGS.showPetOnStartup,
    startupAnimationEnabled: validBoolean(
      source.startupAnimationEnabled,
      DEFAULT_APP_SETTINGS.startupAnimationEnabled,
    ),
    continueRunningOnSettingsClose:
      DEFAULT_APP_SETTINGS.continueRunningOnSettingsClose,
    trayEnabled: DEFAULT_APP_SETTINGS.trayEnabled,

    keyboardEnabled: validBoolean(
      source.keyboardEnabled,
      DEFAULT_APP_SETTINGS.keyboardEnabled,
    ),
    mouseMoveEnabled: validBoolean(
      source.mouseMoveEnabled,
      DEFAULT_APP_SETTINGS.mouseMoveEnabled,
    ),
    mouseClickEnabled: validBoolean(
      source.mouseClickEnabled,
      DEFAULT_APP_SETTINGS.mouseClickEnabled,
    ),
    mouseWheelEnabled: validBoolean(
      source.mouseWheelEnabled,
      DEFAULT_APP_SETTINGS.mouseWheelEnabled,
    ),
    keyboardSensitivity: validSteppedNumber(
      source.keyboardSensitivity,
      0.25,
      2,
      0.05,
      DEFAULT_APP_SETTINGS.keyboardSensitivity,
    ),
    mouseSensitivity: validSteppedNumber(
      source.mouseSensitivity,
      0.25,
      2,
      0.05,
      DEFAULT_APP_SETTINGS.mouseSensitivity,
    ),
    highFrequencyAnimationEnabled: validBoolean(
      source.highFrequencyAnimationEnabled,
      DEFAULT_APP_SETTINGS.highFrequencyAnimationEnabled,
    ),
    idleAnimationEnabled: validBoolean(
      source.idleAnimationEnabled,
      DEFAULT_APP_SETTINGS.idleAnimationEnabled,
    ),

    wakeTime: validTime(
      source.wakeTime,
      DEFAULT_APP_SETTINGS.wakeTime,
    ),
    breakfastTime: validTime(
      source.breakfastTime,
      DEFAULT_APP_SETTINGS.breakfastTime,
    ),
    lunchTime: validTime(
      source.lunchTime,
      DEFAULT_APP_SETTINGS.lunchTime,
    ),
    dinnerTime: validTime(
      source.dinnerTime,
      DEFAULT_APP_SETTINGS.dinnerTime,
    ),
    sleepTime: validTime(
      source.sleepTime,
      DEFAULT_APP_SETTINGS.sleepTime,
    ),
    napEnabled: validBoolean(
      source.napEnabled,
      DEFAULT_APP_SETTINGS.napEnabled,
    ),
    studyWeight,
    gamingWeight,
    coffeeFrequency: validInteger(
      source.coffeeFrequency,
      0,
      10,
      DEFAULT_APP_SETTINGS.coffeeFrequency,
    ),
    breakfastCompletedDate: validDate(source.breakfastCompletedDate),
    lunchCompletedDate: validDate(source.lunchCompletedDate),
    dinnerCompletedDate: validDate(source.dinnerCompletedDate),

    frameRateLimit: validFrameRate(source.frameRateLimit),
    reduceFrameRateWhenIdle: validBoolean(
      source.reduceFrameRateWhenIdle,
      DEFAULT_APP_SETTINGS.reduceFrameRateWhenIdle,
    ),
    effectsLevel: validEnum(
      source.effectsLevel,
      EFFECTS_LEVELS,
      DEFAULT_APP_SETTINGS.effectsLevel,
    ),
    shadowEffectsEnabled: validBoolean(
      source.shadowEffectsEnabled,
      DEFAULT_APP_SETTINGS.shadowEffectsEnabled,
    ),
    lowPerformanceMode: validBoolean(
      source.lowPerformanceMode,
      DEFAULT_APP_SETTINGS.lowPerformanceMode,
    ),
    reduceAnimationInFullscreen: validBoolean(
      source.reduceAnimationInFullscreen,
      DEFAULT_APP_SETTINGS.reduceAnimationInFullscreen,
    ),
  };
}

export function mergeAppSettings(
  current: AppSettings,
  patch: AppSettingsPatch,
): AppSettings {
  return normalizeAppSettings({ ...current, ...patch });
}
