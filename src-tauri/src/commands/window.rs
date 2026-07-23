use tauri::AppHandle;

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
pub fn exit_application(app: AppHandle) {
    app.exit(0);
}
