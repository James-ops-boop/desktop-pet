import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AppSettings,
  AppSettingsPatch,
} from "../models/settings";
import {
  loadAppSettingsSnapshot,
  resetAppSettings,
  subscribeAppSettings,
  updateAppSettings,
  type SettingsSnapshot,
} from "../services/settings-store/settingsStore";
import { shouldApplySettingsSnapshot } from "./settingsSnapshot";

export type SettingsSaveStatus =
  | "loading"
  | "idle"
  | "saving"
  | "saved"
  | "error";

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>();
  const [error, setError] = useState<string>();
  const [subscriptionError, setSubscriptionError] =
    useState<string>();
  const [saveStatus, setSaveStatus] =
    useState<SettingsSaveStatus>("loading");
  const mountedRef = useRef(true);
  const latestRevisionRef = useRef(-1);

  const applySnapshot = useCallback((snapshot: SettingsSnapshot) => {
    if (
      !mountedRef.current ||
      !shouldApplySettingsSnapshot(
        latestRevisionRef.current,
        snapshot.revision,
      )
    ) {
      return;
    }

    latestRevisionRef.current = snapshot.revision;
    setSettings(snapshot.settings);
    setError(undefined);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const snapshot = await loadAppSettingsSnapshot();
      applySnapshot(snapshot);
      if (mountedRef.current) {
        setSaveStatus("idle");
      }
      return snapshot.settings;
    } catch (caught) {
      const message = String(caught);
      if (mountedRef.current) {
        setError(message);
        setSaveStatus("error");
      }
      throw caught;
    }
  }, [applySnapshot]);

  const update = useCallback(
    async (patch: AppSettingsPatch) => {
      if (mountedRef.current) {
        setSaveStatus("saving");
      }

      try {
        const snapshot = await updateAppSettings(patch);
        applySnapshot(snapshot);
        if (mountedRef.current) {
          setSaveStatus("saved");
        }
        return snapshot.settings;
      } catch (caught) {
        const message = String(caught);
        if (mountedRef.current) {
          setError(message);
          setSaveStatus("error");
        }
        throw caught;
      }
    },
    [applySnapshot],
  );

  const reset = useCallback(async () => {
    if (mountedRef.current) {
      setSaveStatus("saving");
    }

    try {
      const snapshot = await resetAppSettings();
      applySnapshot(snapshot);
      if (mountedRef.current) {
        setSaveStatus("saved");
      }
      return snapshot.settings;
    } catch (caught) {
      const message = String(caught);
      if (mountedRef.current) {
        setError(message);
        setSaveStatus("error");
      }
      throw caught;
    }
  }, [applySnapshot]);

  useEffect(() => {
    mountedRef.current = true;
    let active = true;
    let unlisten: (() => void) | undefined;

    async function initialize() {
      try {
        const nextUnlisten = await subscribeAppSettings((snapshot) => {
          applySnapshot(snapshot);
          if (mountedRef.current) {
            setSaveStatus("saved");
          }
        });

        if (!active) {
          nextUnlisten();
          return;
        }

        unlisten = nextUnlisten;
      } catch (caught) {
        if (active) {
          setSubscriptionError(
            `实时设置同步不可用：${String(caught)}`,
          );
        }
      }

      if (active) {
        await refresh().catch(() => undefined);
      }
    }

    void initialize();

    return () => {
      active = false;
      mountedRef.current = false;
      unlisten?.();
    };
  }, [applySnapshot, refresh]);

  return {
    settings,
    error: error ?? subscriptionError,
    saveStatus,
    isLoading: settings === undefined && error === undefined,
    refresh,
    update,
    reset,
  };
}
