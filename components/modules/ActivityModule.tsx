'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Mood } from '../../types';
import {
  Activity,
  CheckCircle2,
  Zap,
  Smile,
  Trash2,
  Filter,
  ArrowLeft,
  X,
  Calendar,
  Clock,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

type FilterType = 'all' | 'task' | 'session' | 'journal';
type TimeRange = 'day' | 'week' | 'month' | 'all';

const MOOD_COLORS = {
  awesome: '#10b981', // Emerald
  good: '#3b82f6', // Blue
  neutral: '#9ca3af', // Gray
  bad: '#f97316', // Orange
  awful: '#ef4444', // Red
};

export const ActivityModule: React.FC = () => {
  const router = useRouter();
  const [filter, setFilter] = React.useState<FilterType>('all');
  const [range, setRange] = React.useState<TimeRange>('week');
  const [selectedActivity, setSelectedActivity] = React.useState<{
    id: string;
    type: 'task' | 'session' | 'journal';
    item: any;
  } | null>(null);

  // Zustand store
  const tasks = useAppStore((state) => state.tasks);
  const focusSessions = useAppStore((state) => state.focusSessions);
  const journalEntries = useAppStore((state) => state.journalEntries);
  const toggleTask = useAppStore((state) => state.toggleTask);
  const setFocusSessions = useAppStore((state) => state.setFocusSessions);
  const handleDeleteJournalEntry = useAppStore((state) => state.handleDeleteJournalEntry);

  const getRangeStart = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (range === 'day') return now.getTime();
    if (range === 'week') {
      const d = new Date(now);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      return d.getTime();
    }
    if (range === 'month') {
      const d = new Date(now);
      d.setDate(1);
      return d.getTime();
    }
    return 0;
  };

  const formatDurationShort = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h${m}m`;
    return `${m}m`;
  };

  const filteredItems = React.useMemo(() => {
    const start = getRangeStart();
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

    if (filter === 'all' || filter === 'task') {
      tasks
        .filter((t) => t.isCompleted && t.completedAt && t.completedAt >= start)
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
    }

    if (filter === 'all' || filter === 'session') {
      focusSessions
        .filter((s) => s.startTime >= start)
        .forEach((s) => {
          const duration = Math.round(s.durationSeconds / 60);
          items.push({
            id: s.id,
            type: 'session',
            timestamp: s.endTime,
            title: s.routineTitle,
            subtitle: `${duration}m Focus Session`,
            icon: Zap,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            item: s,
          });
        });
    }

    if (filter === 'all' || filter === 'journal') {
      journalEntries
        .filter((j) => !j.deletedAt && j.createdAt >= start)
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
    }

    return items.sort((a, b) => b.timestamp - a.timestamp);
  }, [tasks, focusSessions, journalEntries, filter, range]);

  const handleDeleteActivity = (id: string, type: 'task' | 'session' | 'journal') => {
    if (confirm(`Are you sure you want to remove this record from history?`)) {
      if (type === 'task') {
        toggleTask(id);
      } else if (type === 'session') {
        setFocusSessions((prev) => prev.filter((s) => s.id !== id));
      } else if (type === 'journal') {
        handleDeleteJournalEntry(id);
      }
      if (selectedActivity && selectedActivity.id === id) {
        setSelectedActivity(null);
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-canvas)] animate-fade-in">
      {/* Top sticky navbar matching Frame132 header-notes */}
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', flexDirection: 'column', gap: 16,
          flexShrink: 0, background: 'var(--bg-app)', zIndex: 20
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-subtle)',
                background: '#FFFFFF', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
              className="hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity className="text-emerald-500" size={24} /> Activity History
              </div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>
                Audit trails of your completed tasks, routine player focus sessions, and logs.
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Ranges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 3, alignItems: 'center', gap: 4 }}>
            {(['all', 'task', 'session', 'journal'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  background: filter === f ? '#F1F5F9' : 'transparent',
                  color: filter === f ? 'var(--text-primary)' : '#64748B',
                  border: 'none', cursor: 'pointer'
                }}
              >
                {f === 'all' ? 'All' : f === 'session' ? 'Focus' : f === 'journal' ? 'Logs' : 'Tasks'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 3, alignItems: 'center', gap: 4 }}>
            {(['day', 'week', 'month', 'all'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  background: range === r ? '#F1F5F9' : 'transparent',
                  color: range === r ? 'var(--text-primary)' : '#64748B',
                  border: 'none', cursor: 'pointer'
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() =>
                setSelectedActivity({
                  id: item.id,
                  type: item.type,
                  item: item.item,
                })
              }
              className="loah-card group relative cursor-pointer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                padding: '16px 20px',
              }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.color} group-hover:scale-105 transition-transform`}
                >
                  <item.icon size={20} strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#64748B', background: '#F1F5F9', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF' }}>
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }} className="truncate max-w-sm sm:max-w-md md:max-w-lg">
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <p style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteActivity(item.id, item.type);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  width: 32, height: 32, borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF'
                }}
                title="Delete Record"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="py-24 flex flex-col items-center justify-center text-center border border-dashed border-[var(--border-default)] rounded-3xl bg-[var(--bg-surface-elevated)] text-[var(--text-tertiary)]">
              <div className="w-16 h-16 bg-[var(--bg-surface-elevated)] rounded-full flex items-center justify-center shadow-lg border border-[var(--border-subtle)] mb-6 text-[var(--text-secondary)]">
                <Filter size={28} />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">No activity found</h3>
              <p className="text-[var(--text-tertiary)] text-xs max-w-sm px-4 leading-relaxed">
                There are no actions logged within the selected range or filters. Keep completing tasks and tracking routines!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedActivity && (
        <Modal
          isOpen={!!selectedActivity}
          onClose={() => setSelectedActivity(null)}
          title="Activity Details"
          className="max-w-md"
        >
          <div className="space-y-6">
            {selectedActivity.type === 'task' && (
              <div className="space-y-4">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto text-blue-400 border border-blue-500/20">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-center text-[var(--text-primary)] leading-tight">
                    {selectedActivity.item.title}
                  </h3>
                  <p className="text-center text-xs text-[var(--text-secondary)] font-mono mt-1 flex items-center justify-center gap-1.5">
                    <Calendar size={12} />
                    Completed on {new Date(selectedActivity.item.completedAt).toLocaleString()}
                  </p>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)] font-medium">Category</span>
                    <span className="font-bold text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] px-2 py-0.5 rounded-lg text-xs border border-[var(--border-subtle)]">
                      {selectedActivity.item.category}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)] font-medium">Duration Estimate</span>
                    <span className="font-bold text-[var(--text-primary)] font-mono">{selectedActivity.item.duration}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)] font-medium">Priority</span>
                    <span className={`font-bold px-2 py-0.5 rounded-lg text-xs font-mono border
                      ${
                        selectedActivity.item.priority === 'High'
                          ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                          : selectedActivity.item.priority === 'Medium'
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                          : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                      }`}>
                      {selectedActivity.item.priority}
                    </span>
                  </div>
                </div>

                {selectedActivity.item.description && (
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest block mb-1.5 font-mono">
                      Description
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed">
                      {selectedActivity.item.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedActivity.type === 'session' && (
              <div className="space-y-4">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-400 border border-amber-500/20">
                  <Zap size={28} fill="currentColor" className="opacity-20" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-center text-[var(--text-primary)] leading-tight">
                    {selectedActivity.item.routineTitle}
                  </h3>
                  <p className="text-center text-xs text-[var(--text-secondary)] font-mono mt-1 flex items-center justify-center gap-1.5">
                    <Clock size={12} />
                    Ended on {new Date(selectedActivity.item.endTime).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--bg-surface)] p-3 rounded-2xl text-center border border-[var(--border-subtle)]">
                    <div className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider font-mono mb-0.5">
                      Focus Duration
                    </div>
                    <div className="text-lg font-black text-[var(--text-primary)] font-mono">
                      {Math.round(selectedActivity.item.durationSeconds / 60)}m
                    </div>
                  </div>
                  <div className="bg-[var(--bg-surface)] p-3 rounded-2xl text-center border border-[var(--border-subtle)]">
                    <div className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider font-mono mb-0.5">
                      Steps Completed
                    </div>
                    <div className="text-lg font-black text-[var(--text-primary)] font-mono">
                      {selectedActivity.item.completedSteps} / {selectedActivity.item.totalSteps}
                    </div>
                  </div>
                </div>

                {selectedActivity.item.logs && selectedActivity.item.logs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-mono">
                      Step breakdown
                    </h4>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar border border-[var(--border-subtle)] rounded-2xl p-2 bg-[var(--bg-surface-elevated)]0">
                      {selectedActivity.item.logs.map((log: any, i: number) => (
                        <div
                          key={i}
                          className="flex justify-between items-center text-xs bg-[var(--bg-surface)] p-2.5 rounded-xl border border-[var(--border-subtle)]"
                        >
                          <span className="text-[var(--text-primary)] font-bold truncate pr-2">
                            {log.title}
                          </span>
                          <span className="text-[var(--text-secondary)] font-mono whitespace-nowrap font-bold shrink-0">
                            {formatDurationShort(log.actualDuration)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedActivity.type === 'journal' && (
              <div className="space-y-4">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto text-purple-400 border border-purple-500/20">
                  <Smile size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-center text-[var(--text-primary)] leading-tight">
                    {selectedActivity.item.title || 'Untitled Journal Entry'}
                  </h3>
                  <p className="text-center text-xs text-[var(--text-secondary)] font-mono mt-1 flex items-center justify-center gap-1.5">
                    <Calendar size={12} />
                    Logged on {new Date(selectedActivity.item.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--text-secondary)] font-medium">Logged Mood</span>
                    <span
                      className="font-bold capitalize px-3 py-1 rounded-xl text-xs border"
                      style={{
                        color: MOOD_COLORS[selectedActivity.item.mood as Mood] || '#fff',
                        borderColor: (MOOD_COLORS[selectedActivity.item.mood as Mood] || '#fff') + '33',
                        backgroundColor: (MOOD_COLORS[selectedActivity.item.mood as Mood] || '#fff') + '10',
                      }}
                    >
                      {selectedActivity.item.mood}
                    </span>
                  </div>

                  {selectedActivity.item.tags && selectedActivity.item.tags.length > 0 && (
                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                      <span className="block text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-widest mb-1.5 font-mono">
                        Tags
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedActivity.item.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20 font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {selectedActivity.item.content && (
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest block mb-1.5 font-mono">
                      Reflections
                    </span>
                    <div className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-4 rounded-2xl whitespace-pre-wrap leading-relaxed max-h-[160px] overflow-y-auto no-scrollbar">
                      {selectedActivity.item.content}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeleteActivity(selectedActivity.id, selectedActivity.type)}
                className="flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Delete Entry</span>
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedActivity(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ActivityModule;
