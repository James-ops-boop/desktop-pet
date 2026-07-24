export type SettingsPageId =
  | "general"
  | "pet"
  | "sync-mode"
  | "life-mode"
  | "characters"
  | "performance"
  | "about";

export interface SettingsNavigationItem {
  id: SettingsPageId;
  index: string;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
}

export const SETTINGS_NAVIGATION: readonly SettingsNavigationItem[] = [
  {
    id: "general",
    index: "01",
    label: "常规",
    eyebrow: "GENERAL",
    title: "常规设置",
    description: "管理启动、后台行为和应用维护入口。",
  },
  {
    id: "pet",
    index: "02",
    label: "桌宠",
    eyebrow: "COMPANION",
    title: "桌宠设置",
    description: "调整桌宠的尺寸、透明度、置顶与位置行为。",
  },
  {
    id: "sync-mode",
    index: "03",
    label: "同步模式",
    eyebrow: "SYNC MODE",
    title: "同步模式",
    description: "键鼠响应设置将在输入系统阶段正式接入。",
  },
  {
    id: "life-mode",
    index: "04",
    label: "生活模式",
    eyebrow: "LIFE MODE",
    title: "生活模式",
    description: "现实作息、三餐和活动调度将在后续阶段实现。",
  },
  {
    id: "characters",
    index: "05",
    label: "角色",
    eyebrow: "CHARACTERS",
    title: "角色选择",
    description: "浏览角色注册表，按职业筛选并确认当前桌宠。",
  },
  {
    id: "performance",
    index: "06",
    label: "性能",
    eyebrow: "PERFORMANCE",
    title: "性能设置",
    description: "保存渲染偏好，为阶段 8 的性能控制器提供配置。",
  },
  {
    id: "about",
    index: "07",
    label: "关于",
    eyebrow: "ABOUT",
    title: "关于 Shadow Companion",
    description: "项目定位、技术组件和非商业同人声明。",
  },
];
