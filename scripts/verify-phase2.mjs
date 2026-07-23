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
const cargoManifest = readText("../src-tauri/Cargo.toml");
const rustSettings = readText("../src-tauri/src/settings/mod.rs");
const rustStartup = readText("../src-tauri/src/commands/startup.rs");
const settingsModel = readText("../src/models/settings.ts");
const defaults = readText("../src/config/defaultSettings.ts");
const settingsRepository = readText(
  "../src/services/settings-store/settingsStore.ts",
);
const settingsWindow = readText(
  "../src/windows/settings/SettingsWindow.tsx",
);
const navigation = readText(
  "../src/windows/settings/settingsNavigation.ts",
);
const petController = readText(
  "../src/windows/pet/usePetWindowController.ts",
);
const petWindow = readText("../src/windows/pet/PetWindow.tsx");
const petMenu = readText("../src/windows/pet/petContextMenu.ts");

const windows = new Map(
  tauriConfig.app.windows.map((windowConfig) => [
    windowConfig.label,
    windowConfig,
  ]),
);

assert.ok(
  windows.get("settings")?.width >= 920,
  "the settings shell needs enough initial width for the sidebar",
);
assert.ok(
  windows.get("settings")?.height >= 640,
  "the settings shell needs enough initial height for page content",
);

for (const page of [
  "general",
  "pet",
  "sync-mode",
  "life-mode",
  "characters",
  "performance",
  "about",
]) {
  assert.match(
    navigation,
    new RegExp(`id:\\s*"${page}"`),
    `navigation entry ${page} is required`,
  );
}

for (const field of [
  "launchAtStartup",
  "showPetOnStartup",
  "startupAnimationEnabled",
  "continueRunningOnSettingsClose",
  "trayEnabled",
  "keyboardEnabled",
  "wakeTime",
  "frameRateLimit",
  "effectsLevel",
  "lowPerformanceMode",
]) {
  assert.match(
    settingsModel,
    new RegExp(`\\b${field}\\b`),
    `schema v2 field ${field} is required`,
  );
}
assert.match(
  defaults,
  /SETTINGS_SCHEMA_VERSION\s*=\s*2/,
  "phase 2 must migrate settings to schema version 2",
);

assert.match(
  rustSettings,
  /Mutex<\(\)>/,
  "settings updates must be serialized across both webviews",
);
assert.match(
  rustSettings,
  /AtomicU64/,
  "settings snapshots need a monotonic revision",
);
assert.match(
  rustSettings,
  /store\.save\(\)/,
  "settings events must follow an explicit disk save",
);
assert.match(
  settingsRepository,
  /SETTINGS_CHANGED_EVENT/,
  "both windows must subscribe to persisted settings snapshots",
);
assert.match(
  settingsRepository,
  /expectedRevision/,
  "schema repair must use revision-aware compare-and-swap",
);
assert.match(
  rustSettings,
  /settings revision conflict/,
  "stale full replacements must be rejected by the Rust service",
);

for (const permission of [
  "core:window:allow-set-size",
  "core:window:allow-set-always-on-top",
]) {
  assert.ok(
    petCapability.permissions.includes(permission),
    `the pet requires ${permission}`,
  );
}
assert.match(
  petController,
  /new LogicalSize/,
  "pet scale must resize the native logical window",
);
assert.match(
  petController,
  /setAlwaysOnTop/,
  "always-on-top must be applied to the native window",
);
assert.match(
  petWindow,
  /--pet-opacity/,
  "pet opacity must be applied to the visual root",
);
assert.match(
  petMenu,
  /桌宠大小/,
  "the Phase 2 native menu must expose pet scale",
);
assert.match(
  petMenu,
  /始终置顶/,
  "the Phase 2 native menu must expose always-on-top",
);

assert.match(
  cargoManifest,
  /tauri-plugin-autostart\s*=\s*"2"/,
  "the official autostart plugin is required",
);
assert.match(
  rustStartup,
  /autolaunch\(\)/,
  "autostart must be backed by the operating-system integration",
);

for (const pageComponent of [
  "GeneralPage",
  "PetSettingsPage",
  "SyncModePage",
  "LifeModePage",
  "CharactersPage",
  "PerformancePage",
  "AboutPage",
]) {
  assert.match(
    settingsWindow,
    new RegExp(`<${pageComponent}\\b`),
    `${pageComponent} must be routed by the settings shell`,
  );
}
assert.match(
  settingsWindow,
  /settingsContentRef\.current\?\.scrollTo\(\{\s*top:\s*0\s*\}\)/,
  "switching settings pages must reset the shared content scroll position",
);

console.log("Phase 2 structure verification passed.");
