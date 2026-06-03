'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CheckCircle2, Zap, Smile, Activity as ActivityIcon, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const ActivityModule: React.FC = () => {
  const router = useRouter();
  const tasks = useAppStore((s) => s.tasks);
  const focusSessions = useAppStore((s) => s.focusSessions);
  const journalEntries = useAppStore((s) => s.journalEntries);

  const timelineData = React.useMemo(() => {
    const items: {
      id: string;
      type: 'task' | 'session' | 'journal';
      timestamp: number;
      title: string;
      subtitle?: string;
      icon: any;
      dot: string;
      item: any;
    }[] = [];

    tasks
      .filter((t) => t.isCompleted && t.completedAt)
      .forEach((t) =>
        items.push({
          id: t.id,
          type: 'task',
          timestamp: t.completedAt!,
          title: t.title,
          subtitle: 'Task Completed',
          icon: CheckCircle2,
          dot: 'bg-[#BFDBFE]',
          item: t,
        })
      );

    focusSessions.forEach((s) =>
      items.push({
        id: s.id,
        type: 'session',
        timestamp: s.endTime,
        title: s.routineTitle,
        subtitle: `${Math.round(s.durationSeconds / 60)}m Focus`,
        icon: Zap,
        dot: 'bg-[#FEF08A]',
        item: s,
      })
    );

    journalEntries
      .filter((j) => !j.deletedAt)
      .forEach((j) =>
        items.push({
          id: j.id,
          type: 'journal',
          timestamp: j.createdAt,
          title: j.title,
          subtitle: `Mood: ${j.mood}`,
          icon: Smile,
          dot: 'bg-[#DDD6FE]',
          item: j,
        })
      );

    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [tasks, focusSessions, journalEntries]);

  // Group by date
  const groupedData = React.useMemo(() => {
    const groups: Record<string, typeof timelineData> = {};
    timelineData.forEach(item => {
      const dateStr = new Date(item.timestamp).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });
    return groups;
  }, [timelineData]);

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar pb-32">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="loah-module-header"
        style={{ paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] transition-all shrink-0"
          >
            <ArrowLeft size={20} color="var(--text-secondary)" />
          </button>
          <div>
            <div className="loah-module-title flex items-center gap-2">
              <ActivityIcon size={24} color="var(--cat-hydration)" />
              Activity Feed
            </div>
            <div className="loah-module-date">
              A complete timeline of your journey
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 space-y-8">
        {Object.keys(groupedData).length === 0 ? (
          <div className="text-center py-10 text-[var(--text-secondary)] font-medium">
            No activity yet. Complete a task, focus session, or journal entry to see it here!
          </div>
        ) : (
          Object.keys(groupedData).map(dateStr => (
            <div key={dateStr} className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-wider sticky top-0 bg-[var(--bg-app)] py-2 z-10">
                {dateStr}
              </h3>
              <div className="space-y-3">
                {groupedData[dateStr].map((item) => (
                  <div
                    key={`${item.type}-${item.id}-${item.timestamp}`}
                    className="loah-card p-4 w-full text-left flex items-start gap-4 group"
                  >
                    <div
                      className={item.dot}
                      style={{
                        width: 40, height: 40, borderRadius: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <item.icon size={20} color="var(--text-primary)" style={{ opacity: 0.8 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[var(--text-primary)] truncate" style={{ fontSize: 15 }}>
                        {item.title}
                      </div>
                      <div className="text-[var(--text-secondary)] truncate" style={{ fontSize: 13, marginTop: 2 }}>
                        {item.subtitle}
                      </div>
                    </div>
                    <div className="text-[var(--text-tertiary)] text-xs font-bold whitespace-nowrap self-center bg-[var(--bg-canvas)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] shadow-sm">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
