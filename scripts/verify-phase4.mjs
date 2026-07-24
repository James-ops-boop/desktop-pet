import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function readText(path) {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

function readJson(path) {
  return JSON.parse(readText(path));
}

const packageManifest = readJson("../package.json");
const animationModel = readText("../src/models/animation.ts");
const animationController = readText(
  "../src/services/animation-controller/animationController.ts",
);
const animationHook = readText(
  "../src/services/animation-controller/useAnimationController.ts",
);
const animationPack = readText("../src/characters/omen/animation.ts");
const omenManifest = readText("../src/characters/omen/manifest.ts");
const petStage = readText(
  "../src/components/pet/AnimatedPetStage.tsx",
);
const petWindow = readText("../src/windows/pet/PetWindow.tsx");
const petSettingsPage = readText(
  "../src/pages/pet/PetSettingsPage.tsx",
);
const contextMenu = readText(
  "../src/windows/pet/petContextMenu.ts",
);

for (const assetPath of [
  "../public/assets/characters/omen/phase4/omen-base.png",
  "../public/assets/props/phase4/desk.svg",
  "../public/assets/props/phase4/keyboard.svg",
  "../public/assets/props/phase4/mouse.svg",
  "../public/assets/props/phase4/book.svg",
  "../public/assets/props/phase4/coffee.svg",
  "../public/assets/props/phase4/game-device.svg",
  "../public/assets/props/phase4/meal.svg",
]) {
  assert.ok(
    existsSync(new URL(assetPath, import.meta.url)),
    `${assetPath} must exist for Phase 4`,
  );
}

for (const state of [
  "sync-idle",
  "life-idle",
  "click-look",
  "click-tilt",
  "click-shadow-gather",
  "click-vanish",
  "dragging",
  "mode-transition",
]) {
  assert.match(
    animationModel,
    new RegExp(`"${state}"`),
    `runtime animation state ${state} is required`,
  );
  assert.match(
    animationController,
    new RegExp(`"${state}"`),
    `animation controller must handle ${state}`,
  );
}

assert.match(
  animationModel,
  /AnimationSnapshot/,
  "runtime animation state must be independent from page preview actions",
);
assert.match(
  animationController,
  /transitionStage/,
  "mode switching must use an explicit transition stage",
);
assert.match(
  animationHook,
  /MODE_FADE_OUT_MS/,
  "the React hook must schedule the controller transition",
);
assert.match(
  animationPack,
  /sync:[\s\S]*visibleLayers:\s*\[[\s\S]*"keyboard"[\s\S]*"mouse"/,
  "sync mode must include keyboard and mouse layers",
);
assert.match(
  animationPack,
  /life:[\s\S]*visibleLayers:\s*\["character",\s*"desk"\]/,
  "life mode must omit fixed keyboard and mouse layers",
);
assert.match(
  omenManifest,
  /animationResources:\s*OMEN_ANIMATION_PACK\.previewResources/,
  "Omen preview actions must resolve through the replaceable resource pack",
);
assert.doesNotMatch(
  omenManifest,
  /animationResources:\s*\{[\s\S]*?:\s*null/,
  "Omen animation resource mappings must no longer be null",
);
assert.match(
  petStage,
  /getCharacterAnimationPack/,
  "the renderer must resolve assets from the character animation registry",
);
assert.match(
  petWindow,
  /useAnimationController/,
  "PetWindow must delegate state to the animation controller",
);
assert.doesNotMatch(
  petWindow,
  /setTimeout\([^)]*click|clickCount/,
  "click-chain logic must not be embedded in PetWindow",
);
assert.match(
  petSettingsPage,
  /currentMode:\s*value as CompanionMode/,
  "the settings page must expose manual mode switching",
);
assert.match(
  contextMenu,
  /同步模式 A/,
  "the context menu must expose sync mode",
);
assert.match(
  contextMenu,
  /生活模式 B/,
  "the context menu must expose life mode",
);
assert.match(
  contextMenu,
  /暂停动画/,
  "the context menu must expose animation pause",
);

assert.equal(
  packageManifest.scripts["test:phase4"],
  "node scripts/verify-phase4.mjs",
  "package.json must expose the Phase 4 structure check",
);
assert.match(
  packageManifest.scripts.check,
  /npm run test:phase4/,
  "the main check command must include Phase 4",
);

console.log("Phase 4 structure verification passed.");
