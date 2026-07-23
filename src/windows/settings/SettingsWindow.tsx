import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  exitApplication,
  hideSettingsWindow,
  minimizeSettingsWindow,
} from "../../services/window/windowCommands";
import { useAppSettings } from "../../state/useAppSettings";
import "./settings-window.css";

const settingsWindow = getCurrentWindow();

export function SettingsWindow() {
  const { settings, error, isLoading, refresh } = useAppSettings();

  useEffect(() => {
    let active = true;
    let unlisten: (() => void) | undefined;

    void settingsWindow
      .onFocusChanged(({ payload: focused }) => {
        if (focused) {
          void refresh();
        }
      })
      .then((nextUnlisten) => {
        if (active) {
          unlisten = nextUnlisten;
        } else {
          nextUnlisten();
        }
      });

    return () => {
      active = false;
      unlisten?.();
    };
  }, [refresh]);

  const savedPosition = !settings
    ? "读取中…"
    : settings.petPositionX === null || settings.petPositionY === null
      ? "尚未保存"
      : `${settings.petPositionX}, ${settings.petPositionY}`;

  return (
    <main className="settings-window">
      <header className="settings-header">
        <div>
          <p className="settings-kicker">SHADOW COMPANION</p>
          <h1>基础应用骨架</h1>
          <p>
            Phase 1 只验证窗口生命周期、桌宠拖动、右键入口和统一配置存储。
            正式导航与设置页面将在 Phase 2 实现。
          </p>
        </div>
        <span className="phase-badge">PHASE 1</span>
      </header>

      <section className="foundation-grid" aria-busy={isLoading}>
        <article>
          <span>当前角色占位</span>
          <strong>{settings?.currentCharacterId ?? "读取中…"}</strong>
        </article>
        <article>
          <span>当前模式</span>
          <strong>{settings?.currentMode ?? "读取中…"}</strong>
        </article>
        <article>
          <span>保存的桌宠坐标</span>
          <strong>{savedPosition}</strong>
        </article>
        <article>
          <span>位置状态</span>
          <strong>
            {settings?.positionLocked ? "已锁定" : "可拖动"}
          </strong>
        </article>
      </section>

      <section className="lifecycle-panel">
        <h2>窗口生命周期测试</h2>
        <p>
          最小化或点击标题栏关闭按钮后，桌宠和应用进程应继续运行。只有“退出应用”
          会完整结束进程。
        </p>
        <div className="settings-actions">
          <button type="button" onClick={() => void minimizeSettingsWindow()}>
            最小化窗口
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => void hideSettingsWindow()}
          >
            隐藏窗口
          </button>
          <button
            type="button"
            className="button-danger"
            onClick={() => void exitApplication()}
          >
            退出应用
          </button>
        </div>
      </section>

      {error ? <p className="settings-error">{error}</p> : null}
    </main>
  );
}
