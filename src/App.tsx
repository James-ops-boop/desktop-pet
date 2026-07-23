import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import type { Phase0Info, Phase0Probe } from "./models/phase0";
import {
  incrementAndSavePhase0Probe,
  readPhase0Probe,
} from "./services/settings-store/phase0Store";
import "./App.css";

const currentWindowLabel = getCurrentWebviewWindow().label;

function PetProbe() {
  const [message, setMessage] = useState("PET WINDOW");

  async function openSettings() {
    setMessage("OPENING SETTINGS…");

    try {
      await invoke("show_settings");
      setMessage("SETTINGS READY");
    } catch (error) {
      setMessage(`ERROR: ${String(error)}`);
    }
  }

  return (
    <main className="pet-shell">
      <section className="pet-probe" aria-label="Transparent pet window probe">
        <div className="probe-glow" />
        <div className="probe-hood">
          <div className="probe-face">
            <span />
            <span />
            <span />
          </div>
        </div>
        <p className="probe-eyebrow">SHADOW COMPANION · PHASE 0</p>
        <h1>{message}</h1>
        <p className="probe-copy">透明 · 无边框 · 置顶 · 跳过任务栏</p>
        <button type="button" onClick={openSettings}>
          打开设置测试窗
        </button>
      </section>
    </main>
  );
}

function SettingsProbe() {
  const [probe, setProbe] = useState<Phase0Probe>();
  const [info, setInfo] = useState<Phase0Info>();
  const [status, setStatus] = useState("正在载入持久化探针…");
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const [nextProbe, phase0Info] = await Promise.all([
          incrementAndSavePhase0Probe(),
          invoke<Phase0Info>("phase0_info"),
        ]);

        if (active) {
          setProbe(nextProbe);
          setInfo(phase0Info);
          setStatus("Store 已写入并显式保存");
        }
      } catch (caught) {
        if (active) {
          setError(String(caught));
          setStatus("初始化失败");
        }
      }
    }

    void initialize();
    return () => {
      active = false;
    };
  }, []);

  async function incrementProbe() {
    try {
      setProbe(await incrementAndSavePhase0Probe());
      setStatus("计数已增加并保存");
      setError(undefined);
    } catch (caught) {
      setError(String(caught));
    }
  }

  async function reloadProbe() {
    try {
      setProbe(await readPhase0Probe());
      setStatus("已从 Store 重新读取");
      setError(undefined);
    } catch (caught) {
      setError(String(caught));
    }
  }

  async function hideSettings() {
    await invoke("hide_settings");
  }

  return (
    <main className="settings-shell">
      <header>
        <p className="settings-kicker">SHADOW COMPANION</p>
        <h1>阶段 0 · Windows 技术验证</h1>
        <p>该窗口仅用于验证多窗口、单实例唤醒与配置持久化。</p>
      </header>

      <section className="status-grid">
        <article>
          <span>窗口标签</span>
          <strong>{info?.windowLabels.join(" · ") ?? "读取中…"}</strong>
        </article>
        <article>
          <span>当前进程 PID</span>
          <strong>{info?.processId ?? "读取中…"}</strong>
        </article>
        <article>
          <span>持久化计数</span>
          <strong>{probe?.launchCount ?? "读取中…"}</strong>
        </article>
        <article>
          <span>Store 状态</span>
          <strong>{status}</strong>
        </article>
      </section>

      <section className="path-panel">
        <span>应用数据目录</span>
        <code>{info?.appDataDir ?? "读取中…"}</code>
        <span>最后保存时间</span>
        <code>{probe?.lastSavedAt ?? "尚未保存"}</code>
      </section>

      {error ? <p className="error-panel">{error}</p> : null}

      <footer>
        <button type="button" onClick={incrementProbe}>
          计数 +1 并保存
        </button>
        <button type="button" className="secondary" onClick={reloadProbe}>
          从磁盘重读
        </button>
        <button type="button" className="secondary" onClick={hideSettings}>
          隐藏测试窗
        </button>
      </footer>
    </main>
  );
}

function App() {
  return currentWindowLabel === "settings" ? <SettingsProbe /> : <PetProbe />;
}

export default App;
