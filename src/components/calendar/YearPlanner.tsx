import React from 'react';
import { addMonths, format, setYear as setYearOnDate, startOfYear } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Task } from '@/store/taskStore';
import { MiniMonth } from './MiniMonth';
import { Button } from '@/components/ui/button';

interface YearPlannerProps {
  tasks: Task[];
  onDayClick: (date: string) => void;
  onTaskClick: (task: Task) => void;
}

export function YearPlanner({ tasks, onDayClick, onTaskClick }: YearPlannerProps) {
  const [year, setYear] = React.useState(() => new Date().getFullYear());

  const yearStart = startOfYear(setYearOnDate(new Date(), year));
  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));

  const tasksInYear = React.useMemo(
    () =>
      tasks.filter((t) => {
        if (!t.due_date) return false;
        return t.due_date.startsWith(String(year));
      }),
    [tasks, year]
  );

  const taskCount = tasksInYear.length;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setYear((y) => y - 1)}
          aria-label="Previous year"
        >
          <ChevronLeft size={18} />
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{year}</h2>
          <p className="text-xs text-muted-foreground">
            {taskCount} task{taskCount !== 1 ? 's' : ''} scheduled this year
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setYear((y) => y + 1)}
          aria-label="Next year"
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 shrink-0 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Urgent
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-500" /> High
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-indigo-500" /> Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Low
        </span>
        <span className="ml-auto hidden sm:inline">
          Click a day to add · One task = edit · Multiple = new task
        </span>
      </div>

      <div className="overflow-y-auto flex-1 pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map((monthDate) => (
            <MiniMonth
              key={format(monthDate, 'yyyy-MM')}
              monthDate={monthDate}
              tasks={tasksInYear}
              onDayClick={onDayClick}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-4 shrink-0">
        {[year - 1, year, year + 1].map((y) => (
          <Button
            key={y}
            variant={y === year ? 'default' : 'outline'}
            size="sm"
            onClick={() => setYear(y)}
          >
            {y}
          </Button>
        ))}
      </div>
    </div>
  );
}
