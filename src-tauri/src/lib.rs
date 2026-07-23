mod commands;
mod single_instance;
mod windows;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            single_instance::handle_second_instance(app);
        }))
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            windows::install_settings_lifecycle(app);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::window::show_settings,
            commands::window::hide_settings,
            commands::window::minimize_settings,
            commands::window::exit_application,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Shadow Companion");
}
