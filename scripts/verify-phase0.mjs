import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const tauriConfig = JSON.parse(
  readFileSync(new URL("../src-tauri/tauri.conf.json", import.meta.url), "utf8"),
);
const petCapability = JSON.parse(
  readFileSync(
    new URL("../src-tauri/capabilities/pet.json", import.meta.url),
    "utf8",
  ),
);
const settingsCapability = JSON.parse(
  readFileSync(
    new URL("../src-tauri/capabilities/settings.json", import.meta.url),
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
  petCapability.windows,
  ["pet"],
  "the pet capability must target the pet window",
);
for (const permission of [
  "store:allow-load",
  "store:allow-get",
  "store:allow-set",
  "store:allow-save",
]) {
  assert.ok(
    petCapability.permissions.includes(permission),
    `the pet requires ${permission}`,
  );
}
assert.deepEqual(
  settingsCapability.windows,
  ["settings"],
  "the settings capability must target the settings window",
);
for (const permission of [
  "store:allow-load",
  "store:allow-get",
  "store:allow-set",
  "store:allow-save",
]) {
  assert.ok(
    settingsCapability.permissions.includes(permission),
    `the settings window requires ${permission}`,
  );
}
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
