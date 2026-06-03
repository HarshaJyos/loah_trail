'use client';

import * as React from 'react';
import { BarChart3 } from 'lucide-react';
import { Task, FocusSession } from '../../types';

interface ActivityChartProps {
  tasks: Task[];
  focusSessions: FocusSession[];
  range: 'Day' | 'Week' | 'Month' | 'Year';
  rangeStart: number;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({
  tasks,
  focusSessions,
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
      const total = completedTasks + sessions;

      buckets.push({ label, value: total });
    }
    return buckets;
  }, [range, tasks, focusSessions, rangeStart, now]);

  const totalActions = React.useMemo(() => {
    return chartData.reduce((a, b) => a + b.value, 0);
  }, [chartData]);

  const maxVal = React.useMemo(() => {
    return Math.max(...chartData.map((d) => d.value), 1);
  }, [chartData]);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[2rem] p-6 md:p-8 hover:border-[var(--border-active)] hover:shadow-[var(--glow-purple)] transition-all duration-300 flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
            <BarChart3 size={20} />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Activity Level
          </h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-[var(--text-primary)] leading-none font-mono">
            {totalActions}
          </div>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Total Actions
          </span>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[160px]">
        {/* Horizontal scale line segments */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-6">
          <div className="w-full h-px border-t border-dashed border-slate-200/60" />
          <div className="w-full h-px border-t border-dashed border-slate-200/60" />
          <div className="w-full h-px border-t border-dashed border-slate-200/60" />
        </div>

        {/* Bars Container */}
        <div className="w-full h-full flex items-end justify-between gap-1 pt-6 pb-2">
          {chartData.map((d, i) => {
            const ratio = d.value / maxVal;
            return (
              <div
                key={i}
                className="flex-1 flex flex-col justify-end h-full group relative min-w-[4px]"
              >
                <div
                  className="w-full rounded-md transition-all duration-500 hover:opacity-100 relative bg-gradient-to-t from-violet-600 to-violet-400"
                  style={{
                    height: `${Math.max(4, ratio * 100)}%`,
                    opacity: d.value === 0 ? 0.05 : Math.max(0.3, ratio),
                  }}
                >
                  {d.value > 0 && (
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none transition-opacity shadow-lg">
                      {d.value} Activities
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X Axis Labels */}
      <div className="flex justify-between mt-2 pt-2 border-t border-slate-200/60 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
        {chartData
          .filter((_, i) => i % Math.ceil(chartData.length / 6) === 0)
          .map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
      </div>
    </div>
  );
};
export default ActivityChart;
