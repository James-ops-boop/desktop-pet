import type { CharacterManifest } from "../../models/character";

export const JETT_MANIFEST = {
  schemaVersion: 1,
  id: "jett",
  names: {
    zhCN: "捷风",
    en: "JETT",
  },
  codename: "疾风先锋",
  role: "duelist",
  availability: "in-development",
  assetHealth: "ready",
  availabilityNote: "角色资料占位，尚未制作桌宠资源",
  description:
    "用于验证决斗职业筛选与未来扩展流程的占位角色。本阶段不可设为当前桌宠。",
  theme: {
    accent: "#6dcde8",
    aura: "#4b91bd",
  },
  assets: {
    portrait: "/assets/characters/common/portrait-placeholder.svg",
    preview: "/assets/characters/common/preview-placeholder.svg",
  },
  supportedModes: [],
  supportedActions: [],
  exclusiveActions: [],
  animationResources: {},
  defaultScale: 1,
  effects: {
    shadowEnabled: false,
    accentGlowEnabled: true,
  },
} as const satisfies CharacterManifest;
