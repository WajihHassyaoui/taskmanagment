import React from 'react';
import { useTaskStore } from '@/store/taskStore';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/button';
import { Plus, Filter, SortAsc } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function TasksPage() {
  const { tasks, fetchTasks } = useTaskStore();
  const [showForm, setShowForm] = React.useState(false);

  React.useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Daily Tasks</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={20} className="mr-2" />
          {showForm ? 'Cancel' : 'Add Task'}
        </Button>
      </div>

      {showForm && <TaskForm onComplete={() => setShowForm(false)} />}

      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="todo">To Do</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="done">Completed</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <SortAsc size={16} className="mr-2" />
              Sort
            </Button>
          </div>
        </div>

        <TabsContent value="all">
          <TaskList tasks={tasks} />
        </TabsContent>
        <TabsContent value="todo">
          <TaskList tasks={tasks.filter(t => t.status === 'todo')} />
        </TabsContent>
        <TabsContent value="in_progress">
          <TaskList tasks={tasks.filter(t => t.status === 'in_progress')} />
        </TabsContent>
        <TabsContent value="done">
          <TaskList tasks={tasks.filter(t => t.status === 'done')} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
