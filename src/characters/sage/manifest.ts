import type { CharacterManifest } from "../../models/character";

export const SAGE_MANIFEST = {
  schemaVersion: 1,
  id: "sage",
  names: {
    zhCN: "贤者",
    en: "SAGE",
  },
  codename: "守护者",
  role: "sentinel",
  availability: "in-development",
  assetHealth: "ready",
  availabilityNote: "角色资料占位，尚未制作桌宠资源",
  description:
    "用于验证哨卫职业筛选与未来扩展流程的占位角色。本阶段不可设为当前桌宠。",
  theme: {
    accent: "#62d8b4",
    aura: "#3d927f",
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
