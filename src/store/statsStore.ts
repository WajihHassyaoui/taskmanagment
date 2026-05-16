import { create } from 'zustand';
import { invoke } from '@/lib/tauri';

export interface DayStat {
  date: string;
  tasks_completed: number;
  tasks_total: number;
  streak: number;
}

export interface DashboardStats {
  tasks_today: number;
  completed_today: number;
  pending_today: number;
  weekly_completion_rate: number;
  current_streak: number;
  total_notes: number;
}

export interface Achievement {
  id: string;
  key: string;
  unlocked_at: string | null;
}

interface StatsState {
  dashboardStats: DashboardStats | null;
  weeklyStats: DayStat[];
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  fetchDashboardStats: () => Promise<void>;
  fetchWeeklyStats: () => Promise<void>;
  fetchAchievements: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  dashboardStats: null,
  weeklyStats: [],
  achievements: [],
  loading: false,
  error: null,
  fetchDashboardStats: async () => {
    try {
      const stats = await invoke<DashboardStats>('get_dashboard_stats');
      set({ dashboardStats: stats });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  fetchWeeklyStats: async () => {
    try {
      const stats = await invoke<DayStat[]>('get_weekly_stats');
      set({ weeklyStats: stats });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  fetchAchievements: async () => {
    try {
      const achievements = await invoke<Achievement[]>('get_achievements');
      set({ achievements });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
