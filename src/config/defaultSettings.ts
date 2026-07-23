import type { AppSettings, CompanionMode } from "../models/settings";

export const SETTINGS_SCHEMA_VERSION = 1;

export const SUPPORTED_MODES: readonly CompanionMode[] = ["sync", "life"];

export const PET_SCALE_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5] as const;

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
});
