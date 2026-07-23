use serde_json::{json, Map};
use tauri::{AppHandle, State};
use tauri_plugin_autostart::ManagerExt;

use crate::settings::{SettingsSnapshot, SettingsState};

#[tauri::command]
pub fn is_launch_at_startup_enabled(app: AppHandle) -> Result<bool, String> {
    app.autolaunch()
        .is_enabled()
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn set_launch_at_startup(
    app: AppHandle,
    state: State<'_, SettingsState>,
    enabled: bool,
) -> Result<SettingsSnapshot, String> {
    let manager = app.autolaunch();
    let previous = manager.is_enabled().map_err(|error| error.to_string())?;

    if enabled {
        manager.enable().map_err(|error| error.to_string())?;
    } else {
        manager.disable().map_err(|error| error.to_string())?;
    }

    let actual = match manager.is_enabled() {
        Ok(actual) => actual,
        Err(error) => {
            if previous {
                let _ = manager.enable();
            } else {
                let _ = manager.disable();
            }
            return Err(format!(
                "failed to verify autostart state; previous state was restored: {error}"
            ));
        }
    };
    if actual != enabled {
        if previous {
            let _ = manager.enable();
        } else {
            let _ = manager.disable();
        }
        return Err(format!(
            "autostart state did not change to the requested value: {enabled}"
        ));
    }

    let patch = Map::from_iter([("launchAtStartup".to_string(), json!(actual))]);
    match crate::settings::patch(&app, state.inner(), patch) {
        Ok(snapshot) => Ok(snapshot),
        Err(settings_error) => {
            let rollback = if previous {
                manager.enable()
            } else {
                manager.disable()
            };

            match rollback {
                Ok(()) => Err(format!(
                    "failed to persist autostart setting; system state was restored: {settings_error}"
                )),
                Err(rollback_error) => Err(format!(
                    "failed to persist autostart setting ({settings_error}) and failed to restore system state ({rollback_error})"
                )),
            }
        }
    }
}
