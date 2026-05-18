use rusqlite::params;
use tauri::State;

use crate::commands::session::{require_user_id, ActiveUser};
use crate::commands::tasks::DbState;
use crate::db::user_scope;
use crate::models::stats::Achievement;

#[tauri::command]
pub fn get_achievements(
    db: State<'_, DbState>,
    active: State<'_, ActiveUser>,
) -> Result<Vec<Achievement>, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;

    user_scope::seed_user_achievements(&conn, &user_id)?;

    let mut stmt = conn
        .prepare("SELECT id, key, unlocked_at FROM achievements WHERE user_id = ?")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([&user_id], |row| {
            Ok(Achievement {
                id: row.get(0)?,
                key: row.get(1)?,
                unlocked_at: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut achievements = Vec::new();
    for ach in rows {
        achievements.push(ach.map_err(|e| e.to_string())?);
    }
    Ok(achievements)
}

#[tauri::command]
pub fn unlock_achievement(
    db: State<'_, DbState>,
    active: State<'_, ActiveUser>,
    key: String,
) -> Result<bool, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "UPDATE achievements SET unlocked_at = ? WHERE user_id = ? AND key = ? AND unlocked_at IS NULL",
        params![now, user_id, key],
    )
    .map_err(|e| e.to_string())?;

    Ok(true)
}
