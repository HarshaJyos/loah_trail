'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { RoutineStep } from '../../types';
import {
  Pause,
  Play,
  X,
  Check,
  Clock,
  GripVertical,
  PauseCircle,
  CheckCircle2,
  Minimize2,
  SkipForward,
  Plus,
  Minus,
  ChevronDown,
  Trash2,
  List,
  Layers,
  PlusCircle,
} from 'lucide-react';
import { playSound } from '../../utils/sounds';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export const RoutinePlayer: React.FC = () => {
  const router = useRouter();

  // Zustand Store Selectors
  const activeRoutine = useAppStore((state) => state.activeRoutine);
  const steps = useAppStore((state) => state.playerSteps);
  const currentStepIndex = useAppStore((state) => state.currentStepIndex);
  const timeElapsedInStep = useAppStore((state) => state.timeElapsedInStep);
  const isPlaying = useAppStore((state) => state.isPlaying);
  const tasks = useAppStore((state) => state.tasks);
  const habits = useAppStore((state) => state.habits);

  const setPlayerState = useAppStore((state) => state.setPlayerState);
  const handleStepComplete = useAppStore((state) => state.handleStepComplete);
  const exitPlayer = useAppStore((state) => state.exitPlayer);
  const savePausedRoutine = useAppStore((state) => state.savePausedRoutine);
  const handleTimeAdjustment = useAppStore((state) => state.handleTimeAdjustment);
  const handleRemoveStep = useAppStore((state) => state.handleRemoveStep);

  const currentStep = steps[currentStepIndex] || {
    title: 'Finished',
    durationSeconds: 0,
  };
  const stepDuration = currentStep.durationSeconds;
  const timeLeft = stepDuration - timeElapsedInStep;
  const isOvertime = timeLeft < 0;

  const progress =
    stepDuration > 0
      ? Math.min(100, (timeElapsedInStep / stepDuration) * 100)
      : 100;

  const [isMobileSequenceOpen, setIsMobileSequenceOpen] = React.useState(false);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);
  const [isRemoveZoneActive, setIsRemoveZoneActive] = React.useState(false);

  // Estimated completion time
  const [estimatedCompletionTime, setEstimatedCompletionTime] =
    React.useState('');

  React.useEffect(() => {
    if (!activeRoutine) {
      router.push('/dashboard');
      return;
    }
  }, [activeRoutine, router]);

  React.useEffect(() => {
    if (!activeRoutine) return;
    const calculateEstimation = () => {
      const now = Date.now();
      let totalRemainingSeconds = Math.max(0, timeLeft);

      for (let i = currentStepIndex + 1; i < steps.length; i++) {
        totalRemainingSeconds += steps[i].durationSeconds;
      }

      const completionDate = new Date(now + totalRemainingSeconds * 1000);
      setEstimatedCompletionTime(
        completionDate.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        })
      );
    };

    calculateEstimation();
    const interval = setInterval(calculateEstimation, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, currentStepIndex, steps, activeRoutine]);

  // Sound triggers
  React.useEffect(() => {
    if (activeRoutine && currentStepIndex === 0 && timeElapsedInStep === 0 && isPlaying) {
      playSound('TIMER_START');
    }
  }, [currentStepIndex, timeElapsedInStep, isPlaying, activeRoutine]);

  React.useEffect(() => {
    if (isPlaying && activeRoutine) {
      if (timeLeft === 0) {
        playSound('TIMER_END');
      } else if (timeLeft < 0 && Math.abs(timeLeft) % 30 === 0 && timeLeft !== 0) {
        playSound('OVERTIME_TICK');
      }
    }
  }, [timeLeft, isPlaying, activeRoutine]);

  if (!activeRoutine) return null;

  const handleStepCompleteInternal = () => {
    if (currentStepIndex >= steps.length - 1) {
      playSound('ROUTINE_COMPLETE');
    } else {
      playSound('TIMER_START');
    }
    handleStepComplete();
  };

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    return `${seconds < 0 ? '-' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDragStart = (
    e: React.DragEvent,
    index: number,
    origin: 'list' | 'library',
    id?: string,
    type?: string
  ) => {
    e.dataTransfer.setData('origin', origin);
    if (origin === 'list') {
      e.dataTransfer.setData('stepIndex', index.toString());
    } else if (id && type) {
      e.dataTransfer.setData('id', id);
      e.dataTransfer.setData('type', type);
    }
    e.dataTransfer.effectAllowed = origin === 'list' ? 'move' : 'copy';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleRemoveZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsRemoveZoneActive(true);
  };

  const handleRemoveZoneDragLeave = () => {
    setIsRemoveZoneActive(false);
  };

  const handleRemoveDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsRemoveZoneActive(false);
    const origin = e.dataTransfer.getData('origin');

    if (origin === 'list') {
      const stepIndex = parseInt(e.dataTransfer.getData('stepIndex'), 10);
      if (!isNaN(stepIndex)) {
        handleRemoveStep(stepIndex);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const origin = e.dataTransfer.getData('origin');
    const newSteps = [...steps];

    if (origin === 'list') {
      const dragIndex = parseInt(e.dataTransfer.getData('stepIndex'), 10);
      if (dragIndex === dropIndex) return;

      const [removed] = newSteps.splice(dragIndex, 1);
      newSteps.splice(dropIndex, 0, removed);
      setPlayerState({ playerSteps: newSteps });
    } else if (origin === 'library') {
      const id = e.dataTransfer.getData('id');
      const type = e.dataTransfer.getData('type');
      let newStep: RoutineStep | null = null;

      if (type === 'task') {
        const task = tasks.find((t) => t.id === id);
        if (task) {
          newStep = {
            id: `${Date.now()}-${Math.random()}`,
            title: task.title,
            durationSeconds: (task.duration || 30) * 60,
            linkedTaskId: task.id,
          };
        }
      } else if (type === 'habit') {
        const habit = habits.find((h) => h.id === id);
        if (habit) {
          newStep = {
            id: `${Date.now()}-${Math.random()}`,
            title: habit.title,
            durationSeconds:
              habit.goal.type === 'duration' ? habit.goal.target * 60 : 300,
            linkedHabitId: habit.id,
          };
        }
      }

      if (newStep) {
        if (dropIndex >= newSteps.length) newSteps.push(newStep);
        else newSteps.splice(dropIndex + 1, 0, newStep);
        setPlayerState({ playerSteps: newSteps });
      }
    }
  };

  const handlePlayClick = () => {
    playSound('TIMER_START');
    setPlayerState({ isPlaying: !isPlaying });
  };

  const handleMinimizeInternal = () => {
    setPlayerState({ isMinimized: true });
    router.push('/routines');
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] text-white z-[100] flex flex-col font-sans h-full w-full overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 shrink-0 bg-[#12121a] z-20">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-xs font-bold tracking-widest uppercase text-zinc-400 hidden md:block">
            Focus Session
          </span>
          <span className="text-sm font-bold tracking-tight text-white md:hidden truncate max-w-[120px]">
            {currentStep.title}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMinimizeInternal}
            className="flex items-center gap-2 text-zinc-400 hover:text-white px-3 py-1.5 hover:bg-white/5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
            title="Minimize"
          >
            <Minimize2 size={16} /> <span className="hidden md:inline">Minimize</span>
          </button>
          <div className="w-px h-6 bg-white/5 mx-1 self-center hidden md:block" />
          <button
            onClick={savePausedRoutine}
            className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 px-3 py-1.5 hover:bg-white/5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
            title="Save & Quit"
          >
            <PauseCircle size={16} /> <span className="hidden md:inline">Save & Quit</span>
          </button>
          <button
            onClick={exitPlayer}
            className="flex items-center gap-2 text-zinc-400 hover:text-rose-400 px-3 py-1.5 hover:bg-white/5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider"
            title="Cancel"
          >
            <X size={16} /> <span className="hidden md:inline">Cancel</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL: Library & Trash */}
        <div className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-[#12121a]/50">
          <div className="p-4 border-b border-white/5">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 font-mono">
              Trash Bin / Removal Zone
            </h3>
            <div
              className={`border border-dashed rounded-2xl p-4 text-center transition-all ${
                isRemoveZoneActive
                  ? 'border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                  : 'border-white/10 text-zinc-600 hover:border-white/20'
              }`}
              onDragOver={handleRemoveZoneDragOver}
              onDragLeave={handleRemoveZoneDragLeave}
              onDrop={handleRemoveDrop}
            >
              <Trash2 size={24} className="mx-auto mb-2 text-zinc-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider block">
                Drag steps here to remove
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
            <div>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-3 font-mono tracking-wider">
                Unscheduled Tasks
              </h4>
              <div className="space-y-2">
                {tasks
                  .filter((t) => !t.isCompleted && !t.deletedAt)
                  .map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, -1, 'library', task.id, 'task')
                      }
                      className="bg-[#12121a] border border-white/5 p-3 rounded-xl text-xs text-zinc-300 hover:bg-[#1a1a26] hover:border-violet-500/20 cursor-grab active:cursor-grabbing transition-all flex flex-col gap-1"
                    >
                      <div className="truncate font-bold text-white">{task.title}</div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                        <Clock size={12} /> {task.duration || 30}m
                      </div>
                    </div>
                  ))}
                {tasks.filter((t) => !t.isCompleted && !t.deletedAt).length === 0 && (
                  <div className="text-center py-6 text-zinc-600 text-xs italic">
                    No active tasks
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-3 font-mono tracking-wider">
                Habits Library
              </h4>
              <div className="space-y-2">
                {habits
                  .filter((h) => !h.deletedAt)
                  .map((habit) => (
                    <div
                      key={habit.id}
                      draggable
                      onDragStart={(e) =>
                        handleDragStart(e, -1, 'library', habit.id, 'habit')
                      }
                      className="bg-[#12121a] border border-white/5 p-3 rounded-xl text-xs text-zinc-300 hover:bg-[#1a1a26] hover:border-violet-500/20 cursor-grab active:cursor-grabbing transition-all flex items-center gap-2.5"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: habit.color }}
                      />
                      <div className="truncate font-bold text-white flex-1">{habit.title}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Focus Area */}
        <div className="flex-1 flex flex-col relative bg-[#0a0a0f] overflow-y-auto no-scrollbar">
          <div className="lg:hidden absolute top-4 right-4 z-20">
            <button
              onClick={() => setIsMobileSequenceOpen(true)}
              className="flex items-center gap-2 bg-[#12121a] border border-white/15 px-4 py-2 rounded-full text-xs font-bold text-zinc-300 shadow-lg active:scale-95 transition-all"
            >
              <List size={14} /> Up Next
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[600px] lg:min-h-0 w-full max-w-md mx-auto">
            <div className="text-center mb-8 shrink-0 w-full">
              <h3 className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-3 font-mono">
                {activeRoutine.title}
              </h3>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
                {currentStep.title}
              </h1>
            </div>

            {/* Circular SVG Timer */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 group mb-10 shrink-0 select-none">
              <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(0,0,0,0.4)]">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="rgba(255, 255, 255, 0.02)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke={isOvertime ? '#f43f5e' : '#8b5cf6'}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 140}
                  pathLength={100}
                  strokeDashoffset={100 - progress}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                  style={{ strokeDasharray: '289%' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span
                  className={`text-6xl md:text-7xl lg:text-8xl font-mono font-bold tracking-tighter tabular-nums ${
                    isOvertime ? 'text-rose-500 animate-pulse' : 'text-white'
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
                {isOvertime && (
                  <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest mt-2 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-mono">
                    Overtime
                  </span>
                )}
              </div>
            </div>

            {/* Control Panel */}
            <div className="flex items-center gap-6 mb-8 shrink-0">
              <button
                onClick={handlePlayClick}
                className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white bg-white/5 hover:bg-white/10 transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                {isPlaying ? (
                  <Pause size={22} fill="currentColor" />
                ) : (
                  <Play size={22} fill="currentColor" className="ml-1" />
                )}
              </button>

              <button
                onClick={handleStepCompleteInternal}
                className="h-16 px-12 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white rounded-full font-bold text-lg flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(124,58,237,0.3)] border border-white/10"
              >
                <Check size={24} strokeWidth={3} />
                Done
              </button>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleTimeAdjustment(-60)}
                  className="w-10 h-10 rounded-full bg-white/5 text-zinc-400 hover:text-white border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  title="Add 1 Minute"
                >
                  <Plus size={16} />
                </button>
                <button
                  onClick={() => handleTimeAdjustment(60)}
                  className="w-10 h-10 rounded-full bg-white/5 text-zinc-400 hover:text-white border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  title="Subtract 1 Minute"
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1 text-zinc-500 shrink-0 font-mono">
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                Estimated Completion
              </span>
              <span className="text-lg font-bold text-zinc-300">
                {estimatedCompletionTime}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Sequence */}
        <div className="hidden lg:flex flex-col w-80 border-l border-white/5 bg-[#12121a]/30">
          <div className="p-4 border-b border-white/5 bg-[#12121a]/50">
            <div className="flex items-center gap-2 justify-center py-1">
              <Layers size={14} className="text-zinc-400" />
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest font-mono">
                Sequence list
              </h3>
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, steps.length)}
          >
            {steps.map((step, idx) => {
              const isActive = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;

              if (isActive) {
                return (
                  <div key={step.id} className="relative">
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-violet-500 rounded-r-full shadow-[0_0_8px_#8b5cf6]" />
                    <div className="bg-[#1a1a26] border border-violet-500/30 p-4 rounded-2xl shadow-lg relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-violet-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                          Now Running
                        </span>
                        <div className="text-violet-400 animate-pulse">
                          <Clock size={14} />
                        </div>
                      </div>
                      <h4 className="font-bold text-white text-base leading-tight mb-1">
                        {step.title}
                      </h4>
                      <div className="text-[10px] font-mono text-zinc-400">
                        {Math.round(step.durationSeconds / 60)} min
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={step.id}
                  draggable={!isPast}
                  onDragStart={(e) => handleDragStart(e, idx, 'list')}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  className={`p-4 rounded-2xl border transition-all flex items-center gap-3 group relative
                    ${
                      isPast
                        ? 'bg-transparent border-white/5 text-zinc-600'
                        : 'bg-[#12121a] border-white/5 text-zinc-400 hover:border-violet-500/25 hover:bg-[#1a1a26]'
                    }
                    ${
                      dragOverIndex === idx ? 'border-t-2 border-t-violet-500 mt-2' : ''
                    }
                  `}
                >
                  {!isPast && (
                    <div className="text-zinc-600 group-hover:text-zinc-400 cursor-grab active:cursor-grabbing shrink-0">
                      <GripVertical size={16} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-bold truncate text-sm ${
                        isPast ? 'line-through decoration-zinc-700' : 'text-zinc-300'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-[10px] font-mono opacity-50">
                      {Math.round(step.durationSeconds / 60)} min
                    </div>
                  </div>
                  {isPast && <CheckCircle2 size={18} className="text-zinc-700 shrink-0" />}
                </div>
              );
            })}

            <div className="border-2 border-dashed border-white/5 rounded-2xl p-4 text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-4 font-mono">
              <PlusCircle className="mx-auto mb-2 opacity-30" size={20} />
              Drag here to append
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div
        className={`lg:hidden fixed inset-x-0 bottom-0 bg-[#12121a] border-t border-white/5 rounded-t-3xl transition-transform duration-300 z-50 flex flex-col max-h-[80vh] ${
          isMobileSequenceOpen ? 'translate-y-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]' : 'translate-y-full'
        }`}
      >
        <div
          className="p-4 border-b border-white/5 flex justify-between items-center cursor-pointer"
          onClick={() => setIsMobileSequenceOpen(false)}
        >
          <h3 className="font-bold text-white ml-2">Up Next</h3>
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400">
            <ChevronDown size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar pb-12">
          {steps.map((step, idx) => {
            if (idx <= currentStepIndex) return null;
            return (
              <div
                key={step.id}
                className="bg-[#1a1a26] p-4 rounded-2xl border border-white/5 flex justify-between items-center"
              >
                <div className="font-bold text-zinc-200 text-sm">{step.title}</div>
                <div className="text-xs font-mono text-zinc-500">
                  {Math.round(step.durationSeconds / 60)}m
                </div>
              </div>
            );
          })}
          {steps.length <= currentStepIndex + 1 && (
            <div className="text-center text-zinc-500 py-8 italic text-xs">
              No more steps in sequence
            </div>
          )}
        </div>
      </div>

      {isMobileSequenceOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileSequenceOpen(false)}
        />
      )}
    </div>
  );
};

export default RoutinePlayer;
