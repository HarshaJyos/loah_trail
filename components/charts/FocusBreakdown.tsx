'use client';

import * as React from 'react';
import { PieChart } from 'lucide-react';
import { FocusSession } from '../../types';

interface FocusBreakdownProps {
  focusSessions: FocusSession[];
  rangeStart: number;
}

export const FocusBreakdown: React.FC<FocusBreakdownProps> = ({
  focusSessions,
  rangeStart,
}) => {
  const filteredSessions = React.useMemo(() => {
    return focusSessions.filter((s) => s.startTime >= rangeStart);
  }, [focusSessions, rangeStart]);

  const breakdownData = React.useMemo(() => {
    const counts: Record<string, number> = {
      Habits: 0,
      Tasks: 0,
      Routines: 0,
    };
    let total = 0;

    filteredSessions.forEach((s) => {
      if (s.routineId.startsWith('habit-focus-')) {
        counts['Habits'] += s.durationSeconds;
      } else if (s.routineId.startsWith('task-')) {
        counts['Tasks'] += s.durationSeconds;
      } else {
        counts['Routines'] += s.durationSeconds;
      }
      total += s.durationSeconds;
    });

    return Object.entries(counts)
      .filter(([_, val]) => val > 0)
      .map(([label, value]) => ({
        label,
        value,
        percent: total > 0 ? (value / total) * 100 : 0,
        color:
          label === 'Habits'
            ? '#10b981'
            : label === 'Tasks'
            ? '#3b82f6'
            : '#a78bfa',
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredSessions]);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[2rem] p-6 md:p-8 hover:border-[var(--border-active)] hover:shadow-[var(--glow-purple)] transition-all duration-300 flex flex-col min-h-[300px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400">
          <PieChart size={20} />
        </div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          Focus Breakdown
        </h3>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center relative gap-6">
        {breakdownData.length === 0 ? (
          <div className="text-[var(--text-secondary)] text-sm font-medium italic">
            No focus data yet.
          </div>
        ) : (
          <>
            {/* Donut Circle SVG or Gradient */}
            <div className="w-32 h-32 rounded-full border-[12px] border-slate-100 relative">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${breakdownData
                    .map((d, i, arr) => {
                      const prev = arr
                        .slice(0, i)
                        .reduce((a, c) => a + c.percent, 0);
                      return `${d.color} ${prev}% ${prev + d.percent}%`;
                    })
                    .join(', ')})`,
                }}
              />
              <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center border border-slate-200/60">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] tracking-wider">
                  DIST
                </span>
              </div>
            </div>

            {/* List with Progress Bars */}
            <div className="w-full space-y-3">
              {breakdownData.map((d, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between text-xs font-bold text-[var(--text-secondary)] mb-1">
                    <span className="truncate max-w-[120px]">{d.label}</span>
                    <span className="font-mono">{Math.round(d.percent)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${d.percent}%`,
                        backgroundColor: d.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default FocusBreakdown;
