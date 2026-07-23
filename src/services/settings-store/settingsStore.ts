import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { DEFAULT_APP_SETTINGS } from "../../config/defaultSettings";
import {
  normalizeAppSettings,
  type AppSettings,
  type AppSettingsPatch,
} from "../../models/settings";
import { areJsonValuesEquivalent } from "../../state/settingsSnapshot";

export const SETTINGS_STORE_PATH = "settings.json";
export const SETTINGS_CHANGED_EVENT = "app-settings://changed";

export interface SettingsSnapshot {
  revision: number;
  settings: AppSettings;
}

interface RawSettingsSnapshot {
  revision: number;
  settings: unknown;
}

const SETTINGS_REVISION_CONFLICT = "settings revision conflict";
const MAX_REPAIR_ATTEMPTS = 3;

function normalizeSnapshot(snapshot: RawSettingsSnapshot): SettingsSnapshot {
  return {
    revision: snapshot.revision,
    settings: normalizeAppSettings(snapshot.settings),
  };
}

async function repairSnapshot(
  snapshot: RawSettingsSnapshot,
  attempt = 0,
): Promise<SettingsSnapshot> {
  const normalized = normalizeSnapshot(snapshot);

  if (
    !areJsonValuesEquivalent(snapshot.settings, normalized.settings)
  ) {
    try {
      const repaired = await invoke<RawSettingsSnapshot>(
        "replace_app_settings",
        {
          settings: normalized.settings,
          expectedRevision: snapshot.revision,
        },
      );
      return normalizeSnapshot(repaired);
    } catch (caught) {
      if (
        String(caught).includes(SETTINGS_REVISION_CONFLICT) &&
        attempt < MAX_REPAIR_ATTEMPTS
      ) {
        const current = await invoke<RawSettingsSnapshot>(
          "load_app_settings",
        );
        return repairSnapshot(current, attempt + 1);
      }

      throw caught;
    }
  }

  return normalized;
}

export async function loadAppSettingsSnapshot(): Promise<SettingsSnapshot> {
  const snapshot = await invoke<RawSettingsSnapshot>("load_app_settings");
  return repairSnapshot(snapshot);
}

export async function loadAppSettings(): Promise<AppSettings> {
  return (await loadAppSettingsSnapshot()).settings;
}

export async function updateAppSettings(
  patch: AppSettingsPatch,
): Promise<SettingsSnapshot> {
  const snapshot = await invoke<RawSettingsSnapshot>("patch_app_settings", {
    patch,
  });
  return repairSnapshot(snapshot);
}

export async function replaceAppSettings(
  settings: AppSettings,
): Promise<SettingsSnapshot> {
  const normalized = normalizeAppSettings(settings);
  const snapshot = await invoke<RawSettingsSnapshot>(
    "replace_app_settings",
    { settings: normalized, expectedRevision: null },
  );

  return normalizeSnapshot(snapshot);
}

export function resetAppSettings(): Promise<SettingsSnapshot> {
  return replaceAppSettings(
    normalizeAppSettings(DEFAULT_APP_SETTINGS),
  );
}

export function subscribeAppSettings(
  listener: (snapshot: SettingsSnapshot) => void,
): Promise<UnlistenFn> {
  return listen<RawSettingsSnapshot>(
    SETTINGS_CHANGED_EVENT,
    ({ payload }) => {
      listener(normalizeSnapshot(payload));
    },
  );
}
