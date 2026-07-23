import { Menu } from "@tauri-apps/api/menu";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { PET_SCALE_OPTIONS } from "../../config/defaultSettings";

export const PET_MENU_IDS = {
  openSettings: "pet.open-settings",
  scale: "pet.scale",
  toggleAlwaysOnTop: "pet.toggle-always-on-top",
  togglePositionLock: "pet.toggle-position-lock",
  exitApplication: "pet.exit-application",
} as const;

interface PetContextMenuOptions {
  petScale: number;
  alwaysOnTop: boolean;
  positionLocked: boolean;
  onOpenSettings: () => void;
  onSetScale: (scale: number) => void;
  onToggleAlwaysOnTop: () => void;
  onTogglePositionLock: () => void;
  onExitApplication: () => void;
}

export async function popupPetContextMenu({
  petScale,
  alwaysOnTop,
  positionLocked,
  onOpenSettings,
  onSetScale,
  onToggleAlwaysOnTop,
  onTogglePositionLock,
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
