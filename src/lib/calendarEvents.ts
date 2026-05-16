import { isValid, parseISO } from 'date-fns';
import type { Task } from '@/store/taskStore';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  priority: Task['priority'];
  resource: Task;
}

export function formatTimeForInput(time?: string) {
  if (!time) return '';
  return time.length >= 5 ? time.slice(0, 5) : time;
}

/** Map slot start time to optional due_time (skip midnight = all-day). */
export function slotTimeToDueTime(date: Date | string): string | undefined {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return undefined;
  const hours = d.getHours();
  const minutes = d.getMinutes();
  if (hours === 0 && minutes === 0) return undefined;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function groupTasksByDueDate(tasks: Task[]): Map<string, Task[]> {
  const map = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.due_date) continue;
    const list = map.get(task.due_date) ?? [];
    list.push(task);
    map.set(task.due_date, list);
  }
  return map;
}

export const priorityDotClass: Record<Task['priority'], string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-indigo-500',
  low: 'bg-emerald-500',
};

export function taskToEvent(task: Task): CalendarEvent | null {
  if (!task.due_date) return null;

  const timePart = formatTimeForInput(task.due_time) || '00:00';
  const start = parseISO(`${task.due_date}T${timePart}:00`);
  if (!isValid(start)) return null;

  const end = new Date(start);
  if (task.due_time) {
    end.setHours(end.getHours() + 1);
  } else {
    end.setHours(23, 59, 59, 999);
  }

  return {
    id: task.id,
    title: task.title,
    start,
    end,
    priority: task.priority,
    resource: task,
  };
}
