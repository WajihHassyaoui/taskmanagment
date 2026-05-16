import type { Task } from '@/store/taskStore';

const STORAGE_KEY = 'yalla-task-go-tasks';

function readAll(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function nowString(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

export function localGetTasks(date?: string): Task[] {
  const tasks = readAll().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  if (!date) return tasks;
  return tasks.filter((t) => t.due_date === date || t.recurrence !== 'none');
}

export function localCreateTask(input: {
  title: string;
  description?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  priority?: string;
  category?: string;
  status?: string;
  recurrence?: string;
  parent_id?: string | null;
}): Task {
  const tasks = readAll();
  const now = nowString();
  const task: Task = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description ?? undefined,
    due_date: input.due_date ?? undefined,
    due_time: input.due_time ?? undefined,
    priority: (input.priority as Task['priority']) ?? 'medium',
    category: input.category ?? 'Personal',
    status: (input.status as Task['status']) ?? 'todo',
    recurrence: (input.recurrence as Task['recurrence']) ?? 'none',
    parent_id: input.parent_id ?? undefined,
    position: 0,
    created_at: now,
    updated_at: now,
  };
  writeAll([task, ...tasks]);
  return task;
}

export function localUpdateTask(
  id: string,
  patch: Record<string, string | null | number | undefined>
): Task {
  const tasks = readAll();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) throw new Error('Task not found');

  const current = tasks[index];
  const updated: Task = {
    ...current,
    title: (patch.title as string) ?? current.title,
    description:
      patch.description !== undefined
        ? (patch.description as string | null) ?? undefined
        : current.description,
    due_date:
      patch.due_date !== undefined
        ? (patch.due_date as string | null) ?? undefined
        : current.due_date,
    due_time:
      patch.due_time !== undefined
        ? (patch.due_time as string | null) ?? undefined
        : current.due_time,
    priority: (patch.priority as Task['priority']) ?? current.priority,
    category: (patch.category as string) ?? current.category,
    status: (patch.status as Task['status']) ?? current.status,
    recurrence: (patch.recurrence as Task['recurrence']) ?? current.recurrence,
    position: (patch.position as number) ?? current.position,
    updated_at: nowString(),
  };

  tasks[index] = updated;
  writeAll(tasks);
  return updated;
}

export function localDeleteTask(id: string): void {
  writeAll(readAll().filter((t) => t.id !== id));
}
