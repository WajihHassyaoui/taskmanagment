import { Task } from '@/store/taskStore';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 bg-accent/10 rounded-xl border-2 border-dashed">
        <p className="text-muted-foreground">No tasks found. Time to relax or add a new one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
