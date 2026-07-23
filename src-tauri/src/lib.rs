mod commands;
mod settings;
mod single_instance;
mod windows;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            single_instance::handle_second_instance(app);
        }))
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]),
        ))
        .manage(settings::SettingsState::default())
        .setup(|app| {
            windows::install_settings_lifecycle(app);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::window::show_settings,
            commands::window::hide_settings,
            commands::window::minimize_settings,
            commands::window::center_pet,
            commands::window::center_pet_without_saving,
            commands::window::exit_application,
            commands::settings::load_app_settings,
            commands::settings::patch_app_settings,
            commands::settings::replace_app_settings,
            commands::startup::is_launch_at_startup_enabled,
            commands::startup::set_launch_at_startup,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Shadow Companion");
}
