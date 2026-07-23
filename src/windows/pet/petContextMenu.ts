import { Menu } from "@tauri-apps/api/menu";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const PET_MENU_IDS = {
  openSettings: "pet.open-settings",
  togglePositionLock: "pet.toggle-position-lock",
  exitApplication: "pet.exit-application",
} as const;

interface PetContextMenuOptions {
  positionLocked: boolean;
  onOpenSettings: () => void;
  onTogglePositionLock: () => void;
  onExitApplication: () => void;
}

export async function popupPetContextMenu({
  positionLocked,
  onOpenSettings,
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
