use std::sync::Mutex;
use tauri::State;

pub struct ActiveUser(pub Mutex<Option<String>>);

pub fn require_user_id(active: &State<ActiveUser>) -> Result<String, String> {
    active
        .0
        .lock()
        .map_err(|e| e.to_string())?
        .clone()
        .ok_or_else(|| "Not signed in. Please log in again.".to_string())
}

#[tauri::command]
pub fn set_active_user(active: State<ActiveUser>, user_id: String) -> Result<(), String> {
    *active.0.lock().map_err(|e| e.to_string())? = Some(user_id);
    Ok(())
}

#[tauri::command]
pub fn clear_active_user(active: State<ActiveUser>) -> Result<(), String> {
    *active.0.lock().map_err(|e| e.to_string())? = None;
    Ok(())
}
