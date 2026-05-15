use rusqlite::{params, Connection};
use tauri::State;
use std::sync::Mutex;
use uuid::Uuid;
use crate::models::task::{Task, NewTask, UpdateTask};

pub type DbState = Mutex<Connection>;

#[tauri::command]
pub fn get_tasks(db: State<'_, DbState>, date: Option<String>) -> Result<Vec<Task>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let mut stmt = if let Some(d) = date {
        let mut s = conn.prepare("SELECT * FROM tasks WHERE due_date = ? OR recurrence != 'none' ORDER BY position ASC")
            .map_err(|e| e.to_string())?;
        let rows = s.query_map([d], |row| {
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
        }).map_err(|e| e.to_string())?;
        
        let mut tasks = Vec::new();
        for task in rows {
            tasks.push(task.map_err(|e| e.to_string())?);
        }
        return Ok(tasks);
    } else {
        conn.prepare("SELECT * FROM tasks ORDER BY created_at DESC")
            .map_err(|e| e.to_string())?
    };

    let rows = stmt.query_map([], |row| {
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
    }).map_err(|e| e.to_string())?;

    let mut tasks = Vec::new();
    for task in rows {
        tasks.push(task.map_err(|e| e.to_string())?);
    }
    Ok(tasks)
}

#[tauri::command]
pub fn create_task(db: State<'_, DbState>, task: NewTask) -> Result<Task, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    conn.execute(
        "INSERT INTO tasks (id, title, description, due_date, due_time, priority, category, status, recurrence, parent_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
            now
        ],
    ).map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare("SELECT * FROM tasks WHERE id = ?").map_err(|e| e.to_string())?;
    let task_obj = stmt.query_row([&id], |row| {
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
    }).map_err(|e| e.to_string())?;

    Ok(task_obj)
}

#[tauri::command]
pub fn update_task(db: State<'_, DbState>, id: String, task: UpdateTask) -> Result<Task, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    if let Some(title) = task.title {
        conn.execute("UPDATE tasks SET title = ?, updated_at = ? WHERE id = ?", params![title, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(desc) = task.description {
        conn.execute("UPDATE tasks SET description = ?, updated_at = ? WHERE id = ?", params![desc, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(date) = task.due_date {
        conn.execute("UPDATE tasks SET due_date = ?, updated_at = ? WHERE id = ?", params![date, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(time) = task.due_time {
        conn.execute("UPDATE tasks SET due_time = ?, updated_at = ? WHERE id = ?", params![time, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(prio) = task.priority {
        conn.execute("UPDATE tasks SET priority = ?, updated_at = ? WHERE id = ?", params![prio, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(cat) = task.category {
        conn.execute("UPDATE tasks SET category = ?, updated_at = ? WHERE id = ?", params![cat, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(status) = task.status {
        conn.execute("UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?", params![status, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(rec) = task.recurrence {
        conn.execute("UPDATE tasks SET recurrence = ?, updated_at = ? WHERE id = ?", params![rec, now, id]).map_err(|e| e.to_string())?;
    }
    if let Some(pos) = task.position {
        conn.execute("UPDATE tasks SET position = ?, updated_at = ? WHERE id = ?", params![pos, now, id]).map_err(|e| e.to_string())?;
    }

    let mut stmt = conn.prepare("SELECT * FROM tasks WHERE id = ?").map_err(|e| e.to_string())?;
    let task_obj = stmt.query_row([&id], |row| {
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
    }).map_err(|e| e.to_string())?;

    Ok(task_obj)
}

#[tauri::command]
pub fn delete_task(db: State<'_, DbState>, id: String) -> Result<bool, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tasks WHERE id = ?", [id]).map_err(|e| e.to_string())?;
    Ok(true)
}
