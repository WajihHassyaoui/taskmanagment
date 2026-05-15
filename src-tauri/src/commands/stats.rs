use rusqlite::Connection;
use tauri::State;
use crate::models::stats::{DashboardStats, DayStat};
use crate::commands::tasks::DbState;
use chrono::{Local, Duration, Datelike};

#[tauri::command]
pub fn get_dashboard_stats(db: State<'_, DbState>) -> Result<DashboardStats, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let today = Local::now().format("%Y-%m-%d").to_string();

    let tasks_today: i32 = conn.query_row(
        "SELECT COUNT(*) FROM tasks WHERE due_date = ?",
        [&today],
        |row| row.get(0)
    ).unwrap_or(0);

    let completed_today: i32 = conn.query_row(
        "SELECT COUNT(*) FROM tasks WHERE due_date = ? AND status = 'done'",
        [&today],
        |row| row.get(0)
    ).unwrap_or(0);

    let total_notes: i32 = conn.query_row(
        "SELECT COUNT(*) FROM notes",
        [],
        |row| row.get(0)
    ).unwrap_or(0);

    // Calculate weekly completion rate
    let last_7_days = (0..7).map(|i| {
        (Local::now() - Duration::days(i)).format("%Y-%m-%d").to_string()
    }).collect::<Vec<_>>();

    let mut total_tasks = 0;
    let mut completed_tasks = 0;

    for date in &last_7_days {
        let t: i32 = conn.query_row("SELECT COUNT(*) FROM tasks WHERE due_date = ?", [date], |row| row.get(0)).unwrap_or(0);
        let c: i32 = conn.query_row("SELECT COUNT(*) FROM tasks WHERE due_date = ? AND status = 'done'", [date], |row| row.get(0)).unwrap_or(0);
        total_tasks += t;
        completed_tasks += c;
    }

    let weekly_completion_rate = if total_tasks > 0 {
        (completed_tasks as f32 / total_tasks as f32) * 100.0
    } else {
        0.0
    };

    let current_streak: i32 = conn.query_row(
        "SELECT streak FROM daily_stats WHERE date = ?",
        [&today],
        |row| row.get(0)
    ).unwrap_or(0);

    Ok(DashboardStats {
        tasks_today,
        completed_today,
        pending_today: tasks_today - completed_today,
        weekly_completion_rate,
        current_streak,
        total_notes,
    })
}

#[tauri::command]
pub fn get_weekly_stats(db: State<'_, DbState>) -> Result<Vec<DayStat>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let now = Local::now();
    let weekday = now.weekday().num_days_from_monday();
    let monday = now - Duration::days(weekday as i64);
    
    let mut stats = Vec::new();
    for i in 0..7 {
        let date = (monday + Duration::days(i)).format("%Y-%m-%d").to_string();
        let tasks_total: i32 = conn.query_row("SELECT COUNT(*) FROM tasks WHERE due_date = ?", [&date], |row| row.get(0)).unwrap_or(0);
        let tasks_completed: i32 = conn.query_row("SELECT COUNT(*) FROM tasks WHERE due_date = ? AND status = 'done'", [&date], |row| row.get(0)).unwrap_or(0);
        let streak: i32 = conn.query_row("SELECT streak FROM daily_stats WHERE date = ?", [&date], |row| row.get(0)).unwrap_or(0);
        
        stats.push(DayStat {
            date,
            tasks_completed,
            tasks_total,
            streak,
        });
    }
    
    Ok(stats)
}

#[tauri::command]
pub fn get_streak(db: State<'_, DbState>) -> Result<i32, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let today = Local::now().format("%Y-%m-%d").to_string();
    let streak: i32 = conn.query_row(
        "SELECT streak FROM daily_stats WHERE date = ?",
        [&today],
        |row| row.get(0)
    ).unwrap_or(0);
    Ok(streak)
}
