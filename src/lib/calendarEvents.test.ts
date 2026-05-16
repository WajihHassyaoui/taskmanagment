import { describe, expect, it } from 'vitest';
import { slotTimeToDueTime, taskToEvent } from './calendarEvents';
import type { Task } from '@/store/taskStore';

const baseTask: Task = {
  id: 'test-id',
  title: 'Calendar test task',
  due_date: '2026-05-16',
  due_time: '14:30:00',
  priority: 'high',
  category: 'Work',
  status: 'todo',
  recurrence: 'none',
  position: 0,
  created_at: '2026-05-16 10:00:00',
  updated_at: '2026-05-16 10:00:00',
};

describe('taskToEvent', () => {
  it('maps a task with date and time to a calendar event', () => {
    const event = taskToEvent(baseTask);
    expect(event).not.toBeNull();
    expect(event!.title).toBe('Calendar test task');
    expect(event!.start.getHours()).toBe(14);
    expect(event!.start.getMinutes()).toBe(30);
  });

  it('maps all-day tasks without due_time', () => {
    const event = taskToEvent({ ...baseTask, due_time: undefined });
    expect(event).not.toBeNull();
    expect(event!.end.getHours()).toBe(23);
  });

  it('returns null when due_date is missing', () => {
    expect(taskToEvent({ ...baseTask, due_date: undefined })).toBeNull();
  });
});

describe('slotTimeToDueTime', () => {
  it('returns undefined for midnight (all-day)', () => {
    expect(slotTimeToDueTime(new Date(2026, 4, 16, 0, 0, 0))).toBeUndefined();
  });

  it('returns HH:mm for timed slots', () => {
    expect(slotTimeToDueTime(new Date(2026, 4, 16, 9, 30, 0))).toBe('09:30');
  });
});
