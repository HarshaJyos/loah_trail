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
} from 'lucide-react';
import ActivityChart from '../charts/ActivityChart';
import MoodChart from '../charts/MoodChart';
import FocusBreakdown from '../charts/FocusBreakdown';
import Card from '../ui/Card';
import Button from '../ui/Button';

import { Mood } from '../../types';

type TimeRange = 'Day' | 'Week' | 'Month' | 'Year';

const MOOD_VALUES = {
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

export const DashboardModule: React.FC = () => {
  const tasks = useAppStore((state) => state.tasks);
  const routines = useAppStore((state) => state.routines);
  const notes = useAppStore((state) => state.notes);
  const focusSessions = useAppStore((state) => state.focusSessions);
  const journalEntries = useAppStore((state) => state.journalEntries);

  const startRoutine = useAppStore((state) => state.startRoutine);
  const setCurrentView = useAppStore((state) => state.setCurrentView);
  const handleQuickAction = useAppStore((state) => state.handleQuickAction);
  const handleExport = useAppStore((state) => state.handleExport);
  const importStoreData = useAppStore((state) => state.importStoreData);

  const [range, setRange] = React.useState<TimeRange>('Week');
  const [now, setNow] = React.useState(new Date());
  const [selectedActivity, setSelectedActivity] = React.useState<{
    id: string;
    type: 'task' | 'session' | 'journal';
    item: any;
  } | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const getRangeStart = (r: TimeRange) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    if (r === 'Day') return date.getTime();
    if (r === 'Week') {
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      date.setDate(diff);
    } else if (r === 'Month') {
      date.setDate(1);
    } else if (r === 'Year') {
      date.setMonth(0);
      date.setDate(1);
    }
    return date.getTime();
  };

  const formatDurationShort = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h${m}m`;
    return `${m}m`;
  };

  const rangeStart = getRangeStart(range);
  const activeTasks = React.useMemo(() => tasks.filter((t) => !t.deletedAt), [tasks]);
  const activeRoutines = React.useMemo(() => routines.filter((r) => !r.deletedAt), [routines]);

  // Timeline Data - LIMITED TO 2 ITEMS
  const timelineData = React.useMemo(() => {
    const items: {
      id: string;
      type: 'task' | 'session' | 'journal';
      timestamp: number;
      title: string;
      subtitle?: string;
      icon: any;
      color: string;
      item: any;
    }[] = [];

    tasks
      .filter((t) => t.isCompleted && t.completedAt)
      .forEach((t) => {
        items.push({
          id: t.id,
          type: 'task',
          timestamp: t.completedAt!,
          title: t.title,
          subtitle: 'Task Completed',
          icon: CheckCircle2,
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
          item: t,
        });
      });

    focusSessions.forEach((s) => {
      items.push({
        id: s.id,
        type: 'session',
        timestamp: s.endTime,
        title: s.routineTitle,
        subtitle: `${formatDurationShort(s.durationSeconds)} Focus`,
        icon: Zap,
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        item: s,
      });
    });

    journalEntries
      .filter((j) => !j.deletedAt)
      .forEach((j) => {
        items.push({
          id: j.id,
          type: 'journal',
          timestamp: j.createdAt,
          title: j.title,
          subtitle: `Mood: ${j.mood}`,
          icon: Smile,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
          item: j,
        });
      });

    // Sort by recent first, then slice to top 2
    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, 2);
  }, [tasks, focusSessions, journalEntries]);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        if (confirm('Import data? This will replace your current data permanently.')) {
          const success = importStoreData(data);
          if (success) {
            alert('Data imported successfully!');
          } else {
            alert('Failed to import. Invalid backup data format.');
          }
        }
      } catch (err) {
        alert('Failed to import. Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalActions = React.useMemo(() => {
    const steps =
      range === 'Day'
        ? 24
        : range === 'Week'
        ? 7
        : range === 'Month'
        ? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        : 12;

    let sum = 0;
    for (let i = 0; i < steps; i++) {
      let date = new Date(rangeStart);
      if (range === 'Day') date.setHours(i);
      else if (range === 'Week') date.setDate(date.getDate() + i);
      else if (range === 'Month') date.setDate(i + 1);
      else date.setMonth(i);

      const periodStart = date.getTime();
      let periodEnd = 0;

      if (range === 'Day') periodEnd = periodStart + 3600000;
      else if (range === 'Week' || range === 'Month') periodEnd = periodStart + 86400000;
      else periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime();

      const completedTasks = tasks.filter(
        (t) => t.completedAt && t.completedAt >= periodStart && t.completedAt < periodEnd
      ).length;
      const sessions = focusSessions.filter(
        (s) => s.startTime >= periodStart && s.startTime < periodEnd
      ).length;
      sum += completedTasks + sessions;
    }
    return sum;
  }, [range, tasks, focusSessions, rangeStart, now]);

  return (
    <div className="w-full h-full p-4 md:p-8 space-y-6 pb-32 max-w-7xl mx-auto overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] mt-1 font-medium text-sm">
            {now.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex bg-[#12121a] border border-white/5 p-1 rounded-2xl shadow-lg shrink-0 overflow-x-auto no-scrollbar">
          {(['Day', 'Week', 'Month', 'Year'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap
                ${
                  range === r
                    ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                }
              `}
            >
              {r}
            </button>
          ))}
        </div>
      </header>

      {/* Quick Action Grid (Glassmorphism) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Brain Dump */}
        <button
          onClick={() => handleQuickAction('dump')}
          className="bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-400 p-5 rounded-3xl flex flex-col items-start gap-4 transition-all duration-300 group active:scale-95 shadow-lg hover:shadow-amber-500/5"
        >
          <div className="bg-amber-500/15 p-3 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(245,158,11,0.1)]">
            <Brain size={24} />
          </div>
          <div className="text-left">
            <span className="block font-black text-[var(--text-primary)] text-lg">
              Brain Dump
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Unload your mind
            </span>
          </div>
        </button>

        {/* Quick Task */}
        <button
          onClick={() => handleQuickAction('task')}
          className="bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-400 p-5 rounded-3xl flex flex-col items-start gap-4 transition-all duration-300 group active:scale-95 shadow-lg hover:shadow-cyan-500/5"
        >
          <div className="bg-cyan-500/15 p-3 rounded-2xl text-cyan-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <Plus size={24} />
          </div>
          <div className="text-left">
            <span className="block font-black text-[var(--text-primary)] text-lg">
              Quick Task
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Add to-do
            </span>
          </div>
        </button>

        {/* Focus Now */}
        <button
          onClick={() => handleQuickAction('focus')}
          className="bg-violet-500/5 hover:bg-violet-500/10 border border-violet-500/20 hover:border-violet-400 p-5 rounded-3xl flex flex-col items-start gap-4 transition-all duration-300 group active:scale-95 shadow-lg hover:shadow-violet-500/5"
        >
          <div className="bg-violet-500/15 p-3 rounded-2xl text-violet-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(124,58,237,0.1)]">
            <Zap size={24} fill="currentColor" />
          </div>
          <div className="text-left">
            <span className="block font-black text-[var(--text-primary)] text-lg">
              Focus Now
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Go to Routines
            </span>
          </div>
        </button>

        {/* Log Mood */}
        <button
          onClick={() => handleQuickAction('journal')}
          className="bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-400 p-5 rounded-3xl flex flex-col items-start gap-4 transition-all duration-300 group active:scale-95 shadow-lg hover:shadow-emerald-500/5"
        >
          <div className="bg-emerald-500/15 p-3 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Smile size={24} />
          </div>
          <div className="text-left">
            <span className="block font-black text-[var(--text-primary)] text-lg">
              Log Mood
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              Check in
            </span>
          </div>
        </button>
      </section>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-2">
          <ActivityChart
            tasks={activeTasks}
            focusSessions={focusSessions}
            range={range}
            rangeStart={rangeStart}
          />
        </div>

        {/* Focus Breakdown */}
        <div className="col-span-1">
          <FocusBreakdown focusSessions={focusSessions} rangeStart={rangeStart} />
        </div>

        {/* Mood Trends */}
        <div className="lg:col-span-2">
          <MoodChart
            journalEntries={journalEntries}
            range={range}
            rangeStart={rangeStart}
          />
        </div>

        {/* Activity Timeline Feed */}
        <div className="col-span-1">
          <Card className="p-6 md:p-8 flex flex-col h-full bg-[#1a1a26]/30">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                  <Activity size={20} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Activity Feed
                </h3>
              </div>
              <Button
                size="sm"
                variant="glass"
                onClick={() => setCurrentView('activity')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                View All
              </Button>
            </div>

            <div className="flex-1 overflow-hidden relative pl-4 pr-1 min-h-[160px]">
              <div className="absolute left-[27px] top-4 bottom-0 w-px bg-white/5" />
              <div className="space-y-6 pb-4">
                {timelineData.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() =>
                      setSelectedActivity({
                        id: item.id,
                        type: item.type,
                        item: item.item,
                      })
                    }
                    className="relative flex items-start gap-4 group w-full text-left hover:bg-white/5 p-2 -ml-2 rounded-xl transition-all"
                  >
                    <div
                      className={`w-6 h-6 rounded-full border border-zinc-950 shrink-0 z-10 flex items-center justify-center shadow-sm relative top-1 ${item.color}`}
                    >
                      <item.icon size={12} strokeWidth={3} />
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <div className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1 flex justify-between font-mono">
                        <span>
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                        <span>
                          {new Date(item.timestamp).toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric' }
                          )}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] leading-normal truncate group-hover:text-white">
                        {item.title}
                      </h4>
                      {item.subtitle && (
                        <p className="text-xs text-[var(--text-secondary)] truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
                {timelineData.length === 0 && (
                  <p className="text-gray-500 text-sm font-medium italic pl-10 pt-4">
                    No recent activity.
                  </p>
                )}
                {timelineData.length > 0 && (
                  <div className="text-center text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest pt-4 font-mono">
                    See {Math.max(0, totalActions - 2)} more in Activity
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Hidden input for backup uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      {/* Activity Details Popup Card (Glassmorphic blur) */}
      {selectedActivity && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-[#12121a] border border-white/5 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                Activity Details
              </h2>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-[var(--text-secondary)] hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto no-scrollbar space-y-4">
              {selectedActivity.type === 'task' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-blue-500/15 rounded-full flex items-center justify-center mx-auto text-blue-400 mb-2">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-center text-[var(--text-primary)]">
                    {selectedActivity.item.title}
                  </h3>
                  <p className="text-center text-xs text-[var(--text-secondary)] font-mono">
                    Completed on{' '}
                    {new Date(
                      selectedActivity.item.completedAt
                    ).toLocaleString()}
                  </p>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2 mt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)] font-medium">Category</span>
                      <span className="font-bold">{selectedActivity.item.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)] font-medium">Duration Est.</span>
                      <span className="font-bold">{selectedActivity.item.duration}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)] font-medium">Priority</span>
                      <span className="font-bold">{selectedActivity.item.priority}</span>
                    </div>
                  </div>
                </div>
              )}
              {selectedActivity.type === 'session' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-amber-500/15 rounded-full flex items-center justify-center mx-auto text-amber-400 mb-2">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <h3 className="text-xl font-bold text-center text-[var(--text-primary)]">
                    {selectedActivity.item.routineTitle}
                  </h3>
                  <p className="text-center text-xs text-[var(--text-secondary)] font-mono">
                    Session ended on{' '}
                    {new Date(selectedActivity.item.endTime).toLocaleString()}
                  </p>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5">
                      <div className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider font-mono">
                        Duration
                      </div>
                      <div className="text-lg font-bold text-[var(--text-primary)] font-mono">
                        {Math.round(selectedActivity.item.durationSeconds / 60)}m
                      </div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl text-center border border-white/5">
                      <div className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider font-mono">
                        Steps
                      </div>
                      <div className="text-lg font-bold text-[var(--text-primary)] font-mono">
                        {selectedActivity.item.completedSteps} /{' '}
                        {selectedActivity.item.totalSteps}
                      </div>
                    </div>
                  </div>
                  {selectedActivity.item.logs &&
                    selectedActivity.item.logs.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 font-mono">
                          Step Breakdown
                        </h4>
                        <div className="space-y-2">
                          {selectedActivity.item.logs.map(
                            (log: any, i: number) => (
                              <div
                                key={i}
                                className="flex justify-between text-xs bg-white/5 p-2 rounded-xl border border-white/5"
                              >
                                <span className="text-[var(--text-primary)] font-medium">
                                  {log.title}
                                </span>
                                <span className="text-[var(--text-secondary)] font-mono">
                                  {formatDurationShort(log.actualDuration)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}
              {selectedActivity.type === 'journal' && (
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-purple-500/15 rounded-full flex items-center justify-center mx-auto text-purple-400 mb-2">
                    <Smile size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-center text-[var(--text-primary)]">
                    {selectedActivity.item.title}
                  </h3>
                  <p className="text-center text-xs text-[var(--text-secondary)] font-mono">
                    Logged on{' '}
                    {new Date(selectedActivity.item.createdAt).toLocaleString()}
                  </p>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-2 mt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)] font-medium">Mood</span>
                      <span
                        className="font-bold capitalize"
                        style={{
                          color:
                            MOOD_COLORS[
                              selectedActivity.item.mood as Mood
                            ] || '#fff',
                        }}
                      >
                        {selectedActivity.item.mood}
                      </span>
                    </div>
                    {selectedActivity.item.tags &&
                      selectedActivity.item.tags.length > 0 && (
                        <div className="pt-2">
                          <span className="block text-xs text-[var(--text-secondary)] mb-1 font-medium">
                            Tags
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {selectedActivity.item.tags.map((tag: string) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-[10px] font-semibold"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex justify-end">
              <Button onClick={() => setSelectedActivity(null)} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardModule;
