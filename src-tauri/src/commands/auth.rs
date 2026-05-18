use bcrypt::{hash, verify, DEFAULT_COST};
use rusqlite::params;
use tauri::State;
use uuid::Uuid;

use crate::commands::tasks::DbState;
use crate::db::user_scope;
use crate::models::user::{AuthUser, LoginInput, RegisterInput};

fn normalize_username(username: &str) -> Result<String, String> {
    let u = username.trim().to_lowercase();
    if u.len() < 3 {
        return Err("Username must be at least 3 characters".into());
    }
    if !u.chars().all(|c| c.is_ascii_alphanumeric() || c == '_') {
        return Err("Username may only contain letters, numbers, and underscores".into());
    }
    Ok(u)
}

fn validate_password(password: &str) -> Result<(), String> {
    if password.len() < 6 {
        return Err("Password must be at least 6 characters".into());
    }
    Ok(())
}

fn row_to_auth_user(row: &rusqlite::Row<'_>) -> rusqlite::Result<AuthUser> {
    Ok(AuthUser {
        id: row.get(0)?,
        username: row.get(1)?,
        display_name: row.get(2)?,
    })
}

#[tauri::command]
pub fn has_users(db: State<'_, DbState>) -> Result<bool, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    Ok(count > 0)
}

#[tauri::command]
pub fn register(db: State<'_, DbState>, input: RegisterInput) -> Result<AuthUser, String> {
    let username = normalize_username(&input.username)?;
    validate_password(&input.password)?;

    let display_name = input.display_name.trim();
    if display_name.is_empty() {
        return Err("Display name is required".into());
    }

    let conn = db.lock().map_err(|e| e.to_string())?;
    let exists: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM users WHERE username = ?",
            [&username],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    if exists > 0 {
        return Err("Username is already taken".into());
    }

    let id = Uuid::new_v4().to_string();
    let password_hash = hash(input.password, DEFAULT_COST).map_err(|e| e.to_string())?;
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO users (id, username, display_name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
        params![id, username, display_name, password_hash, now],
    )
    .map_err(|e| e.to_string())?;

    user_scope::seed_user_achievements(&conn, &id)?;

    Ok(AuthUser {
        id,
        username,
        display_name: display_name.to_string(),
    })
}

#[tauri::command]
pub fn login(db: State<'_, DbState>, input: LoginInput) -> Result<AuthUser, String> {
    let username = normalize_username(&input.username)?;
    validate_password(&input.password)?;

    let conn = db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, username, display_name, password_hash FROM users WHERE username = ?")
        .map_err(|e| e.to_string())?;

    let result = stmt.query_row([&username], |row| {
        Ok((
            AuthUser {
                id: row.get(0)?,
                username: row.get(1)?,
                display_name: row.get(2)?,
            },
            row.get::<_, String>(3)?,
        ))
    });

    match result {
        Ok((user, hash)) => {
            let valid = verify(input.password, &hash).map_err(|e| e.to_string())?;
            if valid {
                user_scope::seed_user_achievements(&conn, &user.id)?;
                Ok(user)
            } else {
                Err("Invalid username or password".into())
            }
        }
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            Err("Invalid username or password".into())
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn get_user_by_id(db: State<'_, DbState>, id: String) -> Result<AuthUser, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT id, username, display_name FROM users WHERE id = ?",
        [id],
        row_to_auth_user,
    )
    .map_err(|e| e.to_string())
}
