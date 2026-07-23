use tauri::{AppHandle, Manager, WindowEvent};

const SETTINGS_WINDOW_LABEL: &str = "settings";
const PET_WINDOW_LABEL: &str = "pet";

fn settings_window(app: &AppHandle) -> Result<tauri::WebviewWindow, String> {
    app.get_webview_window(SETTINGS_WINDOW_LABEL)
        .ok_or_else(|| "settings window is not available".to_string())
}

fn pet_window(app: &AppHandle) -> Result<tauri::WebviewWindow, String> {
    app.get_webview_window(PET_WINDOW_LABEL)
        .ok_or_else(|| "pet window is not available".to_string())
}

pub fn reveal_settings(app: &AppHandle) -> Result<(), String> {
    let window = settings_window(app)?;

    // Unminimize is best effort so a platform-specific failure cannot prevent
    // a hidden settings window from being shown and focused.
    let _ = window.unminimize();
    window.show().map_err(|error| error.to_string())?;
    window.set_focus().map_err(|error| error.to_string())
}

pub fn hide_settings(app: &AppHandle) -> Result<(), String> {
    settings_window(app)?
        .hide()
        .map_err(|error| error.to_string())
}

pub fn minimize_settings(app: &AppHandle) -> Result<(), String> {
    settings_window(app)?
        .minimize()
        .map_err(|error| error.to_string())
}

pub fn center_pet(app: &AppHandle) -> Result<((i32, i32), (i32, i32)), String> {
    let window = pet_window(app)?;
    let previous = window.outer_position().map_err(|error| error.to_string())?;
    window.center().map_err(|error| error.to_string())?;
    let position = window.outer_position().map_err(|error| error.to_string())?;

    Ok(((position.x, position.y), (previous.x, previous.y)))
}

pub fn move_pet(app: &AppHandle, x: i32, y: i32) -> Result<(), String> {
    pet_window(app)?
        .set_position(tauri::PhysicalPosition::new(x, y))
        .map_err(|error| error.to_string())
}

pub fn center_pet_without_saving(app: &AppHandle) -> Result<(), String> {
    pet_window(app)?.center().map_err(|error| error.to_string())
}

pub fn install_settings_lifecycle(app: &tauri::App) {
    if let Some(settings) = app.get_webview_window(SETTINGS_WINDOW_LABEL) {
        let settings_to_hide = settings.clone();
        settings.on_window_event(move |event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = settings_to_hide.hide();
            }
        });
    }
}
