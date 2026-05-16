import React from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, type SlotInfo } from 'react-big-calendar';
import withDragAndDrop, { type EventInteractionArgs } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Plus } from 'lucide-react';
import { useTaskStore, type Task } from '@/store/taskStore';
import { CalendarTaskDialog } from '@/components/calendar/CalendarTaskDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YearPlanner } from '@/components/calendar/YearPlanner';
import {
  type CalendarEvent,
  slotTimeToDueTime,
  taskToEvent,
} from '@/lib/calendarEvents';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop<CalendarEvent>(BigCalendar);

type CalendarView = 'year' | 'month' | 'week' | 'day';

export default function CalendarPage() {
  const { tasks, fetchTasks, updateTask } = useTaskStore();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [defaultDate, setDefaultDate] = React.useState<string>();
  const [defaultTime, setDefaultTime] = React.useState<string>();
  const [dialogKey, setDialogKey] = React.useState('new');
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [calendarView, setCalendarView] = React.useState<CalendarView>('year');

  React.useEffect(() => {
    fetchTasks();
  }, []);

  const events = React.useMemo(
    () =>
      tasks
        .map(taskToEvent)
        .filter((e): e is CalendarEvent => e !== null),
    [tasks]
  );

  const openCreate = (date: string, time?: string) => {
    setEditingTask(null);
    setDefaultDate(date);
    setDefaultTime(time);
    setDialogKey(`new-${date}-${time ?? ''}-${Date.now()}`);
    setActionError(null);
    setDialogOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setDefaultDate(undefined);
    setDefaultTime(undefined);
    setDialogKey(`edit-${task.id}`);
    setActionError(null);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingTask(null);
      setDefaultDate(undefined);
      setDefaultTime(undefined);
    }
  };

  const handleSelectSlot = (slot: SlotInfo) => {
    openCreate(
      format(slot.start, 'yyyy-MM-dd'),
      slotTimeToDueTime(slot.start)
    );
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    openEdit(event.resource);
  };

  const handleEventDrop = async ({ event, start }: EventInteractionArgs<CalendarEvent>) => {
    setActionError(null);
    try {
      const startDate = start instanceof Date ? start : new Date(start);
      await updateTask(event.id, {
        due_date: format(startDate, 'yyyy-MM-dd'),
        due_time: slotTimeToDueTime(startDate),
      });
      await fetchTasks();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to move task');
    }
  };

  const handleEventResize = async ({ event, start }: EventInteractionArgs<CalendarEvent>) => {
    setActionError(null);
    try {
      const startDate = start instanceof Date ? start : new Date(start);
      await updateTask(event.id, {
        due_date: format(startDate, 'yyyy-MM-dd'),
        due_time: slotTimeToDueTime(startDate),
      });
      await fetchTasks();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to resize task');
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#6366f1';
    if (event.priority === 'urgent') backgroundColor = '#ef4444';
    if (event.priority === 'high') backgroundColor = '#f59e0b';
    if (event.priority === 'low') backgroundColor = '#10b981';
    if (event.resource.status === 'done') backgroundColor = '#6b7280';

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: event.resource.status === 'done' ? 0.6 : 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        cursor: 'pointer',
      },
    };
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {calendarView === 'year'
              ? 'Year plan — all 12 months · Click any day to add or edit tasks'
              : 'Click a slot to create · Click an event to edit · Drag to reschedule'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs
            value={calendarView}
            onValueChange={(v) => setCalendarView(v as CalendarView)}
          >
            <TabsList>
              <TabsTrigger value="year">Year</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => openCreate(format(new Date(), 'yyyy-MM-dd'))}>
          <Plus size={18} className="mr-2" />
          Add task
          </Button>
        </div>
      </div>

      {actionError && (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
          {actionError}
        </p>
      )}

      <Card className="flex-1 p-4 bg-card overflow-hidden calendar-crud min-h-[500px] flex flex-col">
        {calendarView === 'year' ? (
          <YearPlanner
            tasks={tasks}
            onDayClick={(date) => openCreate(date)}
            onTaskClick={openEdit}
          />
        ) : (
          <DnDCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', minHeight: 420 }}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            view={calendarView}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            draggableAccessor={() => true}
            resizable
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            popup
            longPressThreshold={1}
          />
        )}
      </Card>

      <CalendarTaskDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        task={editingTask}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
        dialogKey={dialogKey}
      />
    </div>
  );
}
