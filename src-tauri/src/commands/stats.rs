use rusqlite::params;
use tauri::State;
use chrono::{Datelike, Duration, Local};

use crate::commands::session::{require_user_id, ActiveUser};
use crate::commands::tasks::DbState;
use crate::models::stats::{DashboardStats, DayStat};

#[tauri::command]
pub fn get_dashboard_stats(
    db: State<'_, DbState>,
    active: State<'_, ActiveUser>,
) -> Result<DashboardStats, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;
    let today = Local::now().format("%Y-%m-%d").to_string();

    let tasks_today: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM tasks WHERE user_id = ? AND due_date = ?",
            params![user_id, today],
            |row| row.get(0),
        )
        .unwrap_or(0);

    let completed_today: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM tasks WHERE user_id = ? AND due_date = ? AND status = 'done'",
            params![user_id, today],
            |row| row.get(0),
        )
        .unwrap_or(0);

    let total_notes: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM notes WHERE user_id = ?",
            [&user_id],
            |row| row.get(0),
        )
        .unwrap_or(0);

    let last_7_days = (0..7)
        .map(|i| (Local::now() - Duration::days(i)).format("%Y-%m-%d").to_string())
        .collect::<Vec<_>>();

    let mut total_tasks = 0;
    let mut completed_tasks = 0;

    for date in &last_7_days {
        let t: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM tasks WHERE user_id = ? AND due_date = ?",
                params![user_id, date],
                |row| row.get(0),
            )
            .unwrap_or(0);
        let c: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM tasks WHERE user_id = ? AND due_date = ? AND status = 'done'",
                params![user_id, date],
                |row| row.get(0),
            )
            .unwrap_or(0);
        total_tasks += t;
        completed_tasks += c;
    }

    let weekly_completion_rate = if total_tasks > 0 {
        (completed_tasks as f32 / total_tasks as f32) * 100.0
    } else {
        0.0
    };

    let current_streak: i32 = conn
        .query_row(
            "SELECT streak FROM daily_stats WHERE user_id = ? AND date = ?",
            params![user_id, today],
            |row| row.get(0),
        )
        .unwrap_or(0);

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
pub fn get_weekly_stats(
    db: State<'_, DbState>,
    active: State<'_, ActiveUser>,
) -> Result<Vec<DayStat>, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;
    let now = Local::now();
    let weekday = now.weekday().num_days_from_monday();
    let monday = now - Duration::days(weekday as i64);

    let mut stats = Vec::new();
    for i in 0..7 {
        let date = (monday + Duration::days(i)).format("%Y-%m-%d").to_string();
        let tasks_total: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM tasks WHERE user_id = ? AND due_date = ?",
                params![user_id, date],
                |row| row.get(0),
            )
            .unwrap_or(0);
        let tasks_completed: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM tasks WHERE user_id = ? AND due_date = ? AND status = 'done'",
                params![user_id, date],
                |row| row.get(0),
            )
            .unwrap_or(0);
        let streak: i32 = conn
            .query_row(
                "SELECT streak FROM daily_stats WHERE user_id = ? AND date = ?",
                params![user_id, date],
                |row| row.get(0),
            )
            .unwrap_or(0);

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
pub fn get_streak(db: State<'_, DbState>, active: State<'_, ActiveUser>) -> Result<i32, String> {
    let user_id = require_user_id(&active)?;
    let conn = db.lock().map_err(|e| e.to_string())?;
    let today = Local::now().format("%Y-%m-%d").to_string();
    let streak: i32 = conn
        .query_row(
            "SELECT streak FROM daily_stats WHERE user_id = ? AND date = ?",
            params![user_id, today],
            |row| row.get(0),
        )
        .unwrap_or(0);
    Ok(streak)
}
