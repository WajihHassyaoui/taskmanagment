import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type { Task } from '@/store/taskStore';
import { groupTasksByDueDate, priorityDotClass } from '@/lib/calendarEvents';
import { cn } from '@/lib/utils';

interface MiniMonthProps {
  monthDate: Date;
  tasks: Task[];
  onDayClick: (date: string) => void;
  onTaskClick: (task: Task) => void;
}

export function MiniMonth({ monthDate, tasks, onDayClick, onTaskClick }: MiniMonthProps) {
  const tasksByDate = groupTasksByDueDate(tasks);
  const monthStart = startOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });

  const days: Date[] = [];
  let day = gridStart;
  while (day <= gridEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="rounded-lg border bg-card/50 p-3 flex flex-col min-h-[220px]">
      <h3 className="text-sm font-semibold text-center mb-2">
        {format(monthDate, 'MMMM')}
      </h3>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {weekDays.map((wd, i) => (
          <div
            key={`${wd}-${i}`}
            className="text-[10px] font-medium text-muted-foreground text-center"
          >
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 flex-1">
        {days.map((d) => {
          const dateKey = format(d, 'yyyy-MM-dd');
          const dayTasks = tasksByDate.get(dateKey) ?? [];
          const inMonth = isSameMonth(d, monthDate);
          const isToday = isSameDay(d, new Date());

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => {
                if (dayTasks.length === 1) {
                  onTaskClick(dayTasks[0]);
                } else {
                  onDayClick(dateKey);
                }
              }}
              className={cn(
                'relative flex flex-col items-center justify-start rounded p-0.5 min-h-[28px] text-[10px] transition-colors hover:bg-accent/60',
                !inMonth && 'opacity-30',
                isToday && 'ring-1 ring-primary font-bold'
              )}
              title={
                dayTasks.length
                  ? dayTasks.map((t) => t.title).join(', ')
                  : `Add task on ${format(d, 'MMM d')}`
              }
            >
              <span className={cn('leading-none', isToday && 'text-primary')}>
                {format(d, 'd')}
              </span>
              {dayTasks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-0.5 mt-0.5 max-w-full">
                  {dayTasks.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className={cn(
                        'h-1 w-1 rounded-full shrink-0',
                        priorityDotClass[t.priority],
                        t.status === 'done' && 'opacity-40'
                      )}
                    />
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[8px] text-muted-foreground leading-none">
                      +{dayTasks.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
