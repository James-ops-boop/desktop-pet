import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function readText(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

function readJson(path) {
  return JSON.parse(readText(path));
}

const packageManifest = readJson("../package.json");
const characterModel = readText("../src/models/character.ts");
const registry = readText("../src/characters/registry.ts");
const settingsModel = readText("../src/models/settings.ts");
const characterManager = readText(
  "../src/services/character-manager/characterManager.ts",
);
const charactersPage = readText(
  "../src/pages/characters/CharactersPage.tsx",
);
const previewPanel = readText(
  "../src/components/characters/CharacterPreviewPanel.tsx",
);
const settingsWindow = readText(
  "../src/windows/settings/SettingsWindow.tsx",
);
const petWindow = readText("../src/windows/pet/PetWindow.tsx");
const navigation = readText(
  "../src/windows/settings/settingsNavigation.ts",
);
const sidebar = readText(
  "../src/windows/settings/SettingsSidebar.tsx",
);

for (const manifestPath of [
  "../src/characters/omen/manifest.ts",
  "../src/characters/jett/manifest.ts",
  "../src/characters/sova/manifest.ts",
  "../src/characters/sage/manifest.ts",
  "../src/characters/killjoy/manifest.ts",
]) {
  assert.ok(
    existsSync(new URL(manifestPath, import.meta.url)),
    `${manifestPath} must be an independent character manifest`,
  );
}

for (const assetPath of [
  "../public/assets/characters/common/portrait-placeholder.svg",
  "../public/assets/characters/common/preview-placeholder.svg",
]) {
  assert.ok(
    existsSync(new URL(assetPath, import.meta.url)),
    `${assetPath} must exist for Phase 3 preview fallback`,
  );
}

for (const role of [
  "duelist",
  "initiator",
  "controller",
  "sentinel",
]) {
  assert.match(
    characterModel,
    new RegExp(`"${role}"`),
    `character role ${role} is required`,
  );
  assert.match(
    registry,
    new RegExp(`id:\\s*"${role}"`),
    `role filter ${role} is required`,
  );
}

for (const status of [
  "available",
  "in-development",
  "not-installed",
  "resource-error",
]) {
  assert.match(
    `${characterModel}\n${registry}`,
    new RegExp(`"${status}"`),
    `character status ${status} is required`,
  );
}

for (const action of [
  "idle",
  "keyboard",
  "mouse",
  "study",
  "gaming",
  "coffee",
  "meal",
  "sleep",
  "shadow",
]) {
  assert.match(
    characterModel,
    new RegExp(`"${action}"`),
    `action preview id ${action} is required`,
  );
}

assert.match(
  registry,
  /OMEN_MANIFEST/,
  "Omen must be registered",
);
assert.match(
  registry,
  /DEFAULT_CHARACTER_ID\s*=\s*"omen"/,
  "Omen must remain the safe fallback",
);
assert.match(
  settingsModel,
  /normalizeCurrentCharacterId/,
  "settings normalization must reject unknown and unavailable characters",
);
assert.match(
  characterManager,
  /previewCharacterId/,
  "preview state must be distinct from currentCharacterId",
);
assert.match(
  characterManager,
  /await persist\(\{\s*currentCharacterId:\s*character\.id\s*\}\)/,
  "only explicit activation may persist a selected character",
);

assert.doesNotMatch(
  charactersPage,
  /ComingSoonPanel/,
  "the Phase 3 character page must replace the placeholder",
);
for (const component of [
  "CharacterRoleFilter",
  "CharacterCard",
  "CharacterPreviewPanel",
]) {
  assert.match(
    charactersPage,
    new RegExp(`<${component}\\b`),
    `${component} must be used by CharactersPage`,
  );
}
assert.match(
  charactersPage,
  /function handleBrowse\([^)]*\)\s*\{[\s\S]*?setBrowserState/,
  "card browsing must update only local browser state",
);
assert.match(
  charactersPage,
  /requestCharacterActivation/,
  "the confirmation button must use the guarded activation flow",
);
assert.match(
  previewPanel,
  /character-action-preview/,
  "the Phase 3 action preview surface must remain available",
);

assert.match(
  settingsWindow,
  /currentCharacterId=\{settings\.currentCharacterId\}/,
  "CharactersPage must receive the persisted current character",
);
assert.match(
  settingsWindow,
  /onSetCurrentCharacter=\{handleActivateCharacter\}/,
  "CharactersPage must receive a dedicated activation callback",
);
assert.match(
  petWindow,
  /resolveCurrentCharacter/,
  "the pet caption must resolve its character from the registry",
);
assert.doesNotMatch(
  petWindow,
  /<strong>OMEN/,
  "the pet caption must not hard-code Omen",
);
assert.match(
  navigation,
  /title:\s*"角色选择"/,
  "settings navigation must describe the implemented character page",
);
assert.match(
  sidebar,
  /PHASE [34]/,
  "the settings footer must not regress below Phase 3",
);

assert.equal(
  packageManifest.scripts["test:phase3"],
  "node scripts/verify-phase3.mjs",
  "package.json must expose the Phase 3 structure check",
);
assert.match(
  packageManifest.scripts.check,
  /npm run test:phase3/,
  "the main check command must include Phase 3",
);

console.log("Phase 3 structure verification passed.");
