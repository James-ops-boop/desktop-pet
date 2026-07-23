import { load, type Store } from "@tauri-apps/plugin-store";
import { DEFAULT_APP_SETTINGS } from "../../config/defaultSettings";
import {
  mergeAppSettings,
  normalizeAppSettings,
  type AppSettings,
  type AppSettingsPatch,
} from "../../models/settings";

export const SETTINGS_STORE_PATH = "settings.json";
const SETTINGS_KEY = "appSettings";

let storePromise: Promise<Store> | undefined;
let writeQueue: Promise<void> = Promise.resolve();

function getStore(): Promise<Store> {
  storePromise ??= load(SETTINGS_STORE_PATH, {
    autoSave: false,
    defaults: {
      [SETTINGS_KEY]: DEFAULT_APP_SETTINGS,
    },
  });

  return storePromise;
}

function sameSettings(left: unknown, right: AppSettings): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function writeSettings(settings: AppSettings): Promise<void> {
  const store = await getStore();
  await store.set(SETTINGS_KEY, settings);
  await store.save();
}

export async function loadAppSettings(): Promise<AppSettings> {
  const store = await getStore();
  const stored = await store.get<unknown>(SETTINGS_KEY);
  const normalized = normalizeAppSettings(stored);

  if (!sameSettings(stored, normalized)) {
    await writeSettings(normalized);
  }

  return normalized;
}

export function updateAppSettings(
  patch: AppSettingsPatch,
): Promise<AppSettings> {
  const operation = writeQueue.then(async () => {
    const current = await loadAppSettings();
    const next = mergeAppSettings(current, patch);
    await writeSettings(next);
    return next;
  });

  writeQueue = operation.then(
    () => undefined,
    () => undefined,
  );

  return operation;
}
