import {
  CHARACTER_ACTION_IDS,
  type CharacterManifest,
} from "../../models/character";
import { OMEN_ANIMATION_PACK } from "./animation";

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
    "安静、克制的控场者。阶段 4 已接入原创 Q 版占位视觉、分层道具资源与可扩展动画框架。",
  theme: {
    accent: "#8175f5",
    aura: "#4e68d8",
  },
  assets: {
    portrait: OMEN_ANIMATION_PACK.layers.character.src,
    preview: OMEN_ANIMATION_PACK.layers.character.src,
  },
  supportedModes: ["sync", "life"],
  supportedActions: CHARACTER_ACTION_IDS,
  exclusiveActions: ["shadow"],
  animationResources: OMEN_ANIMATION_PACK.previewResources,
  defaultScale: 1,
  effects: {
    shadowEnabled: true,
    accentGlowEnabled: true,
  },
} as const satisfies CharacterManifest;
