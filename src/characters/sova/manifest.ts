import type { CharacterManifest } from "../../models/character";

export const SOVA_MANIFEST = {
  schemaVersion: 1,
  id: "sova",
  names: {
    zhCN: "猎枭",
    en: "SOVA",
  },
  codename: "追踪猎手",
  role: "initiator",
  availability: "in-development",
  assetHealth: "ready",
  availabilityNote: "角色资料占位，尚未制作桌宠资源",
  description:
    "用于验证先锋职业筛选与注册表扩展的占位角色。本阶段不可设为当前桌宠。",
  theme: {
    accent: "#6f9ee8",
    aura: "#4866a2",
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
