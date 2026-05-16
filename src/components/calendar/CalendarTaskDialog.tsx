import React from 'react';
import { format } from 'date-fns';
import { formatTimeForInput } from '@/lib/calendarEvents';
import { Task, useTaskStore } from '@/store/taskStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function buildFormState(
  task: Task | null | undefined,
  defaultDate?: string,
  defaultTime?: string
) {
  if (task) {
    return {
      title: task.title,
      description: task.description ?? '',
      dueDate: task.due_date ?? format(new Date(), 'yyyy-MM-dd'),
      dueTime: formatTimeForInput(task.due_time),
      priority: task.priority,
      category: task.category,
      status: task.status,
    };
  }
  return {
    title: '',
    description: '',
    dueDate: defaultDate ?? format(new Date(), 'yyyy-MM-dd'),
    dueTime: defaultTime ?? '',
    priority: 'medium' as Task['priority'],
    category: 'Personal',
    status: 'todo' as Task['status'],
  };
}

export interface CalendarTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultDate?: string;
  defaultTime?: string;
  dialogKey?: string;
}

export function CalendarTaskDialog({
  open,
  onOpenChange,
  task,
  defaultDate,
  defaultTime,
  dialogKey,
}: CalendarTaskDialogProps) {
  const { addTask, updateTask, deleteTask, fetchTasks } = useTaskStore();
  const isEdit = Boolean(task);

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [dueTime, setDueTime] = React.useState('');
  const [priority, setPriority] = React.useState<Task['priority']>('medium');
  const [category, setCategory] = React.useState('Personal');
  const [status, setStatus] = React.useState<Task['status']>('todo');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const next = buildFormState(task, defaultDate, defaultTime);
    setTitle(next.title);
    setDescription(next.description);
    setDueDate(next.dueDate);
    setDueTime(next.dueTime);
    setPriority(next.priority);
    setCategory(next.category);
    setStatus(next.status);
    setError(null);
  }, [open, task, defaultDate, defaultTime, dialogKey]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }
    if (!dueDate) {
      setError('Please select a due date.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDate,
        due_time: dueTime.trim() || undefined,
        priority,
        category,
        status,
      };

      if (isEdit && task) {
        await updateTask(task.id, payload);
      } else {
        await addTask(payload);
      }
      await fetchTasks();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setSaving(true);
    setError(null);
    try {
      await deleteTask(task.id);
      await fetchTasks();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setSaving(false);
    }
  };

  const preventDialogDismiss = (e: Event) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-radix-select-content]') ||
      target.closest('[role="listbox"]')
    ) {
      e.preventDefault();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px]"
        onInteractOutside={preventDialogDismiss}
        onPointerDownOutside={preventDialogDismiss}
      >
        <form onSubmit={handleSave}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit task' : 'New task'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update task details or delete it from your calendar.'
                : 'Add a task scheduled for the selected date.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                {error}
              </p>
            )}
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Date</label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Time</label>
                <Input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={priority} onValueChange={(v) => setPriority(v as Task['priority'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Learning">Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isEdit && (
              <Select value={status} onValueChange={(v) => setStatus(v as Task['status'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="todo">To do</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={saving}
                className="mr-auto"
              >
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

