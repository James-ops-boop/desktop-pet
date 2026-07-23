import { invoke } from "@tauri-apps/api/core";
import type { SettingsSnapshot } from "../settings-store/settingsStore";

export function isLaunchAtStartupEnabled(): Promise<boolean> {
  return invoke<boolean>("is_launch_at_startup_enabled");
}

export function setLaunchAtStartup(
  enabled: boolean,
): Promise<SettingsSnapshot> {
  return invoke<SettingsSnapshot>("set_launch_at_startup", { enabled });
}
