import {
  DEFAULT_APP_SETTINGS,
  PET_SCALE_OPTIONS,
  SETTINGS_SCHEMA_VERSION,
  SUPPORTED_MODES,
} from "../config/defaultSettings";

export type CompanionMode = "sync" | "life";

export interface AppSettings {
  schemaVersion: number;
  currentCharacterId: string;
  currentMode: CompanionMode;
  defaultStartMode: CompanionMode;
  petScale: number;
  petOpacity: number;
  petPositionX: number | null;
  petPositionY: number | null;
  alwaysOnTop: boolean;
  positionLocked: boolean;
  rememberPosition: boolean;
}

export type AppSettingsPatch = Partial<
  Omit<AppSettings, "schemaVersion">
>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validMode(value: unknown, fallback: CompanionMode): CompanionMode {
  return SUPPORTED_MODES.includes(value as CompanionMode)
    ? (value as CompanionMode)
    : fallback;
}

function validCharacterId(value: unknown): string {
  if (typeof value !== "string") {
    return DEFAULT_APP_SETTINGS.currentCharacterId;
  }

  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9-]{1,64}$/.test(normalized)
    ? normalized
    : DEFAULT_APP_SETTINGS.currentCharacterId;
}

function validScale(value: unknown): number {
  return PET_SCALE_OPTIONS.includes(
    value as (typeof PET_SCALE_OPTIONS)[number],
  )
    ? (value as number)
    : DEFAULT_APP_SETTINGS.petScale;
}

function validOpacity(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_APP_SETTINGS.petOpacity;
  }

  return Math.min(1, Math.max(0.25, value));
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

export function normalizeAppSettings(candidate: unknown): AppSettings {
  const source = isRecord(candidate) ? candidate : {};
  const positionX = validPosition(source.petPositionX);
  const positionY = validPosition(source.petPositionY);
  const hasCompletePosition = positionX !== null && positionY !== null;

  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    currentCharacterId: validCharacterId(source.currentCharacterId),
    currentMode: validMode(
      source.currentMode,
      DEFAULT_APP_SETTINGS.currentMode,
    ),
    defaultStartMode: validMode(
      source.defaultStartMode,
      DEFAULT_APP_SETTINGS.defaultStartMode,
    ),
    petScale: validScale(source.petScale),
    petOpacity: validOpacity(source.petOpacity),
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
  };
}

export function mergeAppSettings(
  current: AppSettings,
  patch: AppSettingsPatch,
): AppSettings {
  return normalizeAppSettings({ ...current, ...patch });
}
