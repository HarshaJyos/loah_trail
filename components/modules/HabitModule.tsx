'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Habit, HabitFrequencyType, HabitGoalType, HabitType, Reminder } from '../../types';
import {
  Plus,
  Trash2,
  Archive,
  RefreshCcw,
  Check,
  X,
  Edit2,
  CheckCircle,
  Clock,
  Flame,
  ArrowLeft,
  BarChart2,
  Layers,
  CheckSquare,
  Droplets,
  Target,
  Trophy,
  Ban,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Minus,
  Play,
  Bell,
  Pin,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

const COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
  '#a855f7',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getLocalDateStr = (date?: Date) => {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getSmartStep = (target: number) => {
  if (target <= 5) return 1;
  if (target <= 20) return 5;
  if (target <= 100) return 10;
  if (target <= 1000) return 100;
  return 250;
};

const calculateLongestStreak = (habit: Habit) => {
  const history = habit.history;
  const dates = Object.keys(history).sort();
  if (dates.length === 0) return 0;

  let maxStreak = 0;
  let currentStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of dates) {
    const val = history[dateStr];
    if (val === -1) {
      currentStreak = 0;
      prevDate = null;
      continue;
    }

    let isDone = false;
    if (habit.type === 'elastic') isDone = val >= 1;
    else isDone = val >= habit.goal.target;

    if (isDone) {
      const currentDate = new Date(dateStr);
      if (prevDate) {
        const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      prevDate = currentDate;
      maxStreak = Math.max(maxStreak, currentStreak);
    }
  }
  return maxStreak;
};

const ProgressRing = ({
  percentage,
  color,
  size = 32,
  strokeWidth = 3,
  children,
  emptyColor = 'rgba(255, 255, 255, 0.05)',
}: {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  emptyColor?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference -
    (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={emptyColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-current">
        {children}
      </div>
    </div>
  );
};

const YearlyHeatmap: React.FC<{ habit: Habit }> = ({ habit }) => {
  const days = React.useMemo(() => {
    const arr = [];
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - 364);
    for (let i = 0; i < 365; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  return (
    <Card className="p-6">
      <h3 className="text-sm font-bold text-zinc-300 mb-4 font-mono uppercase tracking-wider">
        Consistency Map (Last Year)
      </h3>
      <div className="flex flex-wrap gap-1">
        {days.map((day) => {
          const dateStr = getLocalDateStr(day);
          const val = habit.history[dateStr] || 0;
          const isSkipped = val === -1;
          let bgColor = 'rgba(255, 255, 255, 0.03)';
          let opacity = 1;
          if (isSkipped) {
            bgColor = 'rgba(239, 68, 68, 0.2)';
          } else if (val > 0) {
            if (habit.type === 'elastic' && habit.elasticConfig) {
              if (val >= habit.elasticConfig.elite.target) bgColor = '#ec4899';
              else if (val >= habit.elasticConfig.plus.target) bgColor = '#a855f7';
              else bgColor = '#6366f1';
            } else {
              bgColor = habit.color;
              const pct = Math.min(1, val / habit.goal.target);
              opacity = Math.max(0.3, pct);
            }
          }
          const tooltip = `${day.toLocaleDateString()}: ${
            isSkipped
              ? 'Skipped'
              : val > 0
              ? val +
                ' ' +
                (habit.type === 'elastic'
                  ? habit.elasticConfig?.unit
                  : habit.goal.unit)
              : 'No data'
          }`;
          return (
            <div
              key={dateStr}
              className="w-2.5 h-2.5 rounded-[2px] transition-all hover:scale-125 hover:ring-1 hover:ring-violet-500 cursor-help"
              style={{ backgroundColor: bgColor, opacity }}
              title={tooltip}
            />
          );
        })}
      </div>
    </Card>
  );
};

export const HabitModule: React.FC = () => {
  const habits = useAppStore((state) => state.habits);
  const onAddHabit = useAppStore((state) => state.handleAddHabit);
  const onUpdateHabit = useAppStore((state) => state.handleUpdateHabit);
  const onDeleteHabit = useAppStore((state) => state.handleDeleteHabit);
  const onArchiveHabit = (id: string) => useAppStore.getState().handleArchive(id, 'habit');
  const onUnarchiveHabit = (id: string) => useAppStore.getState().handleUnarchive(id, 'habit');
  const onUpdateProgress = useAppStore((state) => state.handleUpdateHabitProgress);
  const onStartFocus = useAppStore((state) => state.startHabitFocus);
  const onReorder = useAppStore((state) => state.handleReorderHabits);

  const [viewingHabitId, setViewingHabitId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingHabit, setEditingHabit] = React.useState<Habit | undefined>(undefined);
  const [showArchived, setShowArchived] = React.useState(false);
  const [popupData, setPopupData] = React.useState<{ habitId: string; date: string } | null>(null);
  const [draggedHabitId, setDraggedHabitId] = React.useState<string | null>(null);

  const activeHabits = habits.filter((h) => !h.deletedAt && !h.archivedAt);
  const archivedHabits = habits.filter((h) => !h.deletedAt && h.archivedAt);
  const currentViewHabits = showArchived ? archivedHabits : activeHabits;

  // Sort pinned first
  const sortedHabits = React.useMemo(() => {
    return [...currentViewHabits].sort(
      (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
    );
  }, [currentViewHabits]);

  const handleOpenPopup = (e: React.MouseEvent, habit: Habit, dateStr: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPopupData({ habitId: habit.id, date: dateStr });
  };

  const closePopup = () => setPopupData(null);

  const handlePopupSave = (val: number) => {
    if (popupData) {
      onUpdateProgress(popupData.habitId, popupData.date, val);
      closePopup();
    }
  };

  const handleEditHabit = (e: React.MouseEvent, habit: Habit) => {
    e.stopPropagation();
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingHabit(undefined);
  };

  const handleTogglePin = (e: React.MouseEvent, habit: Habit) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdateHabit({ ...habit, isPinned: !habit.isPinned });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedHabitId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedHabitId || draggedHabitId === targetId || !onReorder) return;

    const allHabits = [...habits];
    const fromIndex = allHabits.findIndex((r) => r.id === draggedHabitId);
    const toIndex = allHabits.findIndex((r) => r.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [moved] = allHabits.splice(fromIndex, 1);
      allHabits.splice(toIndex, 0, moved);
      onReorder(allHabits);
    }
    setDraggedHabitId(null);
  };

  // Details calendar month controls
  const [monthOffset, setMonthOffset] = React.useState(0);
  const today = new Date();
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const selectedHabit = React.useMemo(() => {
    return habits.find((h) => h.id === viewingHabitId);
  }, [habits, viewingHabitId]);

  const detailStats = React.useMemo(() => {
    if (!selectedHabit) return null;
    const totalCheckins = Object.values(selectedHabit.history).filter((v) => v > 0).length;
    const skippedDays = Object.values(selectedHabit.history).filter((v) => v === -1).length;
    const longestStreak = calculateLongestStreak(selectedHabit);
    const monthKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;
    const monthlyCheckins = Object.keys(selectedHabit.history).filter(
      (k) => k.startsWith(monthKey) && selectedHabit.history[k] > 0
    ).length;
    const totalCompletion = Object.values(selectedHabit.history)
      .filter((v) => v > 0)
      .reduce((acc, v) => acc + v, 0);

    return { totalCheckins, skippedDays, longestStreak, monthlyCheckins, totalCompletion };
  }, [selectedHabit, viewDate]);

  return (
    <div className="w-full h-full relative flex flex-col pb-32 max-w-7xl mx-auto p-4 md:p-8 overflow-y-auto no-scrollbar">
      {selectedHabit ? (
        // DETAIL VIEW
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <button
              onClick={() => setViewingHabitId(null)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white font-bold uppercase tracking-wider text-xs"
            >
              <ArrowLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-2">
              {!selectedHabit.archivedAt ? (
                <button
                  onClick={() => {
                    onArchiveHabit(selectedHabit.id);
                    setViewingHabitId(null);
                  }}
                  className="p-2.5 bg-white/5 border border-white/5 hover:border-white/10 hover:text-white text-zinc-400 rounded-xl transition-all"
                  title="Archive"
                >
                  <Archive size={16} />
                </button>
              ) : (
                <button
                  onClick={() => {
                    onUnarchiveHabit(selectedHabit.id);
                    setViewingHabitId(null);
                  }}
                  className="p-2.5 bg-white/5 border border-white/5 hover:border-white/10 hover:text-white text-zinc-400 rounded-xl transition-all"
                  title="Restore"
                >
                  <RefreshCcw size={16} />
                </button>
              )}
              <button
                onClick={(e) => handleEditHabit(e, selectedHabit)}
                className="p-2.5 bg-white/5 border border-white/5 hover:border-violet-500/30 hover:text-white text-zinc-400 rounded-xl transition-all"
                title="Edit Habit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => {
                  onDeleteHabit(selectedHabit.id);
                  setViewingHabitId(null);
                }}
                className="p-2.5 bg-white/5 border border-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-500 rounded-xl transition-all"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Details Overview */}
          <div className="flex flex-col md:flex-row items-start gap-6 bg-[#12121a]/30 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 shadow-violet-500/10"
              style={{ backgroundColor: selectedHabit.color }}
            >
              {selectedHabit.goal.type === 'duration' ? (
                <Clock size={32} />
              ) : selectedHabit.goal.unit.toLowerCase().includes('water') ||
                selectedHabit.goal.unit.toLowerCase().includes('ml') ? (
                <Droplets size={32} />
              ) : (
                <CheckSquare size={32} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
                {selectedHabit.title}
              </h1>
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider mb-3">
                <Target size={14} className="text-violet-400" />
                <span>
                  {selectedHabit.type === 'simple'
                    ? `Daily Target: ${selectedHabit.goal.target} ${selectedHabit.goal.unit}`
                    : `Elastic: ${selectedHabit.elasticConfig?.mini.target} / ${selectedHabit.elasticConfig?.plus.target} / ${selectedHabit.elasticConfig?.elite.target} ${selectedHabit.elasticConfig?.unit}`}
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                {selectedHabit.description || 'Building consistency, one day at a time.'}
              </p>
            </div>
            {(selectedHabit.goal.type === 'duration' || selectedHabit.type === 'elastic') && (
              <Button
                onClick={() => onStartFocus(selectedHabit)}
                variant="primary"
                className="flex items-center gap-2 shadow-lg active:scale-95 shrink-0 self-center"
              >
                <Play size={16} fill="currentColor" /> Focus Timer
              </Button>
            )}
          </div>

          {/* Detailed Statistics Cards */}
          {detailStats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                  <CheckCircle2 size={16} />
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono">This Month</span>
                </div>
                <div className="text-2xl font-black text-white">{detailStats.monthlyCheckins}</div>
              </Card>
              <Card className="p-4 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                  <Layers size={16} />
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Total Checks</span>
                </div>
                <div className="text-2xl font-black text-white">{detailStats.totalCheckins}</div>
              </Card>
              <Card className="p-4 flex flex-col justify-between border-orange-500/20 shadow-orange-500/5">
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                  <Flame size={16} />
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Streak</span>
                </div>
                <div className="text-2xl font-black text-white">{selectedHabit.streak}</div>
              </Card>
              <Card className="p-4 flex flex-col justify-between border-yellow-500/20">
                <div className="flex items-center gap-2 text-yellow-500 mb-2">
                  <Trophy size={16} />
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Best Streak</span>
                </div>
                <div className="text-2xl font-black text-white">{detailStats.longestStreak}</div>
              </Card>
              <Card className="p-4 flex flex-col justify-between border-rose-500/20">
                <div className="flex items-center gap-2 text-rose-500 mb-2">
                  <Ban size={16} />
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Skipped</span>
                </div>
                <div className="text-2xl font-black text-white">{detailStats.skippedDays}</div>
              </Card>
              <Card className="p-4 flex flex-col justify-between border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                  <BarChart2 size={16} />
                  <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Total Volume</span>
                </div>
                <div className="text-2xl font-black text-white">
                  {detailStats.totalCompletion} <span className="text-[10px] text-zinc-500 font-normal">{selectedHabit.goal.unit}</span>
                </div>
              </Card>
            </div>
          )}

          {/* Consistency Maps */}
          <div className="space-y-6">
            <YearlyHeatmap habit={selectedHabit} />

            {/* Monthly Calendar View */}
            <Card className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  {viewDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMonthOffset((o) => o - 1)}
                    className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setMonthOffset(0)}
                    className="px-3 py-1 text-xs font-bold bg-white/5 border border-white/5 rounded-lg text-zinc-300 hover:text-white"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setMonthOffset((o) => o + 1)}
                    className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-y-4 gap-x-2">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono"
                  >
                    {d}
                  </div>
                ))}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
                  const dateStr = getLocalDateStr(date);
                  const val = selectedHabit.history[dateStr] || 0;
                  const isSkipped = val === -1;
                  const isToday = dateStr === getLocalDateStr();

                  let ringPercentage = 0;
                  let dotColor = 'transparent';
                  let ringColor = selectedHabit.color;

                  if (isSkipped) {
                    dotColor = '#ef4444';
                  } else if (val > 0) {
                    if (selectedHabit.type === 'elastic' && selectedHabit.elasticConfig) {
                      if (val >= selectedHabit.elasticConfig.elite.target) {
                        dotColor = '#ec4899';
                        ringPercentage = 100;
                      } else if (val >= selectedHabit.elasticConfig.plus.target) {
                        dotColor = '#a855f7';
                        ringPercentage = 66;
                      } else {
                        dotColor = '#6366f1';
                        ringPercentage = 33;
                      }
                    } else {
                      ringPercentage = Math.min(100, (val / selectedHabit.goal.target) * 100);
                      if (ringPercentage >= 100) dotColor = selectedHabit.color;
                    }
                  }

                  return (
                    <div key={dateStr} className="flex flex-col items-center justify-center gap-1">
                      <button
                        onClick={(e) => handleOpenPopup(e, selectedHabit, dateStr)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative border
                          ${isToday ? 'border-violet-500' : 'border-transparent'}
                        `}
                      >
                        {isSkipped ? (
                          <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                            <X size={12} className="text-rose-400" />
                          </div>
                        ) : ringPercentage > 0 && ringPercentage < 100 ? (
                          <ProgressRing percentage={ringPercentage} color={ringColor} size={32} strokeWidth={3}>
                            <span className="text-[10px] font-bold text-white leading-none">{i + 1}</span>
                          </ProgressRing>
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                              ${
                                ringPercentage >= 100
                                  ? 'text-white'
                                  : 'text-zinc-400 hover:text-white bg-white/5'
                              }
                            `}
                            style={{ backgroundColor: ringPercentage >= 100 ? dotColor : undefined }}
                          >
                            {ringPercentage >= 100 ? <Check size={12} strokeWidth={3} /> : i + 1}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        // DASHBOARD / LIST VIEW
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                Habits
              </h2>
              {showArchived && (
                <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-2 border border-orange-500/20 inline-block font-mono">
                  Archived View
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`p-2.5 rounded-xl border transition-all ${
                  showArchived
                    ? 'bg-amber-500/15 border-amber-500/20 text-amber-400'
                    : 'border-white/5 text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
                title={showArchived ? 'View Active' : 'View Archive'}
              >
                <Archive size={20} />
              </button>
              <Button
                onClick={() => setIsModalOpen(true)}
                variant="primary"
                className="flex items-center gap-2 active:scale-95"
              >
                <Plus size={18} />
                <span>New Habit</span>
              </Button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedHabits.map((habit) => {
              const days = [];
              for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                days.push(d);
              }

              const isDurationHabit =
                habit.goal.type === 'duration' ||
                (habit.type === 'elastic' &&
                  (habit.elasticConfig?.unit.toLowerCase().includes('min') ||
                    habit.elasticConfig?.unit.toLowerCase().includes('hour')));

              return (
                <div
                  key={habit.id}
                  draggable={!showArchived}
                  onDragStart={(e) => handleDragStart(e, habit.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, habit.id)}
                  onClick={() => setViewingHabitId(habit.id)}
                  className={`bg-[#12121a] border rounded-2xl p-6 hover:shadow-2xl hover:border-violet-500/30 transition-all duration-300 group cursor-pointer relative flex flex-col justify-between h-[300px]
                    ${habit.isPinned ? 'border-violet-500/50 shadow-lg shadow-violet-500/5' : 'border-white/5'}
                  `}
                >
                  <div className="space-y-4">
                    {/* Top row */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-black/20"
                          style={{ backgroundColor: habit.color }}
                        >
                          {habit.goal.type === 'duration' ? (
                            <Clock size={22} />
                          ) : habit.goal.unit.toLowerCase().includes('water') ||
                            habit.goal.unit.toLowerCase().includes('ml') ? (
                            <Droplets size={22} />
                          ) : (
                            <CheckSquare size={22} />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-white truncate max-w-[140px] text-base leading-tight group-hover:text-violet-300 transition-colors">
                            {habit.title}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] font-bold uppercase tracking-wider">
                            {habit.streak > 0 && (
                              <span className="flex items-center gap-0.5 text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-md">
                                <Flame size={10} fill="currentColor" /> {habit.streak}
                              </span>
                            )}
                            {habit.frequency.type === 'weekly' && (
                              <span className="text-zinc-500 bg-white/5 border border-white/5 px-1.5 py-0.5 rounded-md">
                                {habit.frequency.timesPerWeek}x/wk
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleTogglePin(e, habit)}
                          className={`p-1.5 rounded-lg transition-all ${
                            habit.isPinned
                              ? 'text-white bg-white/10'
                              : 'text-zinc-500 hover:text-white hover:bg-white/5'
                          }`}
                          title={habit.isPinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin size={12} fill={habit.isPinned ? 'currentColor' : 'none'} />
                        </button>
                        {isDurationHabit && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onStartFocus(habit);
                            }}
                            className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            title="Start Timer"
                          >
                            <Play size={12} fill="currentColor" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleEditHabit(e, habit)}
                          className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Target detail */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 pl-1">
                      <Target size={12} className="text-violet-400" />
                      <span className="truncate">
                        {habit.type === 'simple'
                          ? `Goal: ${habit.goal.target} ${habit.goal.unit}`
                          : `Elastic: ${habit.elasticConfig?.mini.target}/${habit.elasticConfig?.plus.target}/${habit.elasticConfig?.elite.target} ${habit.elasticConfig?.unit}`}
                      </span>
                    </div>

                    {habit.description && (
                      <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                        {habit.description}
                      </p>
                    )}
                  </div>

                  {/* 7 Days Row */}
                  <div className="mt-auto border-t border-white/5 pt-4">
                    <div className="flex justify-between items-center">
                      {days.map((date, idx) => {
                        const dateStr = getLocalDateStr(date);
                        const val = habit.history[dateStr] || 0;
                        const isSkipped = val === -1;
                        let checkmarkNode = null;
                        let ringPercentage = 0;
                        let dotColor = 'rgba(255, 255, 255, 0.03)';

                        if (habit.type === 'elastic' && habit.elasticConfig) {
                          if (isSkipped) {
                            checkmarkNode = <X size={12} className="text-red-400" />;
                            dotColor = 'rgba(239,68,68,0.15)';
                          } else if (val > 0) {
                            checkmarkNode = <Check size={12} className="text-white" strokeWidth={3} />;
                            if (val >= habit.elasticConfig.elite.target) dotColor = '#ec4899';
                            else if (val >= habit.elasticConfig.plus.target) dotColor = '#a855f7';
                            else dotColor = '#6366f1';
                          }
                        } else {
                          const target = habit.goal.target;
                          const pct = Math.min(100, (val / target) * 100);
                          if (isSkipped) {
                            checkmarkNode = <X size={12} className="text-red-400" />;
                            dotColor = 'rgba(239,68,68,0.15)';
                          } else if (val > 0) {
                            if (pct >= 100) {
                              checkmarkNode = <Check size={12} className="text-white" strokeWidth={3} />;
                              dotColor = habit.color;
                            } else {
                              ringPercentage = pct;
                            }
                          }
                        }

                        const isToday = idx === 6;

                        return (
                          <div key={dateStr} className="flex flex-col items-center gap-1.5 relative">
                            <button
                              onClick={(e) => handleOpenPopup(e, habit, dateStr)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 relative border
                                ${isToday ? 'border-violet-500' : 'border-transparent'}
                              `}
                              style={{ backgroundColor: ringPercentage > 0 ? 'transparent' : dotColor }}
                            >
                              {ringPercentage > 0 ? (
                                <ProgressRing percentage={ringPercentage} color={habit.color} size={28} strokeWidth={3.5}>
                                  <span className="text-[8px] font-bold text-zinc-500 leading-none">
                                    {val}
                                  </span>
                                </ProgressRing>
                              ) : (
                                checkmarkNode
                              )}
                            </button>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider font-mono ${
                                isToday ? 'text-violet-400' : 'text-zinc-600'
                              }`}
                            >
                              {date.toLocaleDateString('en-US', { weekday: 'narrow' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            {sortedHabits.length === 0 && (
              <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-3xl bg-[#12121a]/10">
                <p className="text-zinc-500 text-sm">No habits in this view.</p>
                {!showArchived && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 text-violet-400 font-bold hover:underline text-xs uppercase tracking-wider font-mono"
                  >
                    Create your first habit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Habit Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingHabit ? 'Edit Habit' : 'New Habit'}
        className="max-w-xl"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5 font-mono">
                Habit Title
              </label>
              <input
                className="w-full bg-[#12121a] border border-white/5 rounded-xl px-4 py-2.5 text-white placeholder-zinc-700 focus:border-violet-500/50 outline-none transition-all text-sm font-semibold"
                value={editingHabit ? editingHabit.title : undefined}
                defaultValue={editingHabit ? undefined : ''}
                placeholder="e.g. Meditate, Water, Read..."
                id="habit-title-input"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5 font-mono">
                Motivation / Description
              </label>
              <input
                className="w-full bg-[#12121a] border border-white/5 rounded-xl px-4 py-2.5 text-white placeholder-zinc-700 focus:border-violet-500/50 outline-none transition-all text-sm font-semibold"
                id="habit-desc-input"
                placeholder="Why is this habit important?"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2 font-mono">
                Theme Color
              </label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => {
                  const isSelected = editingHabit ? editingHabit.color === c : c === COLORS[0];
                  return (
                    <button
                      key={c}
                      onClick={() => {
                        if (editingHabit) onUpdateHabit({ ...editingHabit, color: c });
                      }}
                      className={`w-7 h-7 rounded-full transition-transform hover:scale-110 relative ${
                        isSelected ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-[#0a0a0f]' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-2">
            <Button onClick={handleCloseModal} variant="ghost">
              Cancel
            </Button>
            <Button
              onClick={() => {
                const titleInput = document.getElementById('habit-title-input') as HTMLInputElement;
                const descInput = document.getElementById('habit-desc-input') as HTMLInputElement;
                const title = titleInput?.value || '';
                const description = descInput?.value || '';

                if (!title) return;

                if (editingHabit) {
                  onUpdateHabit({
                    ...editingHabit,
                    title,
                    description,
                  });
                } else {
                  const newHabit: Habit = {
                    id: Date.now().toString(),
                    title,
                    description,
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    type: 'simple',
                    frequency: { type: 'daily' },
                    goal: { type: 'check', target: 1, unit: 'checks' },
                    history: {},
                    streak: 0,
                    createdAt: Date.now(),
                    reminders: [],
                  };
                  onAddHabit(newHabit);
                }
                handleCloseModal();
              }}
              variant="primary"
            >
              Save Habit
            </Button>
          </div>
        </div>
      </Modal>

      {/* Progress checkin modal popup */}
      {popupData && (
        <HabitInteractionModal
          habit={habits.find((h) => h.id === popupData.habitId)!}
          date={popupData.date}
          onClose={closePopup}
          onSave={handlePopupSave}
        />
      )}
    </div>
  );
};

const HabitInteractionModal: React.FC<{
  habit: Habit;
  date: string;
  onClose: () => void;
  onSave: (val: number) => void;
}> = ({ habit, date, onClose, onSave }) => {
  const currentVal = habit.history[date] || 0;
  const [val, setVal] = React.useState<number>(currentVal === -1 ? 0 : currentVal);
  const [isSkipped, setIsSkipped] = React.useState(currentVal === -1);
  const step = habit.customStep || (habit.type === 'simple' ? getSmartStep(habit.goal.target) : 1);

  const displayDate = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleSave = () => {
    if (isSkipped) onSave(-1);
    else onSave(val);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-white text-lg">{habit.title}</h3>
            <p className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider">{displayDate}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-center py-6 gap-4">
          <button
            onClick={() => {
              setIsSkipped(false);
              setVal(Math.max(0, val - step));
            }}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 text-white font-bold text-xl disabled:opacity-50"
            disabled={isSkipped || val <= 0}
          >
            <Minus size={20} />
          </button>

          <div className="text-center w-24">
            {isSkipped ? (
              <span className="text-rose-400 font-bold text-base uppercase tracking-widest font-mono">
                Skipped
              </span>
            ) : (
              <>
                <div className="text-4xl font-extrabold text-white">{val}</div>
                <div className="text-[10px] text-zinc-500 font-bold font-mono uppercase tracking-wider mt-1">
                  {habit.type === 'elastic' ? habit.elasticConfig?.unit : habit.goal.unit}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => {
              setIsSkipped(false);
              setVal(val + step);
            }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl hover:scale-105 transition-transform"
            style={{ backgroundColor: habit.color }}
          >
            <Plus size={22} />
          </button>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
          <button
            onClick={() => setIsSkipped(!isSkipped)}
            className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 uppercase tracking-wider font-mono
              ${
                isSkipped
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                  : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {isSkipped ? <RefreshCcw size={14} /> : <X size={14} />}
            {isSkipped ? 'Unmark Skipped' : 'Skip Habit'}
          </button>
          <Button onClick={handleSave} variant="primary" className="w-full py-3 shadow-lg">
            Save Progress
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HabitModule;
