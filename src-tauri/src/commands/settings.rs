use serde_json::{Map, Value};
use tauri::{AppHandle, State};

use crate::settings::{SettingsSnapshot, SettingsState};

#[tauri::command]
pub fn load_app_settings(
    app: AppHandle,
    state: State<'_, SettingsState>,
) -> Result<SettingsSnapshot, String> {
    crate::settings::load(&app, state.inner())
}

#[tauri::command]
pub fn patch_app_settings(
    app: AppHandle,
    state: State<'_, SettingsState>,
    patch: Map<String, Value>,
) -> Result<SettingsSnapshot, String> {
    crate::settings::patch(&app, state.inner(), patch)
}

#[tauri::command]
pub fn replace_app_settings(
    app: AppHandle,
    state: State<'_, SettingsState>,
    settings: Value,
    expected_revision: Option<u64>,
) -> Result<SettingsSnapshot, String> {
    crate::settings::replace(&app, state.inner(), settings, expected_revision)
}
