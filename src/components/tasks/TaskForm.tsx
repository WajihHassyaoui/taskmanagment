import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { format } from 'date-fns';

export function TaskForm({ onComplete }: { onComplete?: () => void }) {
  const { addTask } = useTaskStore();
  const [title, setTitle] = React.useState('');
  const [priority, setPriority] = React.useState('medium');
  const [category, setCategory] = React.useState('Personal');
  const [dueTime, setDueTime] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addTask({
      title,
      priority: priority as any,
      category,
      due_date: format(new Date(), 'yyyy-MM-dd'),
      due_time: dueTime || undefined,
      status: 'todo'
    });

    setTitle('');
    onComplete?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input 
            placeholder="Task title..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium"
          />
        </div>
        
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
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
          <SelectContent>
            <SelectItem value="Work">Work</SelectItem>
            <SelectItem value="Personal">Personal</SelectItem>
            <SelectItem value="Health">Health</SelectItem>
            <SelectItem value="Learning">Learning</SelectItem>
          </SelectContent>
        </Select>

        <Input 
          type="time" 
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
        />

        <Button type="submit" className="w-full md:col-span-2">Add Task</Button>
      </div>
    </form>
  );
}
