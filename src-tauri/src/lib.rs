pub mod models;
pub mod db;
pub mod commands;

use std::sync::Mutex;
use tauri::Manager;
use tauri_plugin_notification::NotificationExt;

use commands::session::ActiveUser;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            let app_handle = app.handle();
            let conn = db::init_db(app_handle)?;
            app.manage(Mutex::new(conn));
            app.manage(ActiveUser(Mutex::new(None)));

            // Background task for notifications (every 5 minutes)
            let app_handle_clone = app_handle.clone();
            std::thread::spawn(move || {
                loop {
                    check_upcoming_tasks(&app_handle_clone);
                    std::thread::sleep(std::time::Duration::from_secs(300));
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::auth::has_users,
            commands::auth::register,
            commands::auth::login,
            commands::auth::get_user_by_id,
            commands::session::set_active_user,
            commands::session::clear_active_user,
            commands::tasks::get_tasks,
            commands::tasks::create_task,
            commands::tasks::update_task,
            commands::tasks::delete_task,
            commands::notes::get_notes,
            commands::notes::create_note,
            commands::notes::update_note,
            commands::notes::delete_note,
            commands::stats::get_dashboard_stats,
            commands::stats::get_weekly_stats,
            commands::stats::get_streak,
            commands::achievements::get_achievements,
            commands::achievements::unlock_achievement,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn check_upcoming_tasks(app: &tauri::AppHandle) {
    let db_state = app.try_state::<Mutex<rusqlite::Connection>>();
    let user_state = app.try_state::<ActiveUser>();
    if let (Some(db), Some(active)) = (db_state, user_state) {
        let user_id = active.0.lock().ok().and_then(|u| u.clone());
        let Some(user_id) = user_id else {
            return;
        };
        if let Ok(conn) = db.lock() {
            let now = chrono::Local::now();
            let today = now.format("%Y-%m-%d").to_string();
            let soon = (now + chrono::Duration::minutes(30)).format("%H:%M:%S").to_string();
            let current_time = now.format("%H:%M:%S").to_string();

            let mut stmt = conn.prepare(
                "SELECT title FROM tasks WHERE user_id = ? AND due_date = ? AND due_time > ? AND due_time <= ? AND status != 'done'"
            ).ok();

            if let Some(mut s) = stmt {
                let rows = s.query_map(rusqlite::params![user_id, today, current_time, soon], |row| row.get::<_, String>(0)).ok();
                if let Some(tasks) = rows {
                    for task_title in tasks.flatten() {
                        app.notification()
                            .builder()
                            .title("Task Due Soon")
                            .body(format!("'{}' is due within 30 minutes!", task_title))
                            .show()
                            .ok();
                    }
                }
            }
        }
    }
}
