import { Task, useTaskStore } from '@/store/taskStore';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, Tag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { toggleTaskStatus, deleteTask } = useTaskStore();

  const priorityColors = {
    urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    medium: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };

  return (
    <Card className={cn(
      "group hover:shadow-md transition-shadow",
      task.status === 'done' && "opacity-60"
    )}>
      <CardContent className="p-4 flex items-center space-x-4">
        <Checkbox 
          checked={task.status === 'done'} 
          onCheckedChange={() => toggleTaskStatus(task.id)}
          className="w-5 h-5"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-medium truncate",
            task.status === 'done' && "line-through"
          )}>
            {task.title}
          </h3>
          <div className="flex items-center space-x-3 mt-1">
            {task.due_time && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock size={12} className="mr-1" />
                {task.due_time}
              </div>
            )}
            <div className="flex items-center text-xs text-muted-foreground">
              <Tag size={12} className="mr-1" />
              {task.category}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={cn("capitalize", priorityColors[task.priority])}>
            {task.priority}
          </Badge>
          <Button 
            variant="ghost" 
            size="icon" 
            className="opacity-0 group-hover:opacity-100 text-destructive"
            onClick={() => deleteTask(task.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
