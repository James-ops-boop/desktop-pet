use tauri::{AppHandle, Manager, WindowEvent};

const SETTINGS_WINDOW_LABEL: &str = "settings";

fn settings_window(app: &AppHandle) -> Result<tauri::WebviewWindow, String> {
    app.get_webview_window(SETTINGS_WINDOW_LABEL)
        .ok_or_else(|| "settings window is not available".to_string())
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
