import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  StickyNote, 
  Plus,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useTaskStore } from '@/store/taskStore';
import { useStatsStore } from '@/store/statsStore';
import { getDailyQuote } from '@/lib/quotes';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';

export default function Dashboard() {
  const { tasks, fetchTasks, addTask } = useTaskStore();
  const { dashboardStats, weeklyStats, fetchDashboardStats, fetchWeeklyStats } = useStatsStore();
  const [newTaskTitle, setNewTaskTitle] = React.useState('');

  React.useEffect(() => {
    fetchTasks(format(new Date(), 'yyyy-MM-dd'));
    fetchDashboardStats();
    fetchWeeklyStats();
  }, []);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask({
      title: newTaskTitle,
      due_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'todo',
      priority: 'medium'
    });
    setNewTaskTitle('');
    fetchDashboardStats();
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const pieData = [
    { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, John!</h1>
        <p className="text-muted-foreground italic">"{getDailyQuote()}"</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Today's Tasks" 
          value={dashboardStats?.tasks_today || 0} 
          icon={CheckCircle2} 
          description="Total tasks for today"
        />
        <StatsCard 
          title="Pending" 
          value={dashboardStats?.pending_today || 0} 
          icon={Clock} 
          description="Awaiting completion"
        />
        <StatsCard 
          title="Weekly Rate" 
          value={`${Math.round(dashboardStats?.weekly_completion_rate || 0)}%`} 
          icon={TrendingUp} 
          description="Tasks completed this week"
        />
        <StatsCard 
          title="Notes" 
          value={dashboardStats?.total_notes || 0} 
          icon={StickyNote} 
          description="Saved thoughts"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Progress</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => format(new Date(val), 'EEE')} 
                />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="tasks_completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">No tasks today</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.filter(t => t.status !== 'done').slice(0, 3).map(task => (
              <div key={task.id} className="flex items-center p-3 rounded-lg border bg-accent/20">
                <div className={cn(
                  "w-2 h-10 rounded-full mr-4",
                  task.priority === 'urgent' ? 'bg-red-500' :
                  task.priority === 'high' ? 'bg-orange-500' :
                  task.priority === 'medium' ? 'bg-indigo-500' : 'bg-emerald-500'
                )} />
                <div className="flex-1">
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-xs text-muted-foreground">{task.due_time || 'No time set'}</p>
                </div>
                <Badge variant="outline" className="capitalize">{task.priority}</Badge>
              </div>
            ))}
            {tasks.filter(t => t.status !== 'done').length === 0 && (
              <p className="text-center text-muted-foreground py-8">All caught up! 🎉</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Add</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuickAdd} className="flex space-x-2">
              <Input 
                placeholder="What needs to be done?" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <Button type="submit" size="icon">
                <Plus size={20} />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, description }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
