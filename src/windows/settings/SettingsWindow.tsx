import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ConfirmDialog } from "../../components/settings/SettingsControls";
import { AboutPage } from "../../pages/about/AboutPage";
import { CharactersPage } from "../../pages/characters/CharactersPage";
import { GeneralPage } from "../../pages/general/GeneralPage";
import { LifeModePage } from "../../pages/life-mode/LifeModePage";
import { PerformancePage } from "../../pages/performance/PerformancePage";
import { PetSettingsPage } from "../../pages/pet/PetSettingsPage";
import { SyncModePage } from "../../pages/sync-mode/SyncModePage";
import type { AppSettingsPatch } from "../../models/settings";
import {
  isLaunchAtStartupEnabled,
  setLaunchAtStartup,
} from "../../services/startup/startupService";
import {
  centerPetWindow,
  exitApplication,
} from "../../services/window/windowCommands";
import { useAppSettings } from "../../state/useAppSettings";
import { SettingsSidebar } from "./SettingsSidebar";
import {
  SETTINGS_NAVIGATION,
  type SettingsPageId,
} from "./settingsNavigation";
import "./settings-window.css";

const settingsWindow = getCurrentWindow();

const SAVE_STATUS_LABELS = {
  loading: "正在读取",
  idle: "配置已同步",
  saving: "正在保存",
  saved: "已保存",
  error: "保存失败",
} as const;

export function SettingsWindow() {
  const {
    settings,
    error,
    saveStatus,
    isLoading,
    refresh,
    update,
    reset,
  } = useAppSettings();
  const [activePage, setActivePage] =
    useState<SettingsPageId>("general");
  const [actionError, setActionError] = useState<string>();
  const [autostartBusy, setAutostartBusy] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const autostartCheckedRef = useRef(false);
  const settingsContentRef = useRef<HTMLDivElement>(null);

  const activeNavigation = useMemo(
    () =>
      SETTINGS_NAVIGATION.find((item) => item.id === activePage) ??
      SETTINGS_NAVIGATION[0],
    [activePage],
  );

  useEffect(() => {
    let active = true;
    let unlisten: (() => void) | undefined;

    void settingsWindow
      .onFocusChanged(({ payload: focused }) => {
        if (focused) {
          void refresh().catch(() => undefined);
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

  useEffect(() => {
    settingsContentRef.current?.scrollTo({ top: 0 });
  }, [activePage]);

  useEffect(() => {
    if (!settings || autostartCheckedRef.current) {
      return;
    }

    autostartCheckedRef.current = true;
    void isLaunchAtStartupEnabled()
      .then(async (actual) => {
        if (actual !== settings.launchAtStartup) {
          await update({ launchAtStartup: actual });
        }
      })
      .catch((caught) => {
        setActionError(`无法读取开机启动状态：${String(caught)}`);
      });
  }, [settings, update]);

  const updateSetting = useCallback(
    async (patch: AppSettingsPatch) => {
      setActionError(undefined);
      try {
        await update(patch);
      } catch (caught) {
        setActionError(`设置保存失败：${String(caught)}`);
      }
    },
    [update],
  );

  const handleToggleAutostart = useCallback(
    async (enabled: boolean) => {
      setAutostartBusy(true);
      setActionError(undefined);

      try {
        await setLaunchAtStartup(enabled);
        await refresh();
      } catch (caught) {
        setActionError(`开机启动修改失败：${String(caught)}`);
      } finally {
        setAutostartBusy(false);
      }
    },
    [refresh],
  );

  const handleCenterPet = useCallback(async () => {
    setActionError(undefined);
    try {
      await centerPetWindow();
    } catch (caught) {
      setActionError(`恢复桌宠位置失败：${String(caught)}`);
    }
  }, []);

  const handleReset = useCallback(async () => {
    setResetting(true);
    setActionError(undefined);
    const previousAutostart = settings?.launchAtStartup ?? false;
    let autostartWasChanged = false;
    let settingsWereReset = false;

    try {
      if (previousAutostart) {
        await setLaunchAtStartup(false);
        autostartWasChanged = true;
      }
      await reset();
      settingsWereReset = true;
      await centerPetWindow();
      setResetDialogOpen(false);
    } catch (caught) {
      if (autostartWasChanged && !settingsWereReset) {
        await setLaunchAtStartup(previousAutostart).catch(() => undefined);
        await refresh().catch(() => undefined);
      }
      setActionError(`恢复默认设置失败：${String(caught)}`);
    } finally {
      setResetting(false);
    }
  }, [refresh, reset, settings?.launchAtStartup]);

  function renderPage() {
    if (!settings) {
      return (
        <div className="settings-loading" aria-busy={isLoading}>
          <span className="settings-loading__mark" aria-hidden="true" />
          <strong>{isLoading ? "正在读取本地设置" : "无法载入设置"}</strong>
          <p>Shadow Companion 正在准备统一配置快照。</p>
        </div>
      );
    }

    switch (activePage) {
      case "general":
        return (
          <GeneralPage
            settings={settings}
            autostartBusy={autostartBusy}
            onUpdate={updateSetting}
            onToggleAutostart={handleToggleAutostart}
            onRequestReset={() => setResetDialogOpen(true)}
            onExit={() => {
              void exitApplication();
            }}
          />
        );
      case "pet":
        return (
          <PetSettingsPage
            settings={settings}
            onUpdate={updateSetting}
            onCenterPet={handleCenterPet}
          />
        );
      case "sync-mode":
        return <SyncModePage />;
      case "life-mode":
        return <LifeModePage />;
      case "characters":
        return <CharactersPage />;
      case "performance":
        return (
          <PerformancePage
            settings={settings}
            onUpdate={updateSetting}
          />
        );
      case "about":
        return <AboutPage />;
    }
  }

  const visibleError = actionError ?? error;

  return (
    <main className="settings-shell">
      <SettingsSidebar
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <section className="settings-main">
        <header className="settings-page-header">
          <div>
            <span>{activeNavigation.eyebrow}</span>
            <h1>{activeNavigation.title}</h1>
            <p>{activeNavigation.description}</p>
          </div>
          <div
            className={`save-status save-status--${saveStatus}`}
            aria-live="polite"
          >
            <span aria-hidden="true" />
            {SAVE_STATUS_LABELS[saveStatus]}
          </div>
        </header>

        <div ref={settingsContentRef} className="settings-content">
          {visibleError ? (
            <div className="settings-error" role="alert">
              {visibleError}
            </div>
          ) : null}
          {renderPage()}
        </div>
      </section>

      <ConfirmDialog
        open={resetDialogOpen}
        title="恢复全部默认设置？"
        description="这会重置桌宠外观、位置、开机启动和所有已保存偏好。此操作无法自动撤销。"
        confirmLabel="确认恢复"
        busy={resetting}
        onCancel={() => setResetDialogOpen(false)}
        onConfirm={() => {
          void handleReset();
        }}
      />
    </main>
  );
}
