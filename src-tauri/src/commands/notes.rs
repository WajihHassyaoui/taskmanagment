use rusqlite::{params, Row};
use tauri::State;
use uuid::Uuid;

use crate::commands::session::{require_user_id, ActiveUser};
use crate::commands::tasks::DbState;
use crate::models::note::{NewNote, Note, UpdateNote};

fn map_note_row(row: &Row<'_>) -> rusqlite::Result<Note> {
    Ok(Note {
        id: row.get(0)?,
        title: row.get(1)?,
        content: row.get(2)?,
        tags: row.get(3)?,
        color: row.get(4)?,
        pinned: row.get::<_, i32>(5)? != 0,
        task_id: row.get(6)?,
        created_at: row.get(7)?,
        updated_at: row.get(8)?,
    })
}

fn fetch_note_by_id(
    conn: &rusqlite::Connection,
    id: &str,
    user_id: &str,
) -> Result<Note, String> {
    conn.query_row(
        "SELECT id, title, content, tags, color, pinned, task_id, created_at, updated_at FROM notes WHERE id = ? AND user_id = ?",
        params![id, user_id],
        map_note_row,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_notes(db: State<'_, DbState>, active: State<'_, ActiveUser>) -> Result<Vec<Note>, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, title, content, tags, color, pinned, task_id, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY pinned DESC, updated_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([&user_id], map_note_row)
        .map_err(|e| e.to_string())?;

    let mut notes = Vec::new();
    for note in rows {
        notes.push(note.map_err(|e| e.to_string())?);
    }
    Ok(notes)
}

#[tauri::command]
pub fn create_note(
    db: State<'_, DbState>,
    active: State<'_, ActiveUser>,
    note: NewNote,
) -> Result<Note, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO notes (id, title, content, tags, color, pinned, task_id, created_at, updated_at, user_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![
            id,
            note.title,
            note.content,
            note.tags,
            note.color.unwrap_or_else(|| "#ffffff".to_string()),
            if note.pinned.unwrap_or(false) { 1 } else { 0 },
            note.task_id,
            now,
            now,
            user_id,
        ],
    )
    .map_err(|e| e.to_string())?;

    fetch_note_by_id(&conn, &id, &user_id)
}

#[tauri::command]
pub fn update_note(
    db: State<'_, DbState>,
    active: State<'_, ActiveUser>,
    id: String,
    note: UpdateNote,
) -> Result<Note, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    if let Some(title) = note.title {
        conn.execute(
            "UPDATE notes SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![title, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(content) = note.content {
        conn.execute(
            "UPDATE notes SET content = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![content, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(tags) = note.tags {
        conn.execute(
            "UPDATE notes SET tags = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![tags, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(color) = note.color {
        conn.execute(
            "UPDATE notes SET color = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![color, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(pinned) = note.pinned {
        conn.execute(
            "UPDATE notes SET pinned = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![if pinned { 1 } else { 0 }, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(task_id) = note.task_id {
        conn.execute(
            "UPDATE notes SET task_id = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![task_id, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }

    fetch_note_by_id(&conn, &id, &user_id)
}

#[tauri::command]
pub fn delete_note(
    db: State<'_, DbState>,
    active: State<'_, ActiveUser>,
    id: String,
) -> Result<bool, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;
    let changed = conn
        .execute(
            "DELETE FROM notes WHERE id = ? AND user_id = ?",
            params![id, user_id],
        )
        .map_err(|e| e.to_string())?;
    Ok(changed > 0)
}
