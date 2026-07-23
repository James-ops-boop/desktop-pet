import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function readJson(path) {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
}

function readText(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

const tauriConfig = readJson("../src-tauri/tauri.conf.json");
const petCapability = readJson("../src-tauri/capabilities/pet.json");
const settingsCapability = readJson(
  "../src-tauri/capabilities/settings.json",
);
const rustCommands = readText("../src-tauri/src/commands/window.rs");
const rustWindows = readText("../src-tauri/src/windows/mod.rs");
const rustSingleInstance = readText(
  "../src-tauri/src/single_instance/mod.rs",
);
const petController = readText(
  "../src/windows/pet/usePetWindowController.ts",
);
const petWindow = readText("../src/windows/pet/PetWindow.tsx");
const petMenu = readText("../src/windows/pet/petContextMenu.ts");
const settingsStore = readText(
  "../src/services/settings-store/settingsStore.ts",
);

const windows = new Map(
  tauriConfig.app.windows.map((windowConfig) => [
    windowConfig.label,
    windowConfig,
  ]),
);

assert.equal(
  windows.get("pet")?.visible,
  true,
  "the pet must be visible on launch",
);
assert.equal(
  windows.get("settings")?.visible,
  false,
  "settings must remain hidden on launch",
);
assert.deepEqual(
  [...tauriConfig.app.security.capabilities].sort(),
  ["pet", "settings"],
  "both window-specific capabilities must be enabled",
);
assert.ok(
  petCapability.permissions.includes(
    "core:window:allow-start-dragging",
  ),
  "pet drag permission is required",
);
assert.ok(
  petCapability.permissions.includes("core:window:allow-set-position"),
  "pet position restore permission is required",
);
assert.ok(
  !settingsCapability.permissions.includes(
    "core:window:allow-start-dragging",
  ),
  "settings must not inherit the pet-only drag permission",
);
for (const capability of [petCapability, settingsCapability]) {
  assert.ok(
    !capability.permissions.includes("store:default"),
    "window capabilities must not inherit destructive Store commands",
  );
  for (const permission of [
    "store:allow-load",
    "store:allow-get",
    "store:allow-set",
    "store:allow-save",
  ]) {
    assert.ok(
      capability.permissions.includes(permission),
      `settings persistence requires ${permission}`,
    );
  }
}

for (const command of [
  "show_settings",
  "hide_settings",
  "minimize_settings",
  "exit_application",
]) {
  assert.match(
    rustCommands,
    new RegExp(`fn\\s+${command}\\b`),
    `Rust command ${command} is required`,
  );
}

assert.match(
  rustWindows,
  /CloseRequested/,
  "settings close requests must be intercepted",
);
assert.match(
  rustWindows,
  /prevent_close\(\)/,
  "settings close must be prevented before hiding",
);
assert.match(
  rustSingleInstance,
  /reveal_settings/,
  "a second instance must reveal the existing settings window",
);

assert.match(
  petController,
  /startDragging\(\)/,
  "the pet must start a native Tauri window drag",
);
assert.match(
  petController,
  /onMoved/,
  "the pet must listen for native move events",
);
assert.match(
  petController,
  /new PhysicalPosition/,
  "saved physical coordinates must restore without DPI unit conversion",
);
assert.match(
  petController,
  /positionLocked/,
  "position lock must prevent drag initiation",
);
assert.match(
  petWindow,
  /onContextMenu/,
  "the pet must expose a right-click entry point",
);
assert.match(
  petMenu,
  /Menu\.new/,
  "the pet must use a native context menu",
);
assert.match(
  petMenu,
  /打开主设置/,
  "the native context menu must open settings",
);
assert.match(
  petMenu,
  /退出应用/,
  "the native context menu must expose the explicit exit path",
);

assert.match(
  settingsStore,
  /settings\.json/,
  "the unified store must use settings.json",
);
assert.match(
  settingsStore,
  /normalizeAppSettings/,
  "stored settings must be validated before use",
);
assert.match(
  settingsStore,
  /store\.save\(\)/,
  "settings writes must explicitly reach disk",
);

console.log("Phase 1 structure verification passed.");
