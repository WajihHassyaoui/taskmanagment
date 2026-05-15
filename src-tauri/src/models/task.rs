use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub due_date: Option<String>,
    pub due_time: Option<String>,
    pub priority: String,
    pub category: String,
    pub status: String,
    pub recurrence: String,
    pub parent_id: Option<String>,
    pub position: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct NewTask {
    pub title: String,
    pub description: Option<String>,
    pub due_date: Option<String>,
    pub due_time: Option<String>,
    pub priority: Option<String>,
    pub category: Option<String>,
    pub status: Option<String>,
    pub recurrence: Option<String>,
    pub parent_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTask {
    pub title: Option<String>,
    pub description: Option<String>,
    pub due_date: Option<String>,
    pub due_time: Option<String>,
    pub priority: Option<String>,
    pub category: Option<String>,
    pub status: Option<String>,
    pub recurrence: Option<String>,
    pub parent_id: Option<String>,
    pub position: Option<i32>,
}
