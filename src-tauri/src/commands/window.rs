use tauri::{AppHandle, State};

#[tauri::command]
pub fn show_settings(app: AppHandle) -> Result<(), String> {
    crate::windows::reveal_settings(&app)
}

#[tauri::command]
pub fn hide_settings(app: AppHandle) -> Result<(), String> {
    crate::windows::hide_settings(&app)
}

#[tauri::command]
pub fn minimize_settings(app: AppHandle) -> Result<(), String> {
    crate::windows::minimize_settings(&app)
}

#[tauri::command]
pub fn center_pet(
    app: AppHandle,
    state: State<'_, crate::settings::SettingsState>,
) -> Result<crate::settings::SettingsSnapshot, String> {
    let ((x, y), (previous_x, previous_y)) = crate::windows::center_pet(&app)?;
    let patch = serde_json::Map::from_iter([
        ("petPositionX".to_string(), serde_json::json!(x)),
        ("petPositionY".to_string(), serde_json::json!(y)),
    ]);

    match crate::settings::patch(&app, state.inner(), patch) {
        Ok(snapshot) => Ok(snapshot),
        Err(settings_error) => {
            let rollback = crate::windows::move_pet(&app, previous_x, previous_y);
            match rollback {
                Ok(()) => Err(format!(
                    "failed to persist centered pet position; window position was restored: {settings_error}"
                )),
                Err(rollback_error) => Err(format!(
                    "failed to persist centered pet position ({settings_error}) and failed to restore the previous window position ({rollback_error})"
                )),
            }
        }
    }
}

#[tauri::command]
pub fn center_pet_without_saving(app: AppHandle) -> Result<(), String> {
    crate::windows::center_pet_without_saving(&app)
}

#[tauri::command]
pub fn exit_application(app: AppHandle) {
    app.exit(0);
}
