export const CHARACTER_ROLES = [
  "duelist",
  "initiator",
  "controller",
  "sentinel",
] as const;

export type CharacterRole = (typeof CHARACTER_ROLES)[number];
export type CharacterRoleFilter = "all" | CharacterRole;

export const CHARACTER_AVAILABILITIES = [
  "available",
  "in-development",
  "not-installed",
] as const;

export type CharacterAvailability =
  (typeof CHARACTER_AVAILABILITIES)[number];
export type CharacterAssetHealth = "ready" | "resource-error";
export type CharacterModeId = "sync" | "life";

export const CHARACTER_ACTION_IDS = [
  "idle",
  "keyboard",
  "mouse",
  "study",
  "gaming",
  "coffee",
  "meal",
  "sleep",
  "shadow",
] as const;

export type CharacterActionId = (typeof CHARACTER_ACTION_IDS)[number];

export interface CharacterActionDefinition {
  id: CharacterActionId;
  label: string;
  description: string;
}

export const CHARACTER_ACTIONS: readonly CharacterActionDefinition[] = [
  {
    id: "idle",
    label: "待机",
    description: "安静呼吸与观察周围的循环动作。",
  },
  {
    id: "keyboard",
    label: "敲键盘",
    description: "同步模式下的左右手键盘动作框架。",
  },
  {
    id: "mouse",
    label: "操作鼠标",
    description: "移动、点击和滚轮反馈的预览入口。",
  },
  {
    id: "study",
    label: "写作业",
    description: "生活模式中的阅读、书写和思考动作。",
  },
  {
    id: "gaming",
    label: "玩游戏",
    description: "生活模式中的专注游戏动作。",
  },
  {
    id: "coffee",
    label: "喝咖啡",
    description: "角色使用咖啡道具的短动作。",
  },
  {
    id: "meal",
    label: "吃饭",
    description: "早餐、午餐和晚餐共用的动作入口。",
  },
  {
    id: "sleep",
    label: "睡觉",
    description: "午睡和夜间睡眠的姿态框架。",
  },
  {
    id: "shadow",
    label: "专属阴影动作",
    description: "Omen 的阴影消散与重新出现动作入口。",
  },
] as const;

export interface CharacterManifest {
  schemaVersion: 1;
  id: string;
  names: {
    zhCN: string;
    en: string;
  };
  codename: string;
  role: CharacterRole;
  availability: CharacterAvailability;
  assetHealth: CharacterAssetHealth;
  availabilityNote: string;
  description: string;
  theme: {
    accent: string;
    aura: string;
  };
  assets: {
    portrait: string;
    preview: string;
  };
  supportedModes: readonly CharacterModeId[];
  supportedActions: readonly CharacterActionId[];
  exclusiveActions: readonly CharacterActionId[];
  animationResources: Readonly<
    Partial<Record<CharacterActionId, string | null>>
  >;
  defaultScale: number;
  effects: {
    shadowEnabled: boolean;
    accentGlowEnabled: boolean;
  };
}

export type CharacterCardStatus =
  | "current"
  | "available"
  | "in-development"
  | "not-installed"
  | "resource-error";
