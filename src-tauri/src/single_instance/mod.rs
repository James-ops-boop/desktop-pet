use tauri::AppHandle;

pub fn handle_second_instance(app: &AppHandle) {
    let _ = crate::windows::reveal_settings(app);
}
