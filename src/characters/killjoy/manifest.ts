import type { CharacterManifest } from "../../models/character";

export const KILLJOY_MANIFEST = {
  schemaVersion: 1,
  id: "killjoy",
  names: {
    zhCN: "奇乐",
    en: "KILLJOY",
  },
  codename: "装置专家",
  role: "sentinel",
  availability: "in-development",
  assetHealth: "ready",
  availabilityNote: "角色资料占位，尚未制作桌宠资源",
  description:
    "用于验证同一职业包含多个角色时的卡片网格。本阶段不可设为当前桌宠。",
  theme: {
    accent: "#e2c85b",
    aura: "#99843a",
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
