import React from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useTaskStore } from '@/store/taskStore';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card } from '@/components/ui/card';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarPage() {
  const { tasks, fetchTasks } = useTaskStore();

  React.useEffect(() => {
    fetchTasks();
  }, []);

  const events = tasks.filter(t => t.due_date).map(task => ({
    id: task.id,
    title: task.title,
    start: new Date(task.due_date + (task.due_time ? `T${task.due_time}` : 'T00:00:00')),
    end: new Date(task.due_date + (task.due_time ? `T${task.due_time}` : 'T23:59:59')),
    priority: task.priority,
  }));

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#6366f1'; // medium
    if (event.priority === 'urgent') backgroundColor = '#ef4444';
    if (event.priority === 'high') backgroundColor = '#f59e0b';
    if (event.priority === 'low') backgroundColor = '#10b981';

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
      
      <Card className="flex-1 p-4 bg-card overflow-hidden">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
        />
      </Card>
    </div>
  );
}
