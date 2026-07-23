import { invoke } from "@tauri-apps/api/core";

export function showSettingsWindow(): Promise<void> {
  return invoke("show_settings");
}

export function hideSettingsWindow(): Promise<void> {
  return invoke("hide_settings");
}

export function minimizeSettingsWindow(): Promise<void> {
  return invoke("minimize_settings");
}

export function centerPetWindow(): Promise<void> {
  return invoke("center_pet");
}

export function centerPetWindowWithoutSaving(): Promise<void> {
  return invoke("center_pet_without_saving");
}

export async function exitApplication(): Promise<void> {
  try {
    await invoke("exit_application");
  } catch {
    // A successful exit can close the IPC channel before invoke resolves.
  }
}
