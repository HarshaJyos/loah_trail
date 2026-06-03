'use client';

import * as React from 'react';
import { Smile } from 'lucide-react';
import { JournalEntry, Mood } from '../../types';

interface MoodChartProps {
  journalEntries: JournalEntry[];
  range: 'Day' | 'Week' | 'Month' | 'Year';
  rangeStart: number;
}

const MOOD_VALUES: Record<Mood, number> = {
  awesome: 5,
  good: 4,
  neutral: 3,
  bad: 2,
  awful: 1,
};

const MOOD_COLORS: Record<Mood, string> = {
  awesome: '#10b981', // Emerald
  good: '#3b82f6', // Blue
  neutral: '#9ca3af', // Gray
  bad: '#f97316', // Orange
  awful: '#ef4444', // Red
};

export const MoodChart: React.FC<MoodChartProps> = ({
  journalEntries,
  range,
  rangeStart,
}) => {
  const now = React.useMemo(() => new Date(), []);

  const chartData = React.useMemo(() => {
    const buckets: { label: string; value: number; color: string }[] = [];
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
        label = i % 6 === 0 ? `${i}h` : '';
      } else if (range === 'Week') {
        date.setDate(date.getDate() + i);
        label = date.toLocaleDateString('en-US', { weekday: 'narrow' });
      } else if (range === 'Month') {
        date.setDate(i + 1);
        label = (i + 1) % 5 === 0 ? (i + 1).toString() : '';
      } else {
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

      const entries = journalEntries.filter(
        (j) =>
          !j.deletedAt && j.createdAt >= periodStart && j.createdAt < periodEnd
      );

      let avgMood = 0;
      let color = '#E2E8F0';

      if (entries.length > 0) {
        const sum = entries.reduce(
          (acc, curr) => acc + MOOD_VALUES[curr.mood],
          0
        );
        avgMood = sum / entries.length;
        const roundedMood = Math.round(avgMood);
        if (roundedMood >= 5) color = MOOD_COLORS.awesome;
        else if (roundedMood >= 4) color = MOOD_COLORS.good;
        else if (roundedMood >= 3) color = MOOD_COLORS.neutral;
        else if (roundedMood >= 2) color = MOOD_COLORS.bad;
        else color = MOOD_COLORS.awful;
      }
      buckets.push({ label, value: avgMood, color });
    }
    return buckets;
  }, [range, journalEntries, rangeStart, now]);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[2rem] p-6 md:p-8 hover:border-[var(--border-active)] hover:shadow-[var(--glow-purple)] transition-all duration-300 flex flex-col min-h-[300px]">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400">
            <Smile size={20} />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Mood Trends
          </h3>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[160px] pl-6">
        {/* Horizontal scale line segments (scores 1 to 5) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-6">
          {[5, 4, 3, 2, 1].map((lvl) => (
            <div
              key={lvl}
              className="w-full h-px border-t border-dashed border-slate-200/60 relative"
            >
              <span className="absolute -left-6 -top-2 text-[9px] text-zinc-600 font-bold font-mono">
                {lvl}
              </span>
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="w-full h-full flex items-end justify-between gap-1 pt-6 pb-2">
          {chartData.map((d, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col justify-end h-full group relative min-w-[4px]"
            >
              <div
                className="w-full rounded-md transition-all duration-500 hover:brightness-110 relative"
                style={{
                  height: `${d.value === 0 ? 4 : (d.value / 5) * 100}%`,
                  backgroundColor: d.color,
                }}
              >
                {d.value > 0 && (
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-slate-200 text-slate-800 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 pointer-events-none transition-opacity shadow-lg">
                    Score: {d.value.toFixed(1)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* X Axis Labels */}
      <div className="pl-6 flex justify-between mt-2 pt-2 border-t border-slate-200/60 text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
        {chartData
          .filter((_, i) => i % Math.ceil(chartData.length / 6) === 0)
          .map((d, i) => (
            <span key={i}>{d.label}</span>
          ))}
      </div>
    </div>
  );
};
export default MoodChart;
