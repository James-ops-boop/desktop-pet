use serde::Serialize;
use tauri::{AppHandle, Manager, WindowEvent};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Phase0Info {
    app_data_dir: String,
    process_id: u32,
    window_labels: Vec<String>,
}

fn reveal_settings(app: &AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("settings")
        .ok_or_else(|| "settings window is not available".to_string())?;

    window.unminimize().map_err(|error| error.to_string())?;
    window.show().map_err(|error| error.to_string())?;
    window.set_focus().map_err(|error| error.to_string())
}

#[tauri::command]
fn show_settings(app: AppHandle) -> Result<(), String> {
    reveal_settings(&app)
}

#[tauri::command]
fn hide_settings(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("settings")
        .ok_or_else(|| "settings window is not available".to_string())?;

    window.hide().map_err(|error| error.to_string())
}

#[tauri::command]
fn phase0_info(app: AppHandle) -> Result<Phase0Info, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
    let mut window_labels = app.webview_windows().keys().cloned().collect::<Vec<_>>();
    window_labels.sort();

    Ok(Phase0Info {
        app_data_dir: app_data_dir.display().to_string(),
        process_id: std::process::id(),
        window_labels,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // The single-instance plugin must be registered first. A second launch
        // reveals the already-created settings window in the original process.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = reveal_settings(app);
        }))
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            if let Some(settings) = app.get_webview_window("settings") {
                let settings_to_hide = settings.clone();
                settings.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = settings_to_hide.hide();
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            show_settings,
            hide_settings,
            phase0_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running Shadow Companion");
}
