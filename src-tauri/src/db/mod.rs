use rusqlite::Connection;
use std::fs;
use tauri::AppHandle;
use tauri::Manager;

pub mod migrations;

pub fn init_db(app_handle: &AppHandle) -> Result<Connection, String> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?;
    
    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    let db_path = app_dir.join("tasks.db");
    
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    
    for migration in migrations::MIGRATIONS {
        conn.execute(migration, []).map_err(|e| e.to_string())?;
    }
    
    // Initialize default categories if they don't exist
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM categories", [], |row| row.get(0)).unwrap_or(0);
    if count == 0 {
        let categories = [
            ("Work", "#6366f1", "briefcase"),
            ("Personal", "#10b981", "user"),
            ("Health", "#ef4444", "heart"),
            ("Learning", "#f59e0b", "book"),
            ("Other", "#6b7280", "tag"),
        ];
        for (name, color, icon) in categories {
            let id = uuid::Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO categories (id, name, color, icon) VALUES (?, ?, ?, ?)",
                [id, name.to_string(), color.to_string(), icon.to_string()],
            ).ok();
        }
    }

    // Initialize achievements
    let ach_count: i64 = conn.query_row("SELECT COUNT(*) FROM achievements", [], |row| row.get(0)).unwrap_or(0);
    if ach_count == 0 {
        let badges = [
            "first_task", "on_fire", "centurion", "early_bird", 
            "night_owl", "planner", "notes_buff", "streak_30"
        ];
        for key in badges {
            let id = uuid::Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO achievements (id, key) VALUES (?, ?)",
                [id, key.to_string()],
            ).ok();
        }
    }
    
    Ok(conn)
}
