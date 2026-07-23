use serde::Serialize;
use serde_json::{Map, Value};
use std::sync::{
    atomic::{AtomicU64, Ordering},
    Mutex,
};
use tauri::{AppHandle, Emitter};
use tauri_plugin_store::StoreExt;

pub const SETTINGS_CHANGED_EVENT: &str = "app-settings://changed";
const SETTINGS_STORE_PATH: &str = "settings.json";
const SETTINGS_KEY: &str = "appSettings";

#[derive(Default)]
pub struct SettingsState {
    operation_lock: Mutex<()>,
    revision: AtomicU64,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SettingsSnapshot {
    pub revision: u64,
    pub settings: Value,
}

fn current_snapshot(app: &AppHandle, state: &SettingsState) -> Result<SettingsSnapshot, String> {
    let store = app
        .store(SETTINGS_STORE_PATH)
        .map_err(|error| error.to_string())?;

    Ok(SettingsSnapshot {
        revision: state.revision.load(Ordering::SeqCst),
        settings: store.get(SETTINGS_KEY).unwrap_or(Value::Null),
    })
}

fn persist_settings(
    app: &AppHandle,
    state: &SettingsState,
    next: Value,
) -> Result<SettingsSnapshot, String> {
    if !next.is_object() {
        return Err("app settings must be a JSON object".to_string());
    }

    let store = app
        .store(SETTINGS_STORE_PATH)
        .map_err(|error| error.to_string())?;
    let previous = store.get(SETTINGS_KEY);

    store.set(SETTINGS_KEY.to_string(), next.clone());
    if let Err(error) = store.save() {
        if let Some(previous) = previous {
            store.set(SETTINGS_KEY.to_string(), previous);
        } else {
            store.delete(SETTINGS_KEY);
        }
        return Err(error.to_string());
    }

    let snapshot = SettingsSnapshot {
        revision: state.revision.fetch_add(1, Ordering::SeqCst) + 1,
        settings: next,
    };

    let _ = app.emit(SETTINGS_CHANGED_EVENT, snapshot.clone());
    Ok(snapshot)
}

pub fn load(app: &AppHandle, state: &SettingsState) -> Result<SettingsSnapshot, String> {
    let _guard = state
        .operation_lock
        .lock()
        .map_err(|_| "settings operation lock is poisoned".to_string())?;

    current_snapshot(app, state)
}

pub fn patch(
    app: &AppHandle,
    state: &SettingsState,
    patch: Map<String, Value>,
) -> Result<SettingsSnapshot, String> {
    let _guard = state
        .operation_lock
        .lock()
        .map_err(|_| "settings operation lock is poisoned".to_string())?;
    let current = current_snapshot(app, state)?.settings;
    let mut next = current.as_object().cloned().unwrap_or_default();

    for (key, value) in patch {
        next.insert(key, value);
    }

    persist_settings(app, state, Value::Object(next))
}

pub fn replace(
    app: &AppHandle,
    state: &SettingsState,
    settings: Value,
    expected_revision: Option<u64>,
) -> Result<SettingsSnapshot, String> {
    let _guard = state
        .operation_lock
        .lock()
        .map_err(|_| "settings operation lock is poisoned".to_string())?;

    if let Some(expected_revision) = expected_revision {
        let current_revision = state.revision.load(Ordering::SeqCst);
        if current_revision != expected_revision {
            return Err(format!(
                "settings revision conflict: expected {expected_revision}, current {current_revision}"
            ));
        }
    }

    persist_settings(app, state, settings)
}
