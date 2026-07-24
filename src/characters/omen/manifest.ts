import {
  CHARACTER_ACTION_IDS,
  type CharacterManifest,
} from "../../models/character";

export const OMEN_MANIFEST = {
  schemaVersion: 1,
  id: "omen",
  names: {
    zhCN: "幽影",
    en: "OMEN",
  },
  codename: "暗影守望者",
  role: "controller",
  availability: "available",
  assetHealth: "ready",
  availabilityNote: "第一版可使用角色",
  description:
    "安静、克制的控场者。阶段 3 使用原创几何占位视觉，正式 Q 版资源与动作将在阶段 4 接入。",
  theme: {
    accent: "#8175f5",
    aura: "#4e68d8",
  },
  assets: {
    portrait: "/assets/characters/common/portrait-placeholder.svg",
    preview: "/assets/characters/common/preview-placeholder.svg",
  },
  supportedModes: ["sync", "life"],
  supportedActions: CHARACTER_ACTION_IDS,
  exclusiveActions: ["shadow"],
  animationResources: {
    idle: null,
    keyboard: null,
    mouse: null,
    study: null,
    gaming: null,
    coffee: null,
    meal: null,
    sleep: null,
    shadow: null,
  },
  defaultScale: 1,
  effects: {
    shadowEnabled: true,
    accentGlowEnabled: true,
  },
} as const satisfies CharacterManifest;
