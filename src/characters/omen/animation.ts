import type { CharacterAnimationPack } from "../../models/animation";

const BASE = "/assets/characters/omen/phase4/omen-base.png";
const PROPS = "/assets/props/phase4";

export const OMEN_ANIMATION_PACK = {
  schemaVersion: 1,
  characterId: "omen",
  renderer: "layered-image",
  layers: {
    character: { id: "character", src: BASE, zIndex: 2 },
    desk: { id: "desk", src: `${PROPS}/desk.svg`, zIndex: 4 },
    keyboard: {
      id: "keyboard",
      src: `${PROPS}/keyboard.svg`,
      zIndex: 5,
    },
    mouse: { id: "mouse", src: `${PROPS}/mouse.svg`, zIndex: 6 },
    book: { id: "book", src: `${PROPS}/book.svg`, zIndex: 5 },
    coffee: { id: "coffee", src: `${PROPS}/coffee.svg`, zIndex: 6 },
    "game-device": {
      id: "game-device",
      src: `${PROPS}/game-device.svg`,
      zIndex: 5,
    },
    meal: { id: "meal", src: `${PROPS}/meal.svg`, zIndex: 5 },
  },
  modes: {
    sync: {
      idleState: "sync-idle",
      visibleLayers: ["character", "desk", "keyboard", "mouse"],
    },
    life: {
      idleState: "life-idle",
      visibleLayers: ["character", "desk"],
    },
  },
  previewResources: {
    idle: BASE,
    keyboard: `${PROPS}/keyboard.svg`,
    mouse: `${PROPS}/mouse.svg`,
    study: `${PROPS}/book.svg`,
    gaming: `${PROPS}/game-device.svg`,
    coffee: `${PROPS}/coffee.svg`,
    meal: `${PROPS}/meal.svg`,
    sleep: BASE,
    shadow: BASE,
  },
} as const satisfies CharacterAnimationPack;
