import { load, type Store } from "@tauri-apps/plugin-store";
import type { Phase0Probe } from "../../models/phase0";

const STORE_PATH = "phase0-settings.json";
const LAUNCH_COUNT_KEY = "phase0LaunchCount";
const LAST_SAVED_AT_KEY = "phase0LastSavedAt";

let storePromise: Promise<Store> | undefined;

function getStore(): Promise<Store> {
  storePromise ??= load(STORE_PATH, {
    autoSave: false,
    defaults: {
      [LAUNCH_COUNT_KEY]: 0,
      [LAST_SAVED_AT_KEY]: null,
    },
  });

  return storePromise;
}

export async function readPhase0Probe(): Promise<Phase0Probe> {
  const store = await getStore();

  return {
    launchCount: (await store.get<number>(LAUNCH_COUNT_KEY)) ?? 0,
    lastSavedAt: (await store.get<string>(LAST_SAVED_AT_KEY)) ?? null,
  };
}

export async function incrementAndSavePhase0Probe(): Promise<Phase0Probe> {
  const store = await getStore();
  const current = (await store.get<number>(LAUNCH_COUNT_KEY)) ?? 0;
  const lastSavedAt = new Date().toISOString();

  await store.set(LAUNCH_COUNT_KEY, current + 1);
  await store.set(LAST_SAVED_AT_KEY, lastSavedAt);
  await store.save();

  return {
    launchCount: current + 1,
    lastSavedAt,
  };
}
