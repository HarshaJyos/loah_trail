'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Routine, RoutineStep, Task, Habit, PausedRoutine, Reminder } from '../../types';
import {
  Play,
  Plus,
  Trash2,
  X,
  ListPlus,
  Repeat,
  CalendarClock,
  ChevronUp,
  ChevronDown,
  Edit2,
  Clock,
  Zap,
  Archive,
  RefreshCcw,
  CheckCircle,
  PauseCircle,
  Timer,
  Bell,
  Pin,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

import { useRouter } from 'next/navigation';

export const RoutineModule: React.FC = () => {
  const router = useRouter();
  const routines = useAppStore((state) => state.routines);
  const habits = useAppStore((state) => state.habits);
  const pausedRoutines = useAppStore((state) => state.pausedRoutines);
  const tasks = useAppStore((state) => state.tasks);

  const onAddRoutine = useAppStore((state) => state.handleAddRoutine);
  const onUpdateRoutine = useAppStore((state) => state.handleUpdateRoutine);
  const onDeleteRoutine = useAppStore((state) => state.handleDeleteRoutine);
  const onStartRoutine = useAppStore((state) => state.startRoutine);
  const onResumeRoutine = useAppStore((state) => state.resumePausedRoutine);
  const onDiscardPaused = useAppStore((state) => state.discardPausedRoutine);
  const onArchiveRoutine = (id: string) => useAppStore.getState().handleArchive(id, 'routine');
  const onUnarchiveRoutine = (id: string) => useAppStore.getState().handleUnarchive(id, 'routine');
  const onReorder = useAppStore((state) => state.handleReorderRoutines);

  // Legacy modal states kept to avoid breakages but unused now
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [newRoutineTitle, setNewRoutineTitle] = React.useState('');
  const [newSteps, setNewSteps] = React.useState<RoutineStep[]>([]);
  const [routineType, setRoutineType] = React.useState<'once' | 'repeatable'>('repeatable');

  const [stepTitle, setStepTitle] = React.useState('');
  const [stepMins, setStepMins] = React.useState('5');
  const [linkedHabitId, setLinkedHabitId] = React.useState('');

  const [showArchived, setShowArchived] = React.useState(false);

  // Reminders
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [newReminderOffset, setNewReminderOffset] = React.useState(15);

  const [draggedRoutineId, setDraggedRoutineId] = React.useState<string | null>(null);

  const activeRoutines = React.useMemo(() => routines.filter((r) => !r.deletedAt && !r.archivedAt), [routines]);
  const archivedRoutines = React.useMemo(() => routines.filter((r) => !r.deletedAt && r.archivedAt), [routines]);

  const currentViewRoutines = showArchived ? archivedRoutines : activeRoutines;

  // Sort pinned first
  const sortedRoutines = React.useMemo(() => {
    return [...currentViewRoutines].sort(
      (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)
    );
  }, [currentViewRoutines]);

  const openEditor = (routine?: Routine) => {
    if (routine) {
      router.push(`/routines/edit?id=${routine.id}` as any);
    } else {
      router.push(`/routines/new` as any);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addStep = () => {
    if (!stepTitle) return;
    const step: RoutineStep = {
      id: Date.now().toString(),
      title: stepTitle,
      durationSeconds: (parseInt(stepMins) * 60) || 300,
      linkedHabitId: linkedHabitId || undefined,
    };
    setNewSteps([...newSteps, step]);
    setStepTitle('');
    setStepMins('5');
    setLinkedHabitId('');
  };

  const addStepFromTask = (task: Task) => {
    const durationSecs = (task.duration || 5) * 60;
    const step: RoutineStep = {
      id: Date.now().toString(),
      title: task.title,
      durationSeconds: durationSecs,
      linkedTaskId: task.id,
    };
    setNewSteps([...newSteps, step]);
  };

  const handleHabitSelect = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      setStepTitle(habit.title);
      setLinkedHabitId(habit.id);
      if (habit.type === 'elastic' && habit.elasticConfig) {
        setStepMins(habit.elasticConfig.elite.target.toString());
      } else if (habit.goal.type === 'duration') {
        setStepMins(habit.goal.target.toString());
      }
    } else {
      setLinkedHabitId('');
    }
  };

  const removeStep = (id: string) => {
    setNewSteps(newSteps.filter((s) => s.id !== id));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const updated = [...newSteps];
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
      setNewSteps(updated);
    } else if (direction === 'down' && index < newSteps.length - 1) {
      const updated = [...newSteps];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      setNewSteps(updated);
    }
  };

  const addReminder = () => {
    const newRem: Reminder = {
      id: Date.now().toString(),
      timeOffset: newReminderOffset,
      type: 'notification',
    };
    setReminders([...reminders, newRem]);
  };

  const removeReminder = (id: string) => setReminders(reminders.filter((r) => r.id !== id));

  const saveRoutine = () => {
    if (!newRoutineTitle || newSteps.length === 0) return;
    const routineData = {
      title: newRoutineTitle,
      steps: newSteps,
      type: routineType,
      reminders,
    };

    if (editingId) {
      const existing = routines.find((r) => r.id === editingId);
      if (existing) onUpdateRoutine({ ...existing, ...routineData });
    } else {
      const routine: Routine = {
        id: Date.now().toString(),
        color: 'bg-[#7c3aed]', // Default color
        startTime: routineType === 'once' ? Date.now() : undefined,
        ...routineData,
        steps: newSteps,
      };
      onAddRoutine(routine);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setNewRoutineTitle('');
    setNewSteps([]);
    setRoutineType('repeatable');
    setReminders([]);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onDeleteRoutine(id);
  };

  const handleEdit = (e: React.MouseEvent, routine: Routine) => {
    e.preventDefault();
    e.stopPropagation();
    openEditor(routine);
  };

  const handleArchive = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onArchiveRoutine(id);
  };

  const handleUnarchive = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    onUnarchiveRoutine(id);
  };

  const handleTogglePin = (e: React.MouseEvent, routine: Routine) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdateRoutine({ ...routine, isPinned: !routine.isPinned });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedRoutineId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedRoutineId || draggedRoutineId === targetId || !onReorder) return;

    const allRoutines = [...routines];
    const fromIndex = allRoutines.findIndex((r) => r.id === draggedRoutineId);
    const toIndex = allRoutines.findIndex((r) => r.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [moved] = allRoutines.splice(fromIndex, 1);
      allRoutines.splice(toIndex, 0, moved);
      onReorder(allRoutines);
    }
    setDraggedRoutineId(null);
  };

  const pendingTasks = React.useMemo(() => tasks.filter((t) => !t.isCompleted && !t.deletedAt), [tasks]);
  const unscheduledTasks = React.useMemo(() => pendingTasks.filter((t) => !t.startTime), [pendingTasks]);

  const visibleRoutines = React.useMemo(() => {
    return sortedRoutines.filter((r) => {
      if (r.type === 'repeatable') return true;
      return !r.completedAt;
    });
  }, [sortedRoutines]);

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto no-scrollbar pb-32 max-w-7xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200/60 pb-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              Routines
            </h2>
            {showArchived && (
              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider mt-2 inline-block border border-orange-500/20">
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
                  : 'border-slate-200/60 text-slate-400 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
              title={showArchived ? 'View Active' : 'View Archive'}
            >
              <Archive size={20} />
            </button>
            <Button
              onClick={() => openEditor()}
              variant="primary"
              className="flex items-center gap-2 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden md:inline">New Flow</span>
            </Button>
          </div>
        </div>

        {/* Paused Routines Section */}
        {pausedRoutines.length > 0 && !showArchived && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-[10px] tracking-widest px-1 font-mono">
              <PauseCircle size={14} /> Paused In Progress
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pausedRoutines.map((paused) => {
                const progress = Math.round(
                  (paused.currentStepIndex / paused.routine.steps.length) * 100
                );
                return (
                  <div
                    key={paused.id}
                    className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between group shadow-lg"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Timer size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate text-sm">
                          {paused.routine.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>
                            Step {paused.currentStepIndex + 1}/
                            {paused.routine.steps.length}
                          </span>
                          <span>•</span>
                          <span>{progress}% Complete</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <Button
                        size="sm"
                        variant="glass"
                        onClick={() => onResumeRoutine(paused)}
                        className="text-xs text-amber-400"
                      >
                        Resume
                      </Button>
                      <button
                        onClick={() => onDiscardPaused(paused.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Discard"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Routines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleRoutines.map((routine) => {
            const totalTime = Math.ceil(
              routine.steps.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
            );
            const scheduledTime = routine.startTime ? new Date(routine.startTime) : null;

            return (
              <div
                key={routine.id}
                draggable={!showArchived}
                onDragStart={(e) => handleDragStart(e, routine.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, routine.id)}
                onClick={() => onStartRoutine(routine.id)}
                className={`bg-white border rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group relative flex flex-col cursor-pointer h-[320px]
                  ${
                    routine.isPinned
                      ? 'border-violet-500/50 shadow-lg shadow-violet-500/5'
                      : 'border-slate-200/60 hover:border-violet-500/25'
                  }
                `}
              >
                <div className="p-6 flex flex-col h-full relative z-10">
                  {/* Card top icons */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-xl bg-slate-100/50 border border-slate-200/60 text-violet-400">
                      {routine.type === 'repeatable' ? (
                        <Zap size={20} fill="currentColor" className="opacity-25" />
                      ) : (
                        <CalendarClock size={20} />
                      )}
                    </div>

                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleTogglePin(e, routine)}
                        className={`p-2 rounded-lg transition-all ${
                          routine.isPinned
                            ? 'text-slate-900 bg-slate-100'
                            : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100/50'
                        }`}
                        title={routine.isPinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin size={14} fill={routine.isPinned ? 'currentColor' : 'none'} />
                      </button>
                      {showArchived ? (
                        <button
                          onClick={(e) => handleUnarchive(e, routine.id)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-colors"
                          title="Restore"
                        >
                          <RefreshCcw size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleArchive(e, routine.id)}
                          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleEdit(e, routine)}
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, routine.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Routine Title */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight line-clamp-2">
                      {routine.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <ListPlus size={12} /> {routine.steps.length} Steps
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {totalTime} Min
                      </span>
                      {routine.reminders && routine.reminders.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Bell size={12} /> {routine.reminders.length}
                        </span>
                      )}
                      {scheduledTime && (
                        <span className="flex items-center gap-1 text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
                          <CalendarClock size={12} />
                          {scheduledTime.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                          <span className="opacity-75 normal-case ml-0.5">
                            {scheduledTime.toLocaleTimeString([], {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Steps Preview */}
                  <div className="flex-1 space-y-3 relative overflow-hidden">
                    {routine.steps.slice(0, 3).map((step, i) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            i === 0 ? 'bg-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.8)]' : 'bg-[#22223a]'
                          }`}
                        />
                        <span className="text-xs text-slate-500 font-medium truncate flex-1 leading-normal">
                          {step.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {Math.round(step.durationSeconds / 60)}m
                        </span>
                      </div>
                    ))}
                    {routine.steps.length > 3 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#12121a] via-[#12121a]/95 to-transparent h-12 flex items-end">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-5 pb-0.5">
                          +{routine.steps.length - 3} more steps
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hover bottom panel trigger start */}
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-slate-50 border-t border-slate-200/60 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between z-20">
                    <span className="font-extrabold text-slate-900 text-sm">
                      Start Session
                    </span>
                    <div className="bg-gradient-to-r from-violet-600 to-pink-600 text-slate-900 p-2 rounded-full shadow-lg shadow-violet-500/20">
                      <Play size={14} fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Routine card trigger */}
          <button
            onClick={() => openEditor()}
            className="border border-dashed border-slate-200 hover:border-violet-500/30 bg-slate-200 hover:bg-white/40 rounded-2xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-slate-900 transition-all group h-[320px] active:scale-[0.98]"
          >
            <div className="w-16 h-16 rounded-full bg-slate-100/50 border border-slate-200/60 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg group-hover:border-violet-500/20">
              <Plus size={32} />
            </div>
            <span className="font-extrabold text-sm uppercase tracking-wider">Create New Routine</span>
          </button>
        </div>
      </div>

      {/* Routine Creation/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Routine' : 'New Routine'}
        className="max-w-2xl"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <input
              className="w-full text-2xl font-bold text-slate-900 placeholder-zinc-700 border-none p-0 focus:ring-0 focus:outline-none bg-transparent"
              placeholder="Routine Name..."
              value={newRoutineTitle}
              onChange={(e) => setNewRoutineTitle(e.target.value)}
              autoFocus
            />
            <div className="flex p-1 bg-white rounded-xl w-fit border border-slate-200/60">
              <button
                onClick={() => setRoutineType('repeatable')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  routineType === 'repeatable'
                    ? 'bg-slate-100/50 text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Repeat size={14} /> Repeatable
              </button>
              <button
                onClick={() => setRoutineType('once')}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  routineType === 'once'
                    ? 'bg-slate-100/50 text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <CalendarClock size={14} /> Run Once
              </button>
            </div>
          </div>

          {/* Reminders section */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Bell size={12} className="text-violet-400" /> Reminder Schedule
            </label>
            <div className="space-y-2">
              {reminders.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between bg-slate-100/50 p-2 rounded-lg border border-slate-200/60 text-sm"
                >
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock size={14} />
                    <span>
                      {r.timeOffset === 0
                        ? 'At start time'
                        : `${r.timeOffset} minutes before`}
                    </span>
                  </div>
                  <button
                    onClick={() => removeReminder(r.id)}
                    className="text-slate-400 hover:text-rose-400 p-1 hover:bg-slate-100/50 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <select
                  value={newReminderOffset}
                  onChange={(e) => setNewReminderOffset(parseInt(e.target.value))}
                  className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--purple)] focus:ring-1 focus:ring-violet-500/30 outline-none flex-1"
                >
                  <option value={0} className="bg-white">At start time</option>
                  <option value={5} className="bg-white">5 minutes before</option>
                  <option value={10} className="bg-white">10 minutes before</option>
                  <option value={15} className="bg-white">15 minutes before</option>
                  <option value={30} className="bg-white">30 minutes before</option>
                  <option value={60} className="bg-white">1 hour before</option>
                </select>
                <Button onClick={addReminder} variant="secondary" size="sm">
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Step Builder */}
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-slate-200/60 pb-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Steps sequence ({newSteps.length})
              </label>
              <span className="text-xs text-slate-400 font-mono">
                Total:{' '}
                {Math.ceil(
                  newSteps.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
                )}
                m
              </span>
            </div>

            {/* Input Row */}
            <div className="flex gap-2 items-center bg-white p-2 pr-3 rounded-xl border border-slate-200/60 focus-within:border-violet-500/50 transition-all">
              <div className="pl-3 py-2 flex-1">
                <input
                  className="w-full bg-transparent text-sm text-slate-900 placeholder-zinc-600 focus:outline-none"
                  placeholder="Enter step title..."
                  value={stepTitle}
                  onChange={(e) => setStepTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addStep()}
                />
              </div>
              <div className="h-6 w-px bg-slate-100/50" />

              {/* Habit linking */}
              <select
                value={linkedHabitId}
                onChange={(e) => handleHabitSelect(e.target.value)}
                className="w-24 bg-transparent text-xs text-slate-400 focus:outline-none cursor-pointer truncate"
              >
                <option value="" className="bg-white">No Habit</option>
                {habits.map((h) => (
                  <option key={h.id} value={h.id} className="bg-white">
                    {h.title}
                  </option>
                ))}
              </select>

              <div className="h-6 w-px bg-slate-100/50" />
              <input
                type="number"
                className="w-10 bg-transparent text-center font-mono text-sm text-slate-900 focus:outline-none placeholder-zinc-700"
                placeholder="5"
                value={stepMins}
                onChange={(e) => setStepMins(e.target.value)}
              />
              <span className="text-xs text-slate-400 mr-1 font-mono">m</span>
              <button
                onClick={addStep}
                disabled={!stepTitle.trim()}
                className="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-100/50 disabled:text-slate-600 text-slate-900 p-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Quick add tasks row */}
            {unscheduledTasks.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {unscheduledTasks.slice(0, 5).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => addStepFromTask(task)}
                    className="flex items-center gap-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100/50 border border-slate-200/60 px-3 py-1.5 rounded-full hover:border-violet-500/30 hover:text-slate-900 transition-colors"
                  >
                    <ListPlus size={10} /> {task.title}
                  </button>
                ))}
              </div>
            )}

            {/* Sequence lists */}
            <div className="space-y-2 mt-2">
              {newSteps.map((step, idx) => (
                <div
                  key={step.id}
                  className="group flex items-center justify-between bg-white/[0.02] p-3 rounded-xl border border-slate-200/60 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="w-6 h-6 rounded-full bg-slate-100/50 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0 font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-800 truncate">
                      {step.title}
                    </span>
                    {step.linkedHabitId && (
                      <Badge variant="emerald" size="sm">
                        <CheckCircle size={10} className="mr-1" /> Habit
                      </Badge>
                    )}
                    {step.linkedTaskId && (
                      <Badge variant="cyan" size="sm">
                        <ListPlus size={10} className="mr-1" /> Task
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-400 font-mono bg-slate-100/50 px-2 py-1 rounded-lg">
                      {Math.round(step.durationSeconds / 60)}m
                    </span>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveStep(idx, 'up')}
                          disabled={idx === 0}
                          className="text-slate-500 hover:text-slate-900 disabled:opacity-0"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          onClick={() => moveStep(idx, 'down')}
                          disabled={idx === newSteps.length - 1}
                          className="text-slate-500 hover:text-slate-900 disabled:opacity-0"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeStep(step.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {newSteps.length === 0 && (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-slate-400 text-sm">No steps added yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-5 border-t border-slate-200/60 flex justify-end gap-2">
            <Button onClick={() => setIsModalOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button onClick={saveRoutine} variant="primary">
              Save Flow
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default RoutineModule;
