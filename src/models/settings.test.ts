import { describe, expect, it } from "vitest";
import {
  DEFAULT_APP_SETTINGS,
  SETTINGS_SCHEMA_VERSION,
} from "../config/defaultSettings";
import {
  mergeAppSettings,
  normalizeAppSettings,
} from "./settings";

describe("normalizeAppSettings", () => {
  it("returns the complete schema v2 defaults for a missing store", () => {
    expect(normalizeAppSettings(undefined)).toEqual(DEFAULT_APP_SETTINGS);
  });

  it("migrates a phase 1 snapshot without losing valid values", () => {
    const migrated = normalizeAppSettings({
      schemaVersion: 1,
      currentCharacterId: "omen",
      currentMode: "life",
      defaultStartMode: "sync",
      petScale: 1.25,
      petOpacity: 0.8,
      petPositionX: -1280,
      petPositionY: 72,
      alwaysOnTop: false,
      positionLocked: true,
      rememberPosition: true,
    });

    expect(migrated).toEqual({
      ...DEFAULT_APP_SETTINGS,
      schemaVersion: SETTINGS_SCHEMA_VERSION,
      currentMode: "life",
      petScale: 1.25,
      petOpacity: 0.8,
      petPositionX: -1280,
      petPositionY: 72,
      alwaysOnTop: false,
      positionLocked: true,
    });
  });

  it("repairs corrupt values without discarding unrelated valid values", () => {
    const repaired = normalizeAppSettings({
      currentCharacterId: "../../OMEN",
      currentMode: "automatic",
      defaultStartMode: "last-used",
      petScale: 9,
      petOpacity: -4,
      petPositionX: 420,
      petPositionY: "invalid",
      alwaysOnTop: false,
      positionLocked: "yes",
      rememberPosition: false,
      launchAtStartup: true,
      effectsLevel: "cinematic",
      frameRateLimit: 999,
    });

    expect(repaired).toEqual({
      ...DEFAULT_APP_SETTINGS,
      defaultStartMode: "last-used",
      petOpacity: 0.25,
      alwaysOnTop: false,
      rememberPosition: false,
      launchAtStartup: true,
    });
  });

  it("rounds continuous settings to their supported steps", () => {
    const normalized = normalizeAppSettings({
      ...DEFAULT_APP_SETTINGS,
      petOpacity: 0.83,
      keyboardSensitivity: 1.27,
      mouseSensitivity: 5,
    });

    expect(normalized.petOpacity).toBe(0.85);
    expect(normalized.keyboardSensitivity).toBe(1.25);
    expect(normalized.mouseSensitivity).toBe(2);
  });

  it("keeps the no-tray startup lifecycle invariants enabled", () => {
    const normalized = normalizeAppSettings({
      showPetOnStartup: false,
      continueRunningOnSettingsClose: false,
      trayEnabled: true,
    });

    expect(normalized.showPetOnStartup).toBe(true);
    expect(normalized.continueRunningOnSettingsClose).toBe(true);
    expect(normalized.trayEnabled).toBe(false);
  });

  it("validates times and real calendar dates", () => {
    const normalized = normalizeAppSettings({
      ...DEFAULT_APP_SETTINGS,
      wakeTime: "24:00",
      breakfastTime: "07:05",
      lunchTime: "7:30",
      dinnerCompletedDate: "2024-02-29",
      lunchCompletedDate: "2025-02-29",
      breakfastCompletedDate: "not-a-date",
    });

    expect(normalized.wakeTime).toBe(DEFAULT_APP_SETTINGS.wakeTime);
    expect(normalized.breakfastTime).toBe("07:05");
    expect(normalized.lunchTime).toBe(DEFAULT_APP_SETTINGS.lunchTime);
    expect(normalized.dinnerCompletedDate).toBe("2024-02-29");
    expect(normalized.lunchCompletedDate).toBeNull();
    expect(normalized.breakfastCompletedDate).toBeNull();
  });

  it("clamps activity weights and rejects an all-zero pair", () => {
    const clamped = normalizeAppSettings({
      ...DEFAULT_APP_SETTINGS,
      studyWeight: 140.4,
      gamingWeight: -8,
      coffeeFrequency: 11.8,
    });
    const reset = normalizeAppSettings({
      ...DEFAULT_APP_SETTINGS,
      studyWeight: 0,
      gamingWeight: 0,
    });

    expect(clamped.studyWeight).toBe(100);
    expect(clamped.gamingWeight).toBe(0);
    expect(clamped.coffeeFrequency).toBe(10);
    expect(reset.studyWeight).toBe(DEFAULT_APP_SETTINGS.studyWeight);
    expect(reset.gamingWeight).toBe(DEFAULT_APP_SETTINGS.gamingWeight);
  });

  it("preserves negative physical coordinates for secondary monitors", () => {
    const settings = normalizeAppSettings({
      ...DEFAULT_APP_SETTINGS,
      petPositionX: -1280.4,
      petPositionY: -24.6,
    });

    expect(settings.petPositionX).toBe(-1280);
    expect(settings.petPositionY).toBe(-25);
  });

  it("requires both physical coordinates to be valid", () => {
    const settings = normalizeAppSettings({
      ...DEFAULT_APP_SETTINGS,
      petPositionX: 320,
      petPositionY: Number.POSITIVE_INFINITY,
    });

    expect(settings.petPositionX).toBeNull();
    expect(settings.petPositionY).toBeNull();
  });

  it("drops unknown fields while retaining the complete known schema", () => {
    const settings = normalizeAppSettings({
      ...DEFAULT_APP_SETTINGS,
      unknownFutureFlag: true,
    });

    expect(settings).toEqual(DEFAULT_APP_SETTINGS);
    expect("unknownFutureFlag" in settings).toBe(false);
  });
});

describe("mergeAppSettings", () => {
  it("updates a partial setting while retaining the rest", () => {
    const next = mergeAppSettings(
      normalizeAppSettings(DEFAULT_APP_SETTINGS),
      { positionLocked: true, petPositionX: 320, petPositionY: 180 },
    );

    expect(next.positionLocked).toBe(true);
    expect(next.petPositionX).toBe(320);
    expect(next.petPositionY).toBe(180);
    expect(next.currentCharacterId).toBe("omen");
    expect(next.frameRateLimit).toBe(60);
  });
});
