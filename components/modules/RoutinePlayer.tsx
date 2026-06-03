'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { RoutineStep, Task, Habit } from '../../types';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  Library,
} from 'lucide-react';
import { playSound } from '../../utils/sounds';

// --- Sortable Step (Up Next Queue) ---
function SortableStepItem({
  step,
  index,
  isActive,
  isPast,
  onRemove,
}: {
  step: RoutineStep;
  index: number;
  isActive: boolean;
  isPast: boolean;
  onRemove?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `step-${step.id}`,
    data: { type: 'step', index, step },
    disabled: isPast,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (isActive) {
    return (
      <div ref={setNodeRef} style={style} className="relative mb-3 touch-none">
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-violet-500 rounded-r-full shadow-[0_0_8px_#8b5cf6]" />
        <div className="bg-[var(--bg-surface-elevated)] border border-violet-500/50 p-4 rounded-2xl shadow-[0_8px_30px_rgba(139,92,246,0.15)] relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <span className="bg-violet-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
              Now Playing
            </span>
            <div className="text-violet-400 animate-pulse">
              <Clock size={14} />
            </div>
          </div>
          <h4 className="font-bold text-[var(--text-primary)] text-base leading-tight mb-1">
            {step.title}
          </h4>
          <div className="text-[10px] font-mono text-[var(--text-secondary)] flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                <GripVertical size={14} />
              </span>
              {Math.round(step.durationSeconds / 60)} min
            </div>
            {onRemove && (
              <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-[var(--text-tertiary)] hover:text-rose-500 transition-colors p-1 pointer-events-auto" title="Remove step">
                 <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 md:p-4 rounded-2xl border transition-all flex items-center gap-3 mb-2 touch-none relative ${
        isPast
          ? 'bg-transparent border-[var(--border-subtle)] text-[var(--text-tertiary)] opacity-60'
          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-violet-500/30'
      }`}
    >
      {!isPast && (
        <div
          {...attributes}
          {...listeners}
          className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-grab active:cursor-grabbing shrink-0 p-1"
        >
          <GripVertical size={16} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={`font-bold truncate text-sm ${isPast ? 'line-through' : 'text-[var(--text-primary)]'}`}>
          {step.title}
        </div>
        <div className="text-[10px] font-mono opacity-60">
          {Math.round(step.durationSeconds / 60)} min
        </div>
      </div>
      {!isPast && onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="shrink-0 p-1 text-[var(--text-tertiary)] hover:text-rose-500 transition-colors pointer-events-auto" title="Remove step">
          <Trash2 size={16} />
        </button>
      )}
      {isPast && <CheckCircle2 size={18} className="shrink-0" />}
    </div>
  );
}

// --- Library Item ---
function LibraryItem({ id, title, duration, type, color, onAdd }: { id: string; title: string; duration: number; type: 'task' | 'habit'; color?: string; onAdd: () => void; }) {
  return (
    <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] p-3 rounded-xl text-xs flex items-center gap-2 shadow-sm hover:border-violet-500/40 transition-colors">
      {type === 'habit' && color ? (
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      ) : (
        <Clock size={12} className="text-[var(--text-tertiary)] shrink-0" />
      )}
      <div className="truncate font-bold text-[var(--text-primary)] flex-1">{title}</div>
      <div className="text-[10px] text-[var(--text-tertiary)] font-mono">{duration}m</div>
      <button onClick={onAdd} className="shrink-0 p-1.5 ml-1 bg-[var(--text-secondary)] text-[var(--bg-app)] hover:bg-violet-500 hover:text-white rounded-md transition-all shadow-sm">
        <Plus size={14} />
      </button>
    </div>
  );
}

export const RoutinePlayer: React.FC = () => {
  const router = useRouter();

  const activeRoutine = useAppStore((s) => s.activeRoutine);
  const steps = useAppStore((s) => s.playerSteps);
  const currentStepIndex = useAppStore((s) => s.currentStepIndex);
  const timeElapsedInStep = useAppStore((s) => s.timeElapsedInStep);
  const isPlaying = useAppStore((s) => s.isPlaying);
  const tasks = useAppStore((s) => s.tasks);
  const habits = useAppStore((s) => s.habits);

  const setPlayerState = useAppStore((s) => s.setPlayerState);
  const handleStepComplete = useAppStore((s) => s.handleStepComplete);
  const exitPlayer = useAppStore((s) => s.exitPlayer);
  const savePausedRoutine = useAppStore((s) => s.savePausedRoutine);
  const handleTimeAdjustment = useAppStore((s) => s.handleTimeAdjustment);
  const handleRemoveStep = useAppStore((s) => s.handleRemoveStep);
  const handleReorderSteps = useAppStore((s) => s.handleReorderSteps);
  const handleInsertStep = useAppStore((s) => s.handleInsertStep);

  const [activeDragItem, setActiveDragItem] = React.useState<any>(null);
  const [mobileSheetView, setMobileSheetView] = React.useState<'none' | 'queue' | 'library'>('none');
  const [estimatedCompletionTime, setEstimatedCompletionTime] = React.useState('');

  const currentStep = steps[currentStepIndex] || { title: 'Finished', durationSeconds: 0 };
  const stepDuration = currentStep.durationSeconds;
  const timeLeft = stepDuration - timeElapsedInStep;
  const isOvertime = timeLeft < 0;
  const progress = stepDuration > 0 ? Math.min(100, (timeElapsedInStep / stepDuration) * 100) : 100;

  React.useEffect(() => {
    if (!activeRoutine) router.push('/dashboard');
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
      setEstimatedCompletionTime(completionDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }));
    };
    calculateEstimation();
    const interval = setInterval(calculateEstimation, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, currentStepIndex, steps, activeRoutine]);

  React.useEffect(() => {
    if (activeRoutine && currentStepIndex === 0 && timeElapsedInStep === 0 && isPlaying) {
      playSound('TIMER_START');
    }
  }, [currentStepIndex, timeElapsedInStep, isPlaying, activeRoutine]);

  React.useEffect(() => {
    if (isPlaying && activeRoutine) {
      if (timeLeft === 0) playSound('TIMER_END');
      else if (timeLeft < 0 && Math.abs(timeLeft) % 30 === 0 && timeLeft !== 0) playSound('OVERTIME_TICK');
    }
  }, [timeLeft, isPlaying, activeRoutine]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } })
  );


  const { setNodeRef: setQueueRef } = useDroppable({ id: 'queue-zone' });

  if (!activeRoutine) return null;

  const handlePlayClick = () => {
    playSound('TIMER_START');
    setPlayerState({ isPlaying: !isPlaying });
  };

  const handleStepCompleteInternal = () => {
    if (currentStepIndex >= steps.length - 1) playSound('ROUTINE_COMPLETE');
    else playSound('TIMER_START');
    handleStepComplete();
  };

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const m = Math.floor(absSeconds / 60);
    const s = absSeconds % 60;
    return `${seconds < 0 ? '-' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);
    if (!over) return;

    if (active.data.current?.type === 'step' && over.data.current?.type === 'step') {
      const oldIndex = active.data.current.index;
      const newIndex = over.data.current.index;
      if (oldIndex !== newIndex) {
        handleReorderSteps(oldIndex, newIndex);
      }
    } 
    else if (active.data.current?.type === 'library' && over.data.current?.type === 'step') {
      const libId = active.data.current.id;
      const libType = active.data.current.libType;
      const dropIndex = over.data.current.index;
      let newStep: RoutineStep | null = null;

      if (libType === 'task') {
        const task = tasks.find((t) => t.id === libId);
        if (task) {
          newStep = { id: `inserted-${Date.now()}`, title: task.title, durationSeconds: (task.duration || 30) * 60, linkedTaskId: task.id };
        }
      } else if (libType === 'habit') {
        const habit = habits.find((h) => h.id === libId);
        if (habit) {
          newStep = { id: `inserted-${Date.now()}`, title: habit.title, durationSeconds: habit.goal.type === 'duration' ? habit.goal.target * 60 : 300, linkedHabitId: habit.id };
        }
      }
      if (newStep) {
        handleInsertStep(newStep, dropIndex);
      }
    }
    
    if (over.id === 'trash-zone' && active.data.current?.type === 'step') {
      handleRemoveStep(active.data.current.index);
    }
  };

  const handleAddFromLibrary = (libType: 'task' | 'habit', libId: string) => {
    let newStep: RoutineStep | null = null;
    if (libType === 'task') {
      const task = tasks.find((t) => t.id === libId);
      if (task) {
        newStep = { id: `inserted-${Date.now()}`, title: task.title, durationSeconds: (task.duration || 30) * 60, linkedTaskId: task.id };
      }
    } else if (libType === 'habit') {
      const habit = habits.find((h) => h.id === libId);
      if (habit) {
        newStep = { id: `inserted-${Date.now()}`, title: habit.title, durationSeconds: habit.goal.type === 'duration' ? habit.goal.target * 60 : 300, linkedHabitId: habit.id };
      }
    }
    if (newStep) {
      handleInsertStep(newStep, steps.length);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="fixed inset-0 bg-[var(--bg-app)] text-[var(--text-primary)] z-[100] flex flex-col font-sans h-full w-full overflow-hidden">
        
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-4 md:px-8 shrink-0 bg-transparent absolute top-0 left-0 right-0 z-20">
          <button onClick={() => { setPlayerState({ isMinimized: true }); router.push('/routines'); }} className="p-2 hover:bg-white/10 rounded-full transition-colors text-[var(--text-secondary)]">
             <ChevronDown size={28} />
          </button>
          <div className="text-[10px] font-bold tracking-widest uppercase text-[var(--text-secondary)] font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
            {activeRoutine.title}
          </div>
          <button onClick={exitPlayer} className="p-2 hover:bg-white/10 rounded-full transition-colors text-[var(--text-secondary)]">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden relative pt-16">
          {/* CENTER PANEL: Spotify-like Focus Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 relative pb-32">
            
            <div className="w-full max-w-lg mx-auto flex flex-col items-center">
              {/* Giant Album-Art Timer */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 group mb-12 shrink-0 select-none drop-shadow-2xl">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--bg-surface-elevated)] to-[var(--bg-app)] shadow-[inset_0_4px_20px_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.2)] border border-[var(--border-subtle)]" />
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r="46%" stroke="var(--border-subtle)" strokeWidth="6" fill="transparent" />
                  <circle cx="50%" cy="50%" r="46%" stroke={isOvertime ? '#f43f5e' : '#8b5cf6'} strokeWidth="6" fill="transparent" strokeDasharray="289%" pathLength={100} strokeDashoffset={100 - progress} strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className={`text-5xl md:text-7xl font-bold tracking-tighter tabular-nums ${isOvertime ? 'text-rose-500 animate-pulse' : 'text-[var(--text-primary)]'}`}>
                    {formatTime(timeLeft)}
                  </span>
                  {isOvertime && (
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-2 bg-rose-500/10 px-2 py-0.5 rounded font-mono">
                      Overtime
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Estimations */}
              <div className="text-center w-full mb-10 px-4">
                <h1 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight line-clamp-2 mb-2">
                  {currentStep.title}
                </h1>
                <div className="text-xs font-mono text-[var(--text-secondary)] opacity-60">
                  Completes ≈ {estimatedCompletionTime}
                </div>
              </div>

              {/* Media Controls */}
              <div className="flex items-center justify-center gap-6 md:gap-10 w-full max-w-sm">
                <button onClick={() => handleTimeAdjustment(60)} className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-all">
                  <Minus size={24} />
                </button>

                <button onClick={handlePlayClick} className="w-20 h-20 rounded-full flex items-center justify-center text-[var(--bg-app)] bg-[var(--text-primary)] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.15)]">
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                </button>

                <button onClick={handleStepCompleteInternal} className="w-12 h-12 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-violet-400 hover:bg-[var(--bg-surface-elevated)] transition-all">
                  <SkipForward size={24} fill="currentColor" />
                </button>
              </div>

            </div>
          </div>

          {/* Desktop Right Panel: Up Next & Library */}
          <div className="hidden lg:flex flex-col w-96 border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden shadow-2xl z-10">
            {/* Tabs */}
            <div className="flex p-2 bg-[var(--bg-surface-elevated)] m-4 rounded-xl shrink-0">
               <button onClick={() => setMobileSheetView('queue')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mobileSheetView !== 'library' ? 'bg-[var(--bg-surface)] shadow text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                 Up Next
               </button>
               <button onClick={() => setMobileSheetView('library')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mobileSheetView === 'library' ? 'bg-[var(--bg-surface)] shadow text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                 Library
               </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-12">
              {mobileSheetView !== 'library' ? (
                <div ref={setQueueRef} className="space-y-1 pb-20">
                   <SortableContext items={steps.map(s => `step-${s.id}`)} strategy={verticalListSortingStrategy}>
                     {steps.map((step, idx) => (
                       <SortableStepItem key={step.id} step={step} index={idx} isActive={idx === currentStepIndex} isPast={idx < currentStepIndex} onRemove={() => handleRemoveStep(idx)} />
                     ))}
                   </SortableContext>
                </div>
              ) : (
                <div className="space-y-6 pb-20">
                  <div>
                    <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mb-3 font-mono tracking-wider ml-1">Unscheduled Tasks</h4>
                    <div className="space-y-2">
                      {tasks.filter((t) => !t.isCompleted && !t.deletedAt).map((task) => (
                        <LibraryItem key={task.id} id={task.id} title={task.title} duration={task.duration || 30} type="task" onAdd={() => handleAddFromLibrary('task', task.id)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase mb-3 font-mono tracking-wider ml-1">Habits</h4>
                    <div className="space-y-2">
                      {habits.filter((h) => !h.deletedAt).map((habit) => (
                        <LibraryItem key={habit.id} id={habit.id} title={habit.title} duration={habit.goal.type === 'duration' ? habit.goal.target : 5} type="habit" color={habit.color} onAdd={() => handleAddFromLibrary('habit', habit.id)} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation (Queue / Library Triggers) */}
        <div className="lg:hidden absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-app)] to-transparent pointer-events-none flex items-end justify-center pb-6 gap-4 z-20">
           <button onClick={() => setMobileSheetView('queue')} className="pointer-events-auto flex items-center gap-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] px-6 py-3 rounded-full text-sm font-bold text-[var(--text-primary)] shadow-xl active:scale-95 transition-all">
             <List size={18} /> Up Next
           </button>
           <button onClick={() => setMobileSheetView('library')} className="pointer-events-auto flex items-center gap-2 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] px-6 py-3 rounded-full text-sm font-bold text-[var(--text-primary)] shadow-xl active:scale-95 transition-all">
             <Library size={18} /> Add
           </button>
        </div>

        {/* Mobile Swipe-up Bottom Sheet */}
        <div className={`lg:hidden fixed inset-x-0 bottom-0 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] rounded-t-[2.5rem] transition-transform duration-400 ease-out z-50 flex flex-col h-[85vh] ${mobileSheetView !== 'none' ? 'translate-y-0 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]' : 'translate-y-full'}`}>
          <div className="w-full flex justify-center py-4 cursor-pointer" onClick={() => setMobileSheetView('none')}>
             <div className="w-12 h-1.5 bg-[var(--border-strong)] rounded-full opacity-50" />
          </div>
          <div className="px-6 pb-2 flex items-center justify-between">
            <h3 className="font-bold text-2xl text-[var(--text-primary)] tracking-tight">
              {mobileSheetView === 'queue' ? 'Up Next' : 'Library'}
            </h3>
            <button onClick={() => setMobileSheetView('none')} className="p-2 bg-[var(--bg-surface-elevated)] rounded-full text-[var(--text-secondary)]">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-12 pt-2 no-scrollbar" ref={mobileSheetView === 'queue' ? setQueueRef : undefined}>
            {mobileSheetView === 'queue' ? (
              <SortableContext items={steps.map(s => `step-${s.id}`)} strategy={verticalListSortingStrategy}>
                 {steps.map((step, idx) => (
                   <SortableStepItem key={step.id} step={step} index={idx} isActive={idx === currentStepIndex} isPast={idx < currentStepIndex} onRemove={() => handleRemoveStep(idx)} />
                 ))}
              </SortableContext>
            ) : (
              <div className="space-y-8 pb-10 px-2">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase mb-4 font-mono tracking-wider ml-1">Tasks</h4>
                  <div className="space-y-3">
                    {tasks.filter((t) => !t.isCompleted && !t.deletedAt).map((task) => (
                      <LibraryItem key={task.id} id={task.id} title={task.title} duration={task.duration || 30} type="task" onAdd={() => handleAddFromLibrary('task', task.id)} />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase mb-4 font-mono tracking-wider ml-1">Habits</h4>
                  <div className="space-y-3">
                    {habits.filter((h) => !h.deletedAt).map((habit) => (
                      <LibraryItem key={habit.id} id={habit.id} title={habit.title} duration={habit.goal.type === 'duration' ? habit.goal.target : 5} type="habit" color={habit.color} onAdd={() => handleAddFromLibrary('habit', habit.id)} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragItem?.type === 'step' ? (
            <div className="p-4 rounded-2xl bg-[var(--bg-surface-elevated)] border-2 border-violet-500 shadow-2xl flex items-center gap-3 opacity-90 rotate-2 scale-105">
              <GripVertical size={16} className="text-[var(--text-tertiary)]" />
              <div className="font-bold text-sm text-[var(--text-primary)]">{activeDragItem.step.title}</div>
            </div>
          ) : null}
        </DragOverlay>

        {mobileSheetView !== 'none' && (
          <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setMobileSheetView('none')} />
        )}

      </div>
    </DndContext>
  );
};

export default RoutinePlayer;
