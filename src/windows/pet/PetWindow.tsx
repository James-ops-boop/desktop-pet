import type { CSSProperties, MouseEvent } from "react";
import { resolveCurrentCharacter } from "../../characters/registry";
import {
  exitApplication,
  showSettingsWindow,
} from "../../services/window/windowCommands";
import { popupPetContextMenu } from "./petContextMenu";
import { usePetWindowController } from "./usePetWindowController";
import "./pet-window.css";

type PetWindowStyle = CSSProperties & {
  "--pet-scale": number;
  "--pet-opacity": number;
};

export function PetWindow() {
  const {
    settings,
    error,
    positionStatus,
    startDrag,
    togglePositionLock,
    toggleAlwaysOnTop,
    setPetScale,
  } = usePetWindowController();

  async function openContextMenu(event: MouseEvent<HTMLElement>) {
    event.preventDefault();

    await popupPetContextMenu({
      petScale: settings?.petScale ?? 1,
      alwaysOnTop: settings?.alwaysOnTop ?? true,
      positionLocked: settings?.positionLocked ?? false,
      onOpenSettings: () => {
        void showSettingsWindow();
      },
      onSetScale: (scale) => {
        void setPetScale(scale);
      },
      onToggleAlwaysOnTop: () => {
        void toggleAlwaysOnTop();
      },
      onTogglePositionLock: () => {
        void togglePositionLock();
      },
      onExitApplication: () => {
        void exitApplication();
      },
    });
  }

  const style: PetWindowStyle = {
    "--pet-scale": settings?.petScale ?? 1,
    "--pet-opacity": settings?.petOpacity ?? 1,
  };
  const character = resolveCurrentCharacter(
    settings?.currentCharacterId,
  );

  return (
    <main
      className={`pet-window ${
        settings?.positionLocked ? "pet-window--locked" : ""
      }`}
      style={style}
      onContextMenu={(event) => {
        void openContextMenu(event);
      }}
      aria-label={`${character.names.en} Shadow Companion desktop pet placeholder`}
    >
      <div className="pet-visual">
        <div className="pet-aura" aria-hidden="true" />
        <section className="pet-placeholder">
          <div className="pet-hood">
            <div className="pet-face" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="pet-shoulders" aria-hidden="true" />
          <div className="pet-desk" aria-hidden="true" />
          <div className="pet-caption">
            <strong>
              {character.names.en} · {character.names.zhCN} · 占位桌宠
            </strong>
            <span>
              {settings?.positionLocked
                ? "位置已锁定 · 右键解锁"
                : "拖动移动 · 右键菜单"}
            </span>
          </div>
        </section>
      </div>

      <div className="pet-status" aria-live="polite">
        {positionStatus === "dragging" ? "拖动请求已触发" : null}
        {positionStatus === "pending" ? "正在保存位置…" : null}
        {positionStatus === "saved" ? "位置已保存" : null}
        {error ? `窗口错误：${error}` : null}
      </div>
      <div
        className="pet-drag-surface"
        onMouseDown={startDrag}
        aria-hidden="true"
      />
    </main>
  );
}
