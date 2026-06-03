'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Activity,
  Zap,
  CheckCircle2,
  Smile,
  Brain,
  Plus,
  X,
  Route,
  SmilePlus,
  Sparkles,
} from 'lucide-react';
import ActivityChart from '../charts/ActivityChart';
import MoodChart from '../charts/MoodChart';
import FocusBreakdown from '../charts/FocusBreakdown';
import { Mood } from '../../types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type TimeRange = 'Day' | 'Week' | 'Month' | 'Year';

const MOOD_COLORS: Record<Mood, string> = {
  awesome: '#059669',
  good: '#3366CC',
  neutral: '#64748B',
  bad: '#DB8A66',
  awful: '#9F3834',
};

export const DashboardModule: React.FC = () => {
  const router = useRouter();
  const tasks = useAppStore((s) => s.tasks);
  const routines = useAppStore((s) => s.routines);
  const focusSessions = useAppStore((s) => s.focusSessions);
  const journalEntries = useAppStore((s) => s.journalEntries);
  const handleQuickAction = useAppStore((s) => s.handleQuickAction);
  const setCurrentView = useAppStore((s) => s.setCurrentView);
  const handleExport = useAppStore((s) => s.handleExport);
  const importStoreData = useAppStore((s) => s.importStoreData);
  const habits = useAppStore((s) => s.habits);

  const [range, setRange] = React.useState<TimeRange>('Week');
  const [now, setNow] = React.useState(new Date());
  const [selectedActivity, setSelectedActivity] = React.useState<{
    id: string;
    type: 'task' | 'session' | 'journal';
    item: any;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(iv);
  }, []);

  const getRangeStart = (r: TimeRange) => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    if (r === 'Week') {
      const day = d.getDay();
      d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    } else if (r === 'Month') {
      d.setDate(1);
    } else if (r === 'Year') {
      d.setMonth(0, 1);
    }
    return d.getTime();
  };

  const formatDur = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h${m}m` : `${m}m`;
  };

  const rangeStart = getRangeStart(range);
  const activeTasks = React.useMemo(() => tasks.filter((t) => !t.deletedAt), [tasks]);

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
      .filter((t) => !t.deletedAt && !t.archivedAt && t.isCompleted && t.completedAt)
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
        subtitle: `${formatDur(s.durationSeconds)} Focus`,
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

    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
  }, [tasks, focusSessions, journalEntries]);

  const totalActions = React.useMemo(() => {
    const steps =
      range === 'Day' ? 24 : range === 'Week' ? 7 : range === 'Month'
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        : 12;
    let sum = 0;
    for (let i = 0; i < steps; i++) {
      const d = new Date(rangeStart);
      if (range === 'Day') d.setHours(i);
      else if (range === 'Week') d.setDate(d.getDate() + i);
      else if (range === 'Month') d.setDate(i + 1);
      else d.setMonth(i);
      const ps = d.getTime();
      const pe = range === 'Day' ? ps + 3600000 : range === 'Year'
        ? new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime()
        : ps + 86400000;
      sum += tasks.filter((t) => !t.deletedAt && !t.archivedAt && t.completedAt && t.completedAt >= ps && t.completedAt < pe).length
        + focusSessions.filter((s) => s.startTime >= ps && s.startTime < pe).length;
    }
    return sum;
  }, [range, tasks, focusSessions, rangeStart, now]);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (confirm('Import data? This will replace your current data.')) {
          const ok = importStoreData(data);
          alert(ok ? 'Imported!' : 'Invalid data format.');
        }
      } catch { alert('Invalid JSON.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="w-full h-full overflow-y-auto no-scrollbar pb-32">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="loah-module-header"
        style={{ paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}
      >
        <div>
          <div className="loah-module-title">Dashboard</div>
          <div className="loah-module-date">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center pt-1">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as TimeRange)}
            className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-bold rounded-xl px-3 py-2 outline-none appearance-none cursor-pointer"
            style={{ minWidth: '100px' }}
          >
            {(['Day', 'Week', 'Month', 'Year'] as TimeRange[]).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-4 md:px-6 space-y-6">
        {/* ── Quick Action 2×2 Grid ───────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/dump/new"
            className="flex flex-col items-start p-4 gap-3 rounded-2xl border transition-all hover:-translate-y-1"
            style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(77, 169, 255, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Brain size={22} color="var(--cat-hydration)" />
            </div>
            <div className="text-left">
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Brain Dump</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Unload your mind</div>
            </div>
          </Link>

          <Link
            href="/tasks/new"
            className="flex flex-col items-start p-4 gap-3 rounded-2xl border transition-all hover:-translate-y-1"
            style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(167, 200, 27, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Plus size={22} color="var(--brand-primary)" />
            </div>
            <div className="text-left">
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Quick Task</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Add to-do</div>
            </div>
          </Link>

          <Link
            href="/routines/new"
            className="flex flex-col items-start p-4 gap-3 rounded-2xl border transition-all hover:-translate-y-1"
            style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(168, 112, 255, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Route size={22} color="var(--cat-meditation)" />
            </div>
            <div className="text-left">
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>New Routine</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Habit flows</div>
            </div>
          </Link>

          <Link
            href="/journal/new"
            className="flex flex-col items-start p-4 gap-3 rounded-2xl border transition-all hover:-translate-y-1"
            style={{ background: 'var(--bg-surface-elevated)', borderColor: 'var(--border-subtle)' }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255, 127, 176, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Sparkles size={22} color="var(--cat-journaling)" />
            </div>
            <div className="text-left">
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Log Mood</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Track feelings</div>
            </div>
          </Link>
        </div>

        {/* ── Charts Grid ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Activity Chart - 2/3 */}
          <div className="lg:col-span-2">
            <div className="loah-card p-5">
              <ActivityChart
                tasks={activeTasks}
                focusSessions={focusSessions}
                habits={habits}
                range={range}
                rangeStart={rangeStart}
              />
            </div>
          </div>

          {/* Focus Breakdown - 1/3 */}
          <div className="loah-card p-5">
            <FocusBreakdown
              focusSessions={focusSessions}
              tasks={activeTasks}
              journalEntries={journalEntries}
              habits={habits}
              rangeStart={rangeStart}
            />
          </div>

          {/* Mood Trends - 2/3 */}
          <div className="lg:col-span-2">
            <div className="loah-card p-5">
              <MoodChart
                journalEntries={journalEntries}
                range={range}
                rangeStart={rangeStart}
              />
            </div>
          </div>

          {/* Activity Feed - 1/3 */}
          <div className="loah-card p-5 flex flex-col">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(1, 247, 171, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Activity size={15} color="#059669" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Activity Feed
                </span>
              </div>
              <button
                onClick={() => setCurrentView('activity')}
                style={{
                  fontSize: 11, fontWeight: 700, color: '#8979FF',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                View All
              </button>
            </div>

            <div className="flex-1 space-y-3">
              {timelineData.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedActivity({ id: item.id, type: item.type, item: item.item })}
                  className="w-full text-left flex items-start gap-3 group"
                  style={{ padding: '8px', borderRadius: 10, transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div
                    className={item.dot}
                    style={{
                      width: 26, height: 26, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(226,232,240,0.8)',
                      flexShrink: 0, marginTop: 1,
                    }}
                  >
                    <item.icon size={12} color="#64748B" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div style={{ fontSize: 10, color: '#808DA9', marginTop: 1 }}>
                        {item.subtitle} ·{' '}
                        {new Date(item.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    )}
                  </div>
                </button>
              ))}

              {timelineData.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: 12 }}>
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Import input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImport}
        accept=".json"
        className="hidden"
      />

      {/* ── Activity Detail Panel ──────────────────────────────── */}
      {selectedActivity && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedActivity(null)}
        >
          <div
            className="loah-card w-full max-w-md mb-6 mx-4 animate-slide-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#808DA9', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Activity Details
              </span>
              <button
                onClick={() => setSelectedActivity(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {selectedActivity.type === 'task' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {selectedActivity.item.title}
                  </h3>
                  <p style={{ fontSize: 11, color: '#808DA9', marginBottom: 12 }}>
                    Completed on {new Date(selectedActivity.item.completedAt).toLocaleString()}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Category', value: selectedActivity.item.category },
                      { label: 'Priority', value: selectedActivity.item.priority },
                      { label: 'Duration', value: `${selectedActivity.item.duration}m` },
                    ].map((row) => (
                      <div
                        key={row.label}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 10,
                          padding: '10px 12px',
                        }}
                      >
                        <div style={{ fontSize: 10, color: '#808DA9', marginBottom: 2 }}>{row.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                          {row.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedActivity.type === 'session' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {selectedActivity.item.routineTitle}
                  </h3>
                  <p style={{ fontSize: 11, color: '#808DA9', marginBottom: 12 }}>
                    {formatDur(selectedActivity.item.durationSeconds)} · {selectedActivity.item.completedSteps}/{selectedActivity.item.totalSteps} steps
                  </p>
                </div>
              )}

              {selectedActivity.type === 'journal' && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    {selectedActivity.item.title}
                  </h3>
                  <p style={{ fontSize: 11, color: '#808DA9', marginBottom: 4 }}>
                    Logged on {new Date(selectedActivity.item.createdAt).toLocaleString()}
                  </p>
                  <span
                    style={{
                      fontSize: 11, fontWeight: 700,
                      color: MOOD_COLORS[selectedActivity.item.mood as Mood] || '#64748B',
                      textTransform: 'capitalize',
                    }}
                  >
                    Mood: {selectedActivity.item.mood}
                  </span>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedActivity(null)}
                className="loah-btn-ghost"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatDur = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h${m}m` : `${m}m`;
};

export default DashboardModule;
