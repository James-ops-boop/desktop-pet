import type { CSSProperties, MouseEvent } from "react";
import { resolveCurrentCharacter } from "../../characters/registry";
import { AnimatedPetStage } from "../../components/pet/AnimatedPetStage";
import { useAnimationController } from "../../services/animation-controller/useAnimationController";
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
    setMode,
  } = usePetWindowController();
  const animation = useAnimationController(
    settings?.currentMode ?? "sync",
  );

  async function openContextMenu(event: MouseEvent<HTMLElement>) {
    event.preventDefault();

    await popupPetContextMenu({
      currentMode: settings?.currentMode ?? "sync",
      petScale: settings?.petScale ?? 1,
      alwaysOnTop: settings?.alwaysOnTop ?? true,
      positionLocked: settings?.positionLocked ?? false,
      animationPaused: animation.snapshot.paused,
      onOpenSettings: () => {
        void showSettingsWindow();
      },
      onSetMode: (mode) => {
        void setMode(mode);
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
      onToggleAnimationPaused: () => {
        animation.setPaused(!animation.snapshot.paused);
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
      aria-label={`${character.names.en} Shadow Companion desktop pet，${
        animation.snapshot.mode === "sync" ? "同步模式" : "生活模式"
      }`}
    >
      <div className="pet-visual">
        <AnimatedPetStage
          character={character}
          animation={animation.snapshot}
          idleAnimationEnabled={settings?.idleAnimationEnabled ?? true}
          startupAnimationEnabled={
            settings?.startupAnimationEnabled ?? true
          }
        />
        <div className="pet-caption">
          <strong>
            {character.names.en} · {character.names.zhCN} ·{" "}
            {animation.snapshot.mode === "sync" ? "SYNC A" : "LIFE B"}
          </strong>
          <span>
            {animation.snapshot.paused
              ? "动画已暂停 · 右键继续"
              : settings?.positionLocked
                ? "位置已锁定 · 右键解锁"
                : "单击互动 · 拖动移动"}
          </span>
        </div>
      </div>

      <div className="pet-status" aria-live="polite">
        {positionStatus === "dragging" ? "拖动请求已触发" : null}
        {positionStatus === "pending" ? "正在保存位置…" : null}
        {positionStatus === "saved" ? "位置已保存" : null}
        {error ? `窗口错误：${error}` : null}
      </div>
      <div
        className="pet-drag-surface"
        onMouseDown={(event) => {
          void startDrag(event, {
            onClick: animation.triggerClick,
            onDragStart: animation.beginDrag,
            onDragEnd: animation.endDrag,
          });
        }}
        aria-hidden="true"
      />
    </main>
  );
}
