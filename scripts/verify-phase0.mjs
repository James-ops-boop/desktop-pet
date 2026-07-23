import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const tauriConfig = JSON.parse(
  readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8"),
);
const capability = JSON.parse(
  readFileSync(
    new URL("../src-tauri/capabilities/phase0.json", import.meta.url),
    "utf8",
  ),
);
const cargoManifest = readFileSync(
  new URL("../src-tauri/Cargo.toml", import.meta.url),
  "utf8",
);

const windows = new Map(
  tauriConfig.app.windows.map((windowConfig) => [
    windowConfig.label,
    windowConfig,
  ]),
);
const pet = windows.get("pet");
const settings = windows.get("settings");

assert.equal(windows.size, 2, "phase 0 must create exactly two windows");
assert.ok(pet, "pet window configuration is required");
assert.ok(settings, "settings window configuration is required");

assert.equal(pet.visible, true, "pet must be visible on first launch");
assert.equal(pet.transparent, true, "pet must use a transparent native window");
assert.equal(pet.decorations, false, "pet must be borderless");
assert.equal(pet.shadow, false, "pet must not retain a native frame shadow");
assert.equal(pet.alwaysOnTop, true, "pet must be always on top");
assert.equal(pet.skipTaskbar, true, "pet must be omitted from the taskbar");

assert.equal(
  settings.visible,
  false,
  "settings must be created but hidden on first launch",
);
assert.equal(
  settings.skipTaskbar,
  false,
  "settings must have a normal taskbar presence when shown",
);

assert.deepEqual(
  [...capability.windows].sort(),
  ["pet", "settings"],
  "the phase 0 capability must target both windows",
);
assert.ok(
  capability.permissions.includes("store:default"),
  "the official Store permission set is required",
);
assert.match(
  cargoManifest,
  /tauri-plugin-single-instance\s*=\s*"2"/,
  "the official single-instance plugin is required",
);
assert.match(
  cargoManifest,
  /tauri-plugin-store\s*=\s*"2"/,
  "the official Store plugin is required",
);

console.log("Phase 0 configuration verification passed.");
