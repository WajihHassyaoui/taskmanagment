import { create } from 'zustand';
import { isTauriApp, invoke } from '@/lib/tauri';
import {
  localCreateTask,
  localDeleteTask,
  localGetTasks,
  localUpdateTask,
} from '@/lib/localTasks';

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
  addTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, task: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskStatus: (id: string) => Promise<void>;
}

function toCreatePayload(task: Partial<Task>) {
  return {
    title: task.title ?? '',
    description: task.description ?? null,
    due_date: task.due_date ?? null,
    due_time: task.due_time ?? null,
    priority: task.priority ?? 'medium',
    category: task.category ?? 'Personal',
    status: task.status ?? 'todo',
    recurrence: task.recurrence ?? 'none',
    parent_id: task.parent_id ?? null,
  };
}

function toUpdatePayload(task: Partial<Task>) {
  const payload: Record<string, string | null | number> = {};
  if (task.title !== undefined) payload.title = task.title;
  if (task.description !== undefined) payload.description = task.description ?? null;
  if (task.due_date !== undefined) payload.due_date = task.due_date ?? null;
  if (task.due_time !== undefined) payload.due_time = task.due_time ?? null;
  if (task.priority !== undefined) payload.priority = task.priority;
  if (task.category !== undefined) payload.category = task.category;
  if (task.status !== undefined) payload.status = task.status;
  if (task.recurrence !== undefined) payload.recurrence = task.recurrence;
  if (task.position !== undefined) payload.position = task.position;
  return payload;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  fetchTasks: async (date) => {
    set({ loading: true });
    try {
      const tasks = isTauriApp()
        ? await invoke<Task[]>('get_tasks', { date })
        : localGetTasks(date);
      set({ tasks, loading: false, error: null });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  addTask: async (task) => {
    if (!task.title?.trim()) {
      throw new Error('Task title is required');
    }
    try {
      const payload = toCreatePayload(task);
      const newTask = isTauriApp()
        ? await invoke<Task>('create_task', { task: payload })
        : localCreateTask(payload);
      set((state) => ({
        tasks: [newTask, ...state.tasks.filter((t) => t.id !== newTask.id)],
        error: null,
      }));
      return newTask;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      throw new Error(message);
    }
  },
  updateTask: async (id, task) => {
    try {
      const payload = toUpdatePayload(task);
      const updatedTask = isTauriApp()
        ? await invoke<Task>('update_task', { id, task: payload })
        : localUpdateTask(id, payload);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        error: null,
      }));
      return updatedTask;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      throw new Error(message);
    }
  },
  deleteTask: async (id) => {
    try {
      if (isTauriApp()) {
        await invoke('delete_task', { id });
      } else {
        localDeleteTask(id);
      }
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        error: null,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message });
      throw new Error(message);
    }
  },
  toggleTaskStatus: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await get().updateTask(id, { status: newStatus });

    if (newStatus === 'done' && isTauriApp()) {
      await invoke('unlock_achievement', { key: 'first_task' });
    }
  },
}));
