use rusqlite::Connection;

const BADGE_KEYS: [&str; 8] = [
    "first_task",
    "on_fire",
    "centurion",
    "early_bird",
    "night_owl",
    "planner",
    "notes_buff",
    "streak_30",
];

fn table_has_column(conn: &Connection, table: &str, column: &str) -> Result<bool, String> {
    let mut stmt = conn
        .prepare(&format!("PRAGMA table_info({})", table))
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| row.get::<_, String>(1))
        .map_err(|e| e.to_string())?;
    for name in rows.flatten() {
        if name == column {
            return Ok(true);
        }
    }
    Ok(false)
}

fn migrate_achievements_table(conn: &Connection) -> Result<(), String> {
    if table_has_column(conn, "achievements", "user_id")? {
        return Ok(());
    }

    conn.execute_batch(
        r#"
        CREATE TABLE IF NOT EXISTS achievements_new (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            key TEXT NOT NULL,
            unlocked_at TEXT,
            UNIQUE(user_id, key)
        );
        DROP TABLE IF EXISTS achievements;
        ALTER TABLE achievements_new RENAME TO achievements;
        "#,
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub fn ensure_user_scoping(conn: &Connection) -> Result<(), String> {
    for table in ["tasks", "notes", "daily_stats"] {
        if !table_has_column(conn, table, "user_id")? {
            conn.execute(
                &format!("ALTER TABLE {} ADD COLUMN user_id TEXT", table),
                [],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    migrate_achievements_table(conn)?;

    Ok(())
}

pub fn seed_user_achievements(conn: &Connection, user_id: &str) -> Result<(), String> {
    let count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM achievements WHERE user_id = ?",
            [user_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    if count > 0 {
        return Ok(());
    }

    for key in BADGE_KEYS {
        let id = uuid::Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO achievements (id, user_id, key) VALUES (?, ?, ?)",
            [id, user_id.to_string(), key.to_string()],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}
