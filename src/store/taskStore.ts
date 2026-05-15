import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  status: 'todo' | 'in_progress' | 'done';
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly';
  parent_id?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (date?: string) => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  fetchTasks: async (date) => {
    set({ loading: true });
    try {
      const tasks = await invoke<Task[]>('get_tasks', { date });
      set({ tasks, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  addTask: async (task) => {
    try {
      const newTask = await invoke<Task>('create_task', { task });
      set((state) => ({ tasks: [newTask, ...state.tasks] }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  updateTask: async (id, task) => {
    try {
      const updatedTask = await invoke<Task>('update_task', { id, task });
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  deleteTask: async (id) => {
    try {
      await invoke('delete_task', { id });
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
  toggleTaskStatus: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await get().updateTask(id, { status: newStatus });
    
    // Check for achievements after status change
    if (newStatus === 'done') {
      await invoke('unlock_achievement', { key: 'first_task' });
      // More achievement checks can be added here
    }
  },
}));
