import { describe, expect, it } from "vitest";
import { DEFAULT_APP_SETTINGS } from "../config/defaultSettings";
import {
  mergeAppSettings,
  normalizeAppSettings,
} from "./settings";

describe("normalizeAppSettings", () => {
  it("falls back to safe defaults for a missing settings file", () => {
    expect(normalizeAppSettings(undefined)).toEqual(DEFAULT_APP_SETTINGS);
  });

  it("repairs corrupt values without discarding valid values", () => {
    expect(
      normalizeAppSettings({
        currentCharacterId: "../../OMEN",
        currentMode: "automatic",
        defaultStartMode: "life",
        petScale: 9,
        petOpacity: -4,
        petPositionX: 420,
        petPositionY: "invalid",
        alwaysOnTop: false,
        positionLocked: "yes",
        rememberPosition: false,
      }),
    ).toEqual({
      ...DEFAULT_APP_SETTINGS,
      defaultStartMode: "life",
      petOpacity: 0.25,
      alwaysOnTop: false,
      rememberPosition: false,
    });
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
  });
});
