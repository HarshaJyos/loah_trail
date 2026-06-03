'use client';

import * as React from 'react';
import { PieChart } from 'lucide-react';
import { FocusSession, Task, JournalEntry, Habit } from '../../types';

interface FocusBreakdownProps {
  focusSessions: FocusSession[];
  tasks?: Task[];
  journalEntries?: JournalEntry[];
  habits?: Habit[];
  rangeStart: number;
}

export const FocusBreakdown: React.FC<FocusBreakdownProps> = ({
  focusSessions,
  tasks = [],
  journalEntries = [],
  habits = [],
  rangeStart,
}) => {
  const breakdownData = React.useMemo(() => {
    const counts: Record<string, { val: number; color: string }> = {
      'Deep Work': { val: 0, color: 'var(--cat-deepwork)' },
      'Meditation': { val: 0, color: 'var(--cat-meditation)' },
      'Learning': { val: 0, color: 'var(--cat-learning)' },
      'Journaling': { val: 0, color: 'var(--cat-journaling)' },
    };

    let total = 0;

    // Map tasks to Deep Work
    const completedTasks = tasks.filter((t) => t.completedAt && t.completedAt >= rangeStart);
    counts['Deep Work'].val += completedTasks.length;
    total += completedTasks.length;

    // Map journals to Journaling
    const journals = journalEntries.filter((j) => j.createdAt >= rangeStart);
    counts['Journaling'].val += journals.length;
    total += journals.length;

    // Map focus sessions (which could be routines or habits) to Meditation & Learning
    const sessions = focusSessions.filter((s) => s.startTime >= rangeStart);
    sessions.forEach((s) => {
      if (s.routineId.startsWith('habit-')) {
        counts['Learning'].val += 1;
        total += 1;
      } else {
        counts['Meditation'].val += 1;
        total += 1;
      }
    });

    // Map habit check-ins to Learning
    habits.forEach(h => {
      Object.keys(h.history).forEach(dateStr => {
        // approximate comparison
        const d = new Date(dateStr);
        if (d.getTime() >= rangeStart && h.history[dateStr] > 0) {
          counts['Learning'].val += 1;
          total += 1;
        }
      });
    });

    return Object.entries(counts)
      .filter(([_, data]) => data.val > 0)
      .map(([label, data]) => ({
        label,
        value: data.val,
        percent: total > 0 ? (data.val / total) * 100 : 0,
        color: data.color,
      }))
      .sort((a, b) => b.value - a.value);
  }, [focusSessions, tasks, journalEntries, habits, rangeStart]);

  return (
    <div className="loah-card p-6 md:p-8 flex flex-col min-h-[300px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl" style={{ background: 'var(--bg-surface-elevated)', color: 'var(--brand-primary)' }}>
          <PieChart size={20} />
        </div>
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Activity Breakdown
        </h3>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center relative gap-6">
        {breakdownData.length === 0 ? (
          <div className="text-sm font-medium italic" style={{ color: 'var(--text-secondary)' }}>
            No activity data yet.
          </div>
        ) : (
          <>
            {/* Donut Circle SVG or Gradient */}
            <div className="w-32 h-32 rounded-full border-[12px] relative" style={{ borderColor: 'var(--bg-surface-elevated)' }}>
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
              <div className="absolute inset-1 rounded-full flex items-center justify-center border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                <span className="text-[10px] font-bold tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  DIST
                </span>
              </div>
            </div>

            {/* List with Progress Bars */}
            <div className="w-full space-y-3">
              {breakdownData.map((d, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between text-xs font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    <span className="truncate max-w-[120px]">{d.label}</span>
                    <span className="font-mono">{Math.round(d.percent)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-elevated)' }}>
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
