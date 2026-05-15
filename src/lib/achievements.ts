export interface Badge {
  key: string;
  title: string;
  description: string;
  icon: string;
}

export const badges: Badge[] = [
  {
    key: "first_task",
    title: "First Task",
    description: "Complete your first task",
    icon: "CheckCircle",
  },
  {
    key: "on_fire",
    title: "On Fire",
    description: "Reach a 7-day streak",
    icon: "Flame",
  },
  {
    key: "centurion",
    title: "Centurion",
    description: "Complete 100 tasks total",
    icon: "Trophy",
  },
  {
    key: "early_bird",
    title: "Early Bird",
    description: "Complete a task before 9AM",
    icon: "Sunrise",
  },
  {
    key: "night_owl",
    title: "Night Owl",
    description: "Complete a task after 10PM",
    icon: "Moon",
  },
  {
    key: "planner",
    title: "Planner",
    description: "Create 10 tasks in one day",
    icon: "Calendar",
  },
  {
    key: "notes_buff",
    title: "Notes Buff",
    description: "Create 20 notes total",
    icon: "FileText",
  },
  {
    key: "streak_30",
    title: "Consistent",
    description: "Reach a 30-day streak",
    icon: "Zap",
  },
];
