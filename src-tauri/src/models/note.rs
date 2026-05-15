use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub content: Option<String>,
    pub tags: Option<String>,
    pub color: String,
    pub pinned: bool,
    pub task_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct NewNote {
    pub title: String,
    pub content: Option<String>,
    pub tags: Option<String>,
    pub color: Option<String>,
    pub pinned: Option<bool>,
    pub task_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateNote {
    pub title: Option<String>,
    pub content: Option<String>,
    pub tags: Option<String>,
    pub color: Option<String>,
    pub pinned: Option<bool>,
    pub task_id: Option<String>,
}
