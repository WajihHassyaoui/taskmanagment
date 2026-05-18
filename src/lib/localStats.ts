import type { Achievement, DashboardStats, DayStat } from '@/store/statsStore';
import { localGetNotes } from '@/lib/localNotes';
import { localGetTasks } from '@/lib/localTasks';

const ACHIEVEMENT_KEYS = ['first_task', 'week_streak', 'note_master', 'calendar_pro'] as const;

function achievementsKey(userId: string) {
  return `yalla-task-go-achievements-${userId}`;
}

function readAchievements(userId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(achievementsKey(userId));
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

function writeAchievements(userId: string, data: Record<string, string>) {
  localStorage.setItem(achievementsKey(userId), JSON.stringify(data));
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function localGetDashboardStats(userId: string): DashboardStats {
  const tasks = localGetTasks(userId);
  const today = todayStr();
  const todayTasks = tasks.filter((t) => t.due_date === today);
  const completedToday = todayTasks.filter((t) => t.status === 'done').length;
  const notes = localGetNotes(userId);

  return {
    tasks_today: todayTasks.length,
    completed_today: completedToday,
    pending_today: todayTasks.length - completedToday,
    weekly_completion_rate: 0,
    current_streak: 0,
    total_notes: notes.length,
  };
}

export function localGetWeeklyStats(_userId: string): DayStat[] {
  return [];
}

export function localGetAchievements(userId: string): Achievement[] {
  const unlocked = readAchievements(userId);
  return ACHIEVEMENT_KEYS.map((key) => ({
    id: key,
    key,
    unlocked_at: unlocked[key] ?? null,
  }));
}

export function localUnlockAchievement(userId: string, key: string): void {
  const unlocked = readAchievements(userId);
  if (!unlocked[key]) {
    unlocked[key] = new Date().toISOString().slice(0, 19).replace('T', ' ');
    writeAchievements(userId, unlocked);
  }
}
