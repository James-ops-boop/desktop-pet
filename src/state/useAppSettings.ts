import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AppSettings,
  AppSettingsPatch,
} from "../models/settings";
import {
  loadAppSettings,
  updateAppSettings,
} from "../services/settings-store/settingsStore";

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>();
  const [error, setError] = useState<string>();
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await loadAppSettings();
      if (mountedRef.current) {
        setSettings(next);
        setError(undefined);
      }
      return next;
    } catch (caught) {
      const message = String(caught);
      if (mountedRef.current) {
        setError(message);
      }
      throw caught;
    }
  }, []);

  const update = useCallback(async (patch: AppSettingsPatch) => {
    try {
      const next = await updateAppSettings(patch);
      if (mountedRef.current) {
        setSettings(next);
        setError(undefined);
      }
      return next;
    } catch (caught) {
      const message = String(caught);
      if (mountedRef.current) {
        setError(message);
      }
      throw caught;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();

    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  return {
    settings,
    error,
    isLoading: settings === undefined && error === undefined,
    refresh,
    update,
  };
}
