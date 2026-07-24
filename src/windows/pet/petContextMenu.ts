import { Menu } from "@tauri-apps/api/menu";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PET_SCALE_OPTIONS } from "../../config/defaultSettings";
import type { CompanionMode } from "../../models/settings";

export const PET_MENU_IDS = {
  openSettings: "pet.open-settings",
  mode: "pet.mode",
  scale: "pet.scale",
  toggleAlwaysOnTop: "pet.toggle-always-on-top",
  togglePositionLock: "pet.toggle-position-lock",
  toggleAnimationPaused: "pet.toggle-animation-paused",
  exitApplication: "pet.exit-application",
} as const;

interface PetContextMenuOptions {
  currentMode: CompanionMode;
  petScale: number;
  alwaysOnTop: boolean;
  positionLocked: boolean;
  animationPaused: boolean;
  onOpenSettings: () => void;
  onSetMode: (mode: CompanionMode) => void;
  onSetScale: (scale: number) => void;
  onToggleAlwaysOnTop: () => void;
  onTogglePositionLock: () => void;
  onToggleAnimationPaused: () => void;
  onExitApplication: () => void;
}

export async function popupPetContextMenu({
  currentMode,
  petScale,
  alwaysOnTop,
  positionLocked,
  animationPaused,
  onOpenSettings,
  onSetMode,
  onSetScale,
  onToggleAlwaysOnTop,
  onTogglePositionLock,
  onToggleAnimationPaused,
  onExitApplication,
}: PetContextMenuOptions): Promise<void> {
  const menu = await Menu.new({
    items: [
      {
        id: PET_MENU_IDS.openSettings,
        text: "打开主设置",
        action: onOpenSettings,
      },
      {
        item: "Separator",
      },
      {
        id: PET_MENU_IDS.mode,
        text: "桌宠模式",
        items: [
          {
            id: `${PET_MENU_IDS.mode}.sync`,
            text: "同步模式 A",
            checked: currentMode === "sync",
            action: () => onSetMode("sync"),
          },
          {
            id: `${PET_MENU_IDS.mode}.life`,
            text: "生活模式 B",
            checked: currentMode === "life",
            action: () => onSetMode("life"),
          },
        ],
      },
      {
        id: PET_MENU_IDS.scale,
        text: "桌宠大小",
        items: PET_SCALE_OPTIONS.map((scale) => ({
          id: `${PET_MENU_IDS.scale}.${Math.round(scale * 100)}`,
          text: `${Math.round(scale * 100)}%`,
          checked: scale === petScale,
          action: () => onSetScale(scale),
        })),
      },
      {
        id: PET_MENU_IDS.toggleAlwaysOnTop,
        text: "始终置顶",
        checked: alwaysOnTop,
        action: onToggleAlwaysOnTop,
      },
      {
        id: PET_MENU_IDS.togglePositionLock,
        text: positionLocked ? "解锁位置" : "锁定位置",
        action: onTogglePositionLock,
      },
      {
        id: PET_MENU_IDS.toggleAnimationPaused,
        text: animationPaused ? "继续动画" : "暂停动画",
        action: onToggleAnimationPaused,
      },
      {
        item: "Separator",
      },
      {
        id: PET_MENU_IDS.exitApplication,
        text: "退出应用",
        action: onExitApplication,
      },
    ],
  });

  try {
    await menu.popup(undefined, getCurrentWindow());
  } finally {
    await menu.close();
  }
}
