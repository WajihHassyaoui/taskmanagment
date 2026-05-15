use rusqlite::{params, Connection};
use tauri::State;
use uuid::Uuid;
use crate::models::note::{Note, NewNote, UpdateNote};
use crate::commands::tasks::DbState;

#[tauri::command]
pub fn get_notes(db: State<'_, DbState>) -> Result<Vec<Note>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT * FROM notes ORDER BY pinned DESC, updated_at DESC")
        .map_err(|e| e.to_string())?;
    
    let rows = stmt.query_map([], |row| {
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
    }).map_err(|e| e.to_string())?;

    let mut notes = Vec::new();
    for note in rows {
        notes.push(note.map_err(|e| e.to_string())?);
    }
    Ok(notes)
}

#[tauri::command]
pub fn create_note(db: State<'_, DbState>, note: NewNote) -> Result<Note, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    conn.execute(
        "INSERT INTO notes (id, title, content, tags, color, pinned, task_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![
            id,
            note.title,
            note.content,
            note.tags,
            note.color.unwrap_or_else(|| "#ffffff".to_string()),
            if note.pinned.unwrap_or(false) { 1 } else { 0 },
            note.task_id,
            now,
            now
        ],
    ).map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare("SELECT * FROM notes WHERE id = ?").map_err(|e| e.to_string())?;
    let note_obj = stmt.query_row([&id], |row| {
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
    }).map_err(|e| e.to_string())?;

    Ok(note_obj)
}

#[tauri::command]
pub fn update_note(db: State<'_, DbState>, id: String, note: UpdateNote) -> Result<Note, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    if let Some(title) = note.title {
        conn.execute("UPDATE notes SET title = ?, updated_at = ? WHERE id = ?", params![title, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(content) = note.content {
        conn.execute("UPDATE notes SET content = ?, updated_at = ? WHERE id = ?", params![content, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(tags) = note.tags {
        conn.execute("UPDATE notes SET tags = ?, updated_at = ? WHERE id = ?", params![tags, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(color) = note.color {
        conn.execute("UPDATE notes SET color = ?, updated_at = ? WHERE id = ?", params![color, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(pinned) = note.pinned {
        conn.execute("UPDATE notes SET pinned = ?, updated_at = ? WHERE id = ?", params![if pinned { 1 } else { 0 }, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(task_id) = note.task_id {
        conn.execute("UPDATE notes SET task_id = ?, updated_at = ? WHERE id = ?", params![task_id, now, id]).map_err(|e| e.to_string())?;
    }

    let mut stmt = conn.prepare("SELECT * FROM notes WHERE id = ?").map_err(|e| e.to_string())?;
    let note_obj = stmt.query_row([&id], |row| {
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
    }).map_err(|e| e.to_string())?;

    Ok(note_obj)
}

#[tauri::command]
pub fn delete_note(db: State<'_, DbState>, id: String) -> Result<bool, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM notes WHERE id = ?", [id]).map_err(|e| e.to_string())?;
    Ok(true)
}
