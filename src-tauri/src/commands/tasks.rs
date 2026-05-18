use rusqlite::{params, Connection, Row};
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;

use crate::commands::session::{require_user_id, ActiveUser};
use crate::models::task::{NewTask, Task, UpdateTask};

pub type DbState = Mutex<Connection>;

fn map_task_row(row: &Row<'_>) -> rusqlite::Result<Task> {
    Ok(Task {
        id: row.get(0)?,
        title: row.get(1)?,
        description: row.get(2)?,
        due_date: row.get(3)?,
        due_time: row.get(4)?,
        priority: row.get(5)?,
        category: row.get(6)?,
        status: row.get(7)?,
        recurrence: row.get(8)?,
        parent_id: row.get(9)?,
        position: row.get(10)?,
        created_at: row.get(11)?,
        updated_at: row.get(12)?,
    })
}

fn fetch_task_by_id(conn: &Connection, id: &str, user_id: &str) -> Result<Task, String> {
    conn.query_row(
        "SELECT id, title, description, due_date, due_time, priority, category, status, recurrence, parent_id, position, created_at, updated_at FROM tasks WHERE id = ? AND user_id = ?",
        params![id, user_id],
        map_task_row,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_tasks(
    db: State<'_, DbState>,
    active: State<'_, ActiveUser>,
    date: Option<String>,
) -> Result<Vec<Task>, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;

    let mut tasks = Vec::new();

    if let Some(d) = date {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, description, due_date, due_time, priority, category, status, recurrence, parent_id, position, created_at, updated_at FROM tasks WHERE user_id = ? AND (due_date = ? OR recurrence != 'none') ORDER BY position ASC",
            )
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map(params![user_id, d], map_task_row)
            .map_err(|e| e.to_string())?;
        for task in rows {
            tasks.push(task.map_err(|e| e.to_string())?);
        }
    } else {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, description, due_date, due_time, priority, category, status, recurrence, parent_id, position, created_at, updated_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
            )
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([&user_id], map_task_row)
            .map_err(|e| e.to_string())?;
        for task in rows {
            tasks.push(task.map_err(|e| e.to_string())?);
        }
    }

    Ok(tasks)
}

#[tauri::command]
pub fn create_task(
    db: State<'_, DbState>,
    active: State<'_, ActiveUser>,
    task: NewTask,
) -> Result<Task, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO tasks (id, title, description, due_date, due_time, priority, category, status, recurrence, parent_id, created_at, updated_at, user_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        params![
            id,
            task.title,
            task.description,
            task.due_date,
            task.due_time,
            task.priority.unwrap_or_else(|| "medium".to_string()),
            task.category.unwrap_or_else(|| "Personal".to_string()),
            task.status.unwrap_or_else(|| "todo".to_string()),
            task.recurrence.unwrap_or_else(|| "none".to_string()),
            task.parent_id,
            now,
            now,
            user_id,
        ],
    )
    .map_err(|e| e.to_string())?;

    fetch_task_by_id(&conn, &id, &user_id)
}

#[tauri::command]
pub fn update_task(
    db: State<'_, DbState>,
    active: State<'_, ActiveUser>,
    id: String,
    task: UpdateTask,
) -> Result<Task, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    if let Some(title) = task.title {
        conn.execute(
            "UPDATE tasks SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![title, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(desc) = task.description {
        conn.execute(
            "UPDATE tasks SET description = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![desc, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(date) = task.due_date {
        conn.execute(
            "UPDATE tasks SET due_date = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![date, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(time) = task.due_time {
        conn.execute(
            "UPDATE tasks SET due_time = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![time, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(prio) = task.priority {
        conn.execute(
            "UPDATE tasks SET priority = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![prio, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(cat) = task.category {
        conn.execute(
            "UPDATE tasks SET category = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![cat, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(status) = task.status {
        conn.execute(
            "UPDATE tasks SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![status, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(rec) = task.recurrence {
        conn.execute(
            "UPDATE tasks SET recurrence = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![rec, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(pos) = task.position {
        conn.execute(
            "UPDATE tasks SET position = ?, updated_at = ? WHERE id = ? AND user_id = ?",
            params![pos, now, id, user_id],
        )
        .map_err(|e| e.to_string())?;
    }

    fetch_task_by_id(&conn, &id, &user_id)
}

#[tauri::command]
pub fn delete_task(
    db: State<'_, DbState>,
    active: State<'_, ActiveUser>,
    id: String,
) -> Result<bool, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;
    let changed = conn
        .execute(
            "DELETE FROM tasks WHERE id = ? AND user_id = ?",
            params![id, user_id],
        )
        .map_err(|e| e.to_string())?;
    Ok(changed > 0)
}
