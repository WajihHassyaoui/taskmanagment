use rusqlite::Connection;
use tauri::State;
use crate::models::stats::Achievement;
use crate::commands::tasks::DbState;

#[tauri::command]
pub fn get_achievements(db: State<'_, DbState>) -> Result<Vec<Achievement>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT * FROM achievements")
        .map_err(|e| e.to_string())?;
    
    let rows = stmt.query_map([], |row| {
        Ok(Achievement {
            id: row.get(0)?,
            key: row.get(1)?,
            unlocked_at: row.get(2)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut achievements = Vec::new();
    for ach in rows {
        achievements.push(ach.map_err(|e| e.to_string())?);
    }
    Ok(achievements)
}

#[tauri::command]
pub fn unlock_achievement(db: State<'_, DbState>, key: String) -> Result<bool, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    conn.execute(
        "UPDATE achievements SET unlocked_at = ? WHERE key = ? AND unlocked_at IS NULL",
        [now, key],
    ).map_err(|e| e.to_string())?;
    
    Ok(true)
}
