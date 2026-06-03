'use client';

import * as React from 'react';
import { BarChart3 } from 'lucide-react';
import { Task, FocusSession, Habit } from '../../types';

interface ActivityChartProps {
  tasks: Task[];
  focusSessions: FocusSession[];
  habits?: Habit[];
  range: 'Day' | 'Week' | 'Month' | 'Year';
  rangeStart: number;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({
  tasks,
  focusSessions,
  habits = [],
  range,
  rangeStart,
}) => {
  const now = React.useMemo(() => new Date(), []);

  const chartData = React.useMemo(() => {
    const buckets: { label: string; value: number }[] = [];
    const steps =
      range === 'Day'
        ? 24
        : range === 'Week'
        ? 7
        : range === 'Month'
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        : 12;

    for (let i = 0; i < steps; i++) {
      let date = new Date(rangeStart);
      let label = '';

      if (range === 'Day') {
        date.setHours(i);
        label =
          i % 6 === 0
            ? i === 0
              ? '12am'
              : i === 12
              ? '12pm'
              : i > 12
              ? `${i - 12}pm`
              : `${i}am`
            : '';
      } else if (range === 'Week') {
        date.setDate(date.getDate() + i);
        label = date.toLocaleDateString('en-US', { weekday: 'narrow' });
      } else if (range === 'Month') {
        date.setDate(i + 1);
        label = (i + 1) % 5 === 0 || i === 0 ? (i + 1).toString() : '';
      } else if (range === 'Year') {
        date.setMonth(i);
        label = date.toLocaleDateString('en-US', { month: 'narrow' });
      }

      const periodStart = date.getTime();
      let periodEnd = 0;

      if (range === 'Day') {
        periodEnd = periodStart + 3600000;
      } else if (range === 'Week' || range === 'Month') {
        periodEnd = periodStart + 86400000;
      } else {
        periodEnd = new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          1
        ).getTime();
      }

      const completedTasks = tasks.filter(
        (t) =>
          t.completedAt &&
          t.completedAt >= periodStart &&
          t.completedAt < periodEnd
      ).length;
      
      const sessions = focusSessions.filter(
        (s) => s.startTime >= periodStart && s.startTime < periodEnd
      ).length;

      // Count habit check-ins for the day if within period
      let habitCompletions = 0;
      if (range === 'Week' || range === 'Month' || range === 'Year' || range === 'Day') {
        const d = new Date(periodStart);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        // For 'Day' range, history only tracks by day, so we might double count if we just check the date string across 24 hours.
        // Instead, for 'Day', we only add habit completions to the 12pm (noon) slot as an approximation, or distribute them.
        // To be accurate, if range is Day, we just assign the day's habit count to 12pm.
        if (range !== 'Day' || d.getHours() === 12) {
          habitCompletions = habits.reduce((acc, h) => {
            const val = h.history[dateStr] || 0;
            return acc + (val > 0 ? 1 : 0);
          }, 0);
        }
      }

      const total = completedTasks + sessions + habitCompletions;

      buckets.push({ label, value: total });
    }
    return buckets;
  }, [range, tasks, focusSessions, habits, rangeStart, now]);

  const totalActions = React.useMemo(() => {
    return chartData.reduce((a, b) => a + b.value, 0);
  }, [chartData]);

  const maxVal = React.useMemo(() => {
    return Math.max(...chartData.map((d) => d.value), 1);
  }, [chartData]);

  return (
    <div className="loah-card p-6 md:p-8 flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: 'var(--brand-primary-muted)', color: 'var(--brand-primary)' }}>
            <BarChart3 size={20} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Activity Level
          </h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black leading-none font-mono" style={{ color: 'var(--text-primary)' }}>
            {totalActions}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            Total Actions
          </span>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[160px]">
        {/* Horizontal scale line segments */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-6">
          <div className="w-full h-px border-t border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
          <div className="w-full h-px border-t border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
          <div className="w-full h-px border-t border-dashed" style={{ borderColor: 'var(--border-subtle)' }} />
        </div>

        {/* Bars Container */}
        <div className="absolute inset-0 flex items-end justify-between gap-1 pt-6 pb-2">
          {chartData.map((d, i) => {
            const ratio = d.value / maxVal;
            const barHeight = d.value === 0 ? 4 : Math.max(8, ratio * 100);
            return (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end h-full group relative min-w-[4px]"
              >
                <div
                  className="w-full rounded-md transition-all duration-500 relative gradient-primary"
                  style={{
                    height: d.value === 0 ? '4px' : `${barHeight}%`,
                    opacity: d.value === 0 ? 0.1 : Math.max(0.4, ratio),
                  }}
                >
                  {d.value > 0 && (
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none transition-opacity shadow-lg"
                         style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                      {d.value} Activities
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between items-center w-full mt-2" style={{ color: 'var(--text-secondary)' }}>
        {chartData.map((d, i) => (
          <div
            key={i}
            className="flex-1 text-center text-[9px] font-bold uppercase tracking-wider"
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
};
export default ActivityChart;
