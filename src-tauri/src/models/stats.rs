use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DayStat {
    pub date: String,
    pub tasks_completed: i32,
    pub tasks_total: i32,
    pub streak: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardStats {
    pub tasks_today: i32,
    pub completed_today: i32,
    pub pending_today: i32,
    pub weekly_completion_rate: f32,
    pub current_streak: i32,
    pub total_notes: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Achievement {
    pub id: String,
    pub key: String,
    pub unlocked_at: Option<String>,
}
