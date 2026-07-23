import { describe, expect, it } from "vitest";
import {
  areJsonValuesEquivalent,
  shouldApplySettingsSnapshot,
} from "./settingsSnapshot";

describe("shouldApplySettingsSnapshot", () => {
  it("accepts a newer or matching persisted snapshot", () => {
    expect(shouldApplySettingsSnapshot(4, 5)).toBe(true);
    expect(shouldApplySettingsSnapshot(5, 5)).toBe(true);
  });

  it("rejects a stale response that arrives after a newer event", () => {
    expect(shouldApplySettingsSnapshot(8, 7)).toBe(false);
  });

  it("compares JSON objects independently of their key order", () => {
    expect(
      areJsonValuesEquivalent(
        { mode: "sync", nested: { scale: 1, locked: false } },
        { nested: { locked: false, scale: 1 }, mode: "sync" },
      ),
    ).toBe(true);
  });

  it("still detects a semantic settings change", () => {
    expect(
      areJsonValuesEquivalent(
        { scale: 1, values: [30, 60] },
        { values: [30, 120], scale: 1 },
      ),
    ).toBe(false);
  });
});
