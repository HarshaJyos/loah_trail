'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Task, Routine, FocusSession, Habit, Project, Priority } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  ZoomIn,
  ZoomOut,
  PlayCircle,
  CheckCircle2,
  Focus,
  Layers,
  PanelLeft,
  LayoutGrid,
  Book,
  Eye,
  EyeOff,
  CalendarPlus,
  CalendarOff,
  Trash2,
  GripVertical
} from 'lucide-react';
import { 
  DndContext, DragOverlay, useDraggable, useDroppable, 
  DragStartEvent, DragEndEvent, PointerSensor, useSensor, useSensors, pointerWithin
} from '@dnd-kit/core';

type CalendarView = 'month' | 'week' | 'day';
type CalendarMode = 'scheduled' | 'focus';

const FOCUS_COLORS = [
  '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4',
];

// ─────────────────────────────────────────────────────────────────────────────
// Draggable Wrappers
// ─────────────────────────────────────────────────────────────────────────────
function DraggableSidebarItem({ id, type, children, className, style }: any) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${type}-${id}`,
    data: { id, type, origin: 'sidebar' }
  });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={`${className} ${isDragging ? 'opacity-50' : ''}`} style={{ ...style, touchAction: 'none' }}>
      {children}
    </div>
  );
}

function DraggableGridBlock({ id, type, isResizing, children, className, style }: any) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `grid-${type}-${id}`,
    data: { id, type, origin: 'grid' },
    disabled: isResizing
  });
  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      className={`${className} ${isDragging ? 'opacity-40' : ''}`}
      style={{ ...style, touchAction: 'none' }}
    >
      {children}
    </div>
  );
}

function DroppableDayCol({ dateStr, children, className }: { dateStr: string, children: React.ReactNode, className?: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dateStr}`,
    data: { dateStr }
  });
  return (
    <div ref={setNodeRef} className={`${className} ${isOver ? 'bg-violet-500/5' : ''}`}>
      {children}
    </div>
  );
}

function TrashZone() {
  const { setNodeRef, isOver } = useDroppable({ id: 'trash-zone' });
  return (
    <div ref={setNodeRef} className={`fixed bottom-6 right-6 p-4 px-6 rounded-2xl shadow-2xl border-2 flex items-center justify-center transition-all z-[200] ${isOver ? 'bg-rose-500/20 border-rose-500 text-rose-500 scale-110' : 'bg-[var(--bg-surface-elevated)] border-rose-500/50 text-rose-500/80 backdrop-blur-md'}`}>
      <Trash2 size={24} />
      <span className="ml-2 font-bold text-sm hidden md:inline">Drop to Unschedule</span>
    </div>
  );
}

export const CalendarModule: React.FC = () => {
  const tasks = useAppStore((state) => state.tasks);
  const routines = useAppStore((state) => state.routines);
  const habits = useAppStore((state) => state.habits);
  const projects = useAppStore((state) => state.projects);
  const focusSessions = useAppStore((state) => state.focusSessions);

  const onUpdateTask = useAppStore((state) => state.handleUpdateTask);
  const onStartTask = useAppStore((state) => state.startTaskFocus);
  const onScheduleRoutine = useAppStore((state) => state.scheduleRoutine);
  const onStartRoutine = useAppStore((state) => state.startRoutine);
  const onUpdateRoutine = useAppStore((state) => state.handleUpdateRoutine);
  const onScheduleHabit = useAppStore((state) => state.scheduleHabit);
  const onUnschedule = useAppStore((state) => state.unscheduleItem);

  const [view, setView] = React.useState<CalendarView>('week');
  const [mode, setMode] = React.useState<CalendarMode>('scheduled');
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const [hourHeight, setHourHeight] = React.useState(80);
  
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);
  const [activeDragData, setActiveDragData] = React.useState<any>(null);

  // Resizing State
  const [resizingTaskId, setResizingTaskId] = React.useState<string | null>(null);
  const [liveDuration, setLiveDuration] = React.useState<number | null>(null);
  const resizeRef = React.useRef<{ startY: number; startDuration: number; taskId: string; currentDuration: number } | null>(null);

  const [now, setNow] = React.useState(new Date());

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const headerContainerRef = React.useRef<HTMLDivElement>(null);

  const pendingTasks = React.useMemo(() => tasks.filter((t) => !t.isCompleted && !t.deletedAt && !t.startTime), [tasks]);
  const recurringRoutines = React.useMemo(() => routines.filter((r) => r.type === 'repeatable' && !r.deletedAt), [routines]);

  // Sensors for DND kit. We require a small movement before drag starts so clicking works.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const d = new Date();
      const minutes = d.getHours() * 60 + d.getMinutes();
      const pxPerMin = hourHeight / 60;
      scrollContainerRef.current.scrollTop = Math.max(0, (minutes - 60) * pxPerMin);
    }
  }, [view, hourHeight]);

  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerContainerRef.current) {
      headerContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  };

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getDaysToRender = () => {
    if (view === 'day') return [currentDate];
    if (view === 'week') {
      const start = getStartOfWeek(currentDate);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return d;
      });
    }
    return [];
  };

  const getPriorityColor = (priority?: Priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-500';
      case 'Medium': return 'bg-amber-500';
      case 'Low': return 'bg-blue-500';
      default: return 'bg-zinc-400';
    }
  };

  // --- Resizing Logic ---
  React.useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!resizeRef.current) return;
      const { startY, startDuration } = resizeRef.current;
      const deltaY = e.clientY - startY;
      const pxPerMin = hourHeight / 60;
      const deltaMinutes = deltaY / pxPerMin;
      const snappedDelta = Math.round(deltaMinutes / 15) * 15; // 15 min snapping
      const newDuration = Math.max(15, startDuration + snappedDelta);
      
      resizeRef.current.currentDuration = newDuration;
      setLiveDuration(newDuration);
    };

    const handlePointerUp = () => {
      if (resizingTaskId && resizeRef.current) {
         const task = tasks.find(t => t.id === resizingTaskId);
         const finalDuration = resizeRef.current.currentDuration;
         if (task && finalDuration && task.duration !== finalDuration) {
             onUpdateTask({ ...task, duration: finalDuration });
         }
      }
      setResizingTaskId(null);
      setLiveDuration(null);
      resizeRef.current = null;
    };

    if (resizingTaskId) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [resizingTaskId, hourHeight, tasks, onUpdateTask]);

  const handleResizeStart = (e: React.PointerEvent, task: Task) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingTaskId(task.id);
    resizeRef.current = {
      taskId: task.id,
      startY: e.clientY,
      startDuration: task.duration || 30,
      currentDuration: task.duration || 30,
    };
    setLiveDuration(task.duration || 30);
  };

  // --- DndKit Handlers ---
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
    setActiveDragData(event.active.data.current);
    if (event.active.data.current?.origin === 'sidebar') {
       setIsSidebarOpen(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    setActiveDragData(null);
    
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current;
    if (!data) return;
    const { id, type, origin } = data;

    const overData = over.data.current;

    if (over.id === 'trash-zone') {
       if (origin !== 'sidebar') {
           onUnschedule(id, type);
       }
       return;
    }

    if (!overData) return;

    const targetDateStr = overData.dateStr;
    const targetDate = new Date(targetDateStr);

    let newStart = new Date(targetDate);
    
    if (origin === 'sidebar') {
       const dropY = event.active.rect.current.translated ? event.active.rect.current.translated.top - over.rect.top : 0;
       const pxPerMin = hourHeight / 60;
       let totalMins = dropY / pxPerMin;
       if (totalMins < 0) totalMins = 0;
       
       const snappedMins = Math.round(totalMins / 15) * 15;
       newStart.setHours(Math.floor(snappedMins / 60), snappedMins % 60, 0, 0);
    } else {
       // It was dragged from the grid. We can calculate the exact time from its new Y translation
       // Using the distance moved in pixels.
       const deltaY = event.delta.y;
       const pxPerMin = hourHeight / 60;
       const deltaMins = deltaY / pxPerMin;
       
       let originalStartTime = 0;
       if (type === 'task') {
         originalStartTime = tasks.find(t => t.id === id)?.startTime || 0;
       } else if (type === 'routine') {
         originalStartTime = routines.find(r => r.id === id)?.startTime || 0;
       }
       
       if (originalStartTime) {
          const oldDate = new Date(originalStartTime);
          const newTotalMins = oldDate.getHours() * 60 + oldDate.getMinutes() + deltaMins;
          const snappedMins = Math.round(newTotalMins / 15) * 15;
          newStart.setHours(Math.floor(snappedMins / 60), snappedMins % 60, 0, 0);
       }
    }

    if (type === 'task') {
      const task = tasks.find(t => t.id === id);
      if (task) onUpdateTask({ ...task, startTime: newStart.getTime() });
    } else if (type === 'routine') {
      if (origin === 'sidebar') {
        onScheduleRoutine(id, newStart.getTime());
      } else {
        const routine = routines.find(r => r.id === id);
        if (routine) onUpdateRoutine({ ...routine, startTime: newStart.getTime() });
      }
    } else if (type === 'habit') {
      onScheduleHabit(id, newStart.getTime());
    }
  };

  const getDragTitle = () => {
    if (!activeDragId || !activeDragData) return '';
    const { id, type } = activeDragData;
    if (type === 'task') return tasks.find(t => t.id === id)?.title || '';
    if (type === 'routine') return routines.find(r => r.id === id)?.title || '';
    if (type === 'habit') return habits.find(h => h.id === id)?.title || '';
    return '';
  };

  // --- Rendering ---
  const renderMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOfWeek = getStartOfWeek(firstDay);

    const days: Date[] = [];
    let d = new Date(startOfWeek);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }

    return (
      <div className="flex flex-col flex-1 h-full overflow-hidden bg-[var(--bg-canvas)]">
        <div className="grid grid-cols-7 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/30 flex-shrink-0">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((h) => (
            <div key={h} className="py-2 text-center text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest font-mono">
              {h}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0 bg-[var(--bg-canvas)]/50">
          {days.map((day) => {
            const isSameMonth = day.getMonth() === month;
            const isToday = isSameDay(day, now);
            const dayTasks = tasks.filter(t => t.startTime && isSameDay(new Date(t.startTime), day) && (showCompleted || !t.isCompleted));
            const dayRoutines = routines.filter(r => r.startTime && isSameDay(new Date(r.startTime), day));
            const totalScheduled = dayTasks.length + dayRoutines.length;

            return (
              <div
                key={day.toISOString()}
                className={`border-b border-r border-[var(--border-subtle)] p-2 relative flex flex-col items-center justify-start gap-1.5 cursor-pointer transition-colors ${
                  !isSameMonth ? 'bg-transparent text-[var(--text-secondary)] opacity-50' : 'bg-[var(--border-subtle)] hover:bg-[var(--bg-surface-elevated)]/40'
                }`}
                onClick={() => {
                   setCurrentDate(day);
                   setView('day');
                }}
              >
                <div className="flex justify-center mb-1 shrink-0">
                  <span className={`text-[10px] font-bold font-mono w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-rose-600 text-white shadow-[0_0_8px_#f43f5e]' : 'text-[var(--text-secondary)]'
                  }`}>
                    {day.getDate()}
                  </span>
                </div>
                {totalScheduled > 0 && (
                  <div className="text-[10px] bg-violet-500/10 border border-violet-500/20 text-violet-500 font-bold px-2 py-0.5 rounded-full text-center w-full truncate">
                    {totalScheduled} scheduled
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTimeGrid = (days: Date[]) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const pxPerMin = hourHeight / 60;
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    const redLineTop = currentMinutes * pxPerMin;

    const minColWidth = view === 'week' ? 'min-w-[70px] md:min-w-0' : 'min-w-0';
    const gridMinWidth = view === 'week' ? 'min-w-[490px] md:min-w-0' : 'min-w-full';

    return (
      <div className="flex flex-col flex-1 min-h-0 bg-[var(--bg-canvas)] relative select-none">
        <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/85 backdrop-blur-md z-20 shrink-0 shadow-md">
          <div className="w-[50px] md:w-[60px] border-r border-[var(--border-subtle)] shrink-0 sticky left-0 z-30" />
          <div ref={headerContainerRef} className="flex-1 overflow-hidden">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
              {days.map((day) => {
                const isToday = isSameDay(day, now);
                return (
                  <div key={day.toISOString()} className={`py-2 md:py-3 px-1 md:px-2 text-center border-r border-[var(--border-subtle)] last:border-0 group ${minColWidth}`}>
                    <div className={`text-[9px] md:text-[10px] font-bold font-mono uppercase mb-1 ${isToday ? 'text-rose-500' : 'text-[var(--text-tertiary)]'}`}>
                      <span className="md:hidden">{day.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                      <span className="hidden md:inline">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    </div>
                    <div className={`text-base md:text-lg font-bold w-7 h-7 md:w-8 md:h-8 flex items-center justify-center mx-auto rounded-full transition-all ${isToday ? 'bg-rose-600 text-white shadow-[0_0_8px_#f43f5e]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div ref={scrollContainerRef} onScroll={handleBodyScroll} className="flex-1 overflow-y-auto overflow-x-auto no-scrollbar relative">
          <div className="flex relative" style={{ height: `${24 * hourHeight + 120}px` }}>
            {/* Time labels column */}
            <div className="w-[50px] md:w-[60px] border-r border-[var(--border-subtle)] bg-[var(--bg-canvas)] shrink-0 sticky left-0 z-50">
              {hours.map((hour) => (
                <div key={hour} className="relative border-b border-transparent box-border" style={{ height: `${hourHeight}px` }}>
                  <span className="absolute -top-2.5 right-1 md:right-2 text-[9px] md:text-[10px] text-[var(--text-tertiary)] font-bold font-mono">
                    {hour === 0 ? '' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </span>
                </div>
              ))}
              {(isSameDay(now, days[0]) || days.length > 1) && (
                <div className="absolute right-0 z-50 pointer-events-none flex items-center justify-end pr-2" style={{ top: `${redLineTop}px`, transform: 'translateY(-50%)', width: '100%' }}>
                  <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-lg font-mono">
                    {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                  <div className="absolute -right-[4px] w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0a0a0f] z-10" />
                </div>
              )}
            </div>

            {/* Grid Columns */}
            <div className={`flex-1 grid relative ${gridMinWidth}`} style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
              <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
                {hours.map((h) => (
                  <div key={h} className="w-full relative box-border" style={{ height: `${hourHeight}px` }}>
                    <div className="absolute top-0 w-full border-t-[2px] border-[var(--border-subtle)]" />
                    {hourHeight > 60 && (
                       <>
                         <div className="absolute top-1/4 w-full border-t border-dashed border-[var(--border-subtle)] opacity-40" />
                         <div className="absolute top-2/4 w-full border-t border-[var(--border-subtle)] opacity-80" />
                         <div className="absolute top-3/4 w-full border-t border-dashed border-[var(--border-subtle)] opacity-40" />
                       </>
                    )}
                  </div>
                ))}
              </div>

              {(isSameDay(now, days[0]) || days.length > 1) && (
                <div className="absolute left-0 right-0 z-30 pointer-events-none" style={{ top: `${redLineTop}px` }}>
                  <div className="h-[1.5px] bg-rose-500 w-full shadow-[0_0_8px_#f43f5e]" />
                </div>
              )}

              {days.map((day) => (
                <DroppableDayCol key={day.toISOString()} dateStr={day.toISOString()} className={`relative border-r border-[var(--border-subtle)] last:border-0 z-10 h-full ${minColWidth}`}>
                  {mode === 'scheduled' && (
                    <>
                      {tasks.filter(t => t.startTime && isSameDay(new Date(t.startTime!), day) && (showCompleted || !t.isCompleted)).map(task => {
                        const date = new Date(task.startTime!);
                        const top = (date.getHours() * 60 + date.getMinutes()) * pxPerMin;
                        const isResizing = resizingTaskId === task.id;
                        const durationToUse = isResizing ? (liveDuration || task.duration || 30) : (task.duration || 30);
                        const height = durationToUse * pxPerMin;

                        return (
                          <DraggableGridBlock
                            key={task.id} id={task.id} type="task" isResizing={isResizing}
                            className={`absolute left-0.5 right-0.5 md:left-1 md:right-1 rounded-xl p-2 text-xs transition-shadow z-20 flex flex-col justify-between border border-[var(--border-default)] group shadow-md cursor-grab active:cursor-grabbing
                              ${isResizing ? '!scale-100 z-30 shadow-2xl ring-2 ring-violet-500/50' : ''}
                              ${task.isCompleted ? 'opacity-40 border-dashed' : ''}
                            `}
                            style={{
                              top: `${top}px`, height: `${Math.max(height, hourHeight * 0.45)}px`,
                              backgroundColor: task.color || '#3b82f6', color: '#ffffff',
                            }}
                          >
                            <div className="flex flex-col h-full relative cursor-grab">
                              <div className="flex items-center gap-1.5 min-w-0 mb-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPriorityColor(task.priority)} shadow-sm`} />
                                <div className="font-bold truncate leading-tight text-[10px] md:text-[11px] drop-shadow-md">
                                  {task.title}
                                </div>
                              </div>
                              <div className="text-[8px] font-bold font-mono opacity-80 leading-none">
                                {date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()}
                                <span className="opacity-50 mx-1">•</span>
                                {task.duration || 30}m
                              </div>
                            </div>
                            
                            {/* Resize Handle */}
                            <div 
                              className="absolute bottom-0 left-0 right-0 h-3 flex items-end justify-center cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity pb-0.5"
                              onPointerDown={(e) => handleResizeStart(e, task)}
                            >
                               <div className="w-6 h-1 rounded-full bg-white/50" />
                            </div>
                          </DraggableGridBlock>
                        );
                      })}

                      {routines.filter(r => r.startTime && isSameDay(new Date(r.startTime!), day)).map(routine => {
                        const date = new Date(routine.startTime!);
                        const durationMins = Math.ceil(routine.steps.reduce((acc, s) => acc + s.durationSeconds, 0) / 60);
                        const top = (date.getHours() * 60 + date.getMinutes()) * pxPerMin;
                        const height = durationMins * pxPerMin;
                        const isHabit = routine.id.startsWith('habit-');

                        return (
                          <DraggableGridBlock
                            key={routine.id} id={routine.id} type="routine" isResizing={false}
                            className={`absolute left-0.5 right-0.5 md:left-1 md:right-1 rounded-xl p-2 text-xs transition-shadow z-20 flex flex-col justify-start border border-[var(--border-default)] cursor-grab active:cursor-grabbing shadow-md
                              ${routine.completedAt ? 'opacity-40 border-dashed' : 'hover:brightness-95'}
                            `}
                            style={{
                              top: `${top}px`, height: `${Math.max(height, hourHeight * 0.45)}px`,
                              backgroundColor: isHabit ? routine.color : '#7c3aed', color: '#ffffff',
                            }}
                          >
                            <div className="flex flex-col h-full relative cursor-grab">
                              <div className="flex items-start justify-between mb-0.5 opacity-90 text-[10px]">
                                <div className="font-bold truncate leading-tight text-[10px] md:text-[11px] flex-1 text-white">
                                  {routine.title}
                                </div>
                              </div>
                              <div className="text-[8px] font-bold font-mono opacity-80 leading-none truncate">
                                {date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase()}
                              </div>
                            </div>
                          </DraggableGridBlock>
                        );
                      })}
                    </>
                  )}
                </DroppableDayCol>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="w-full h-full flex flex-col relative bg-[var(--bg-canvas)]">
        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0, background: 'var(--bg-app)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 2, alignItems: 'center' }}>
                <button onClick={() => navigate('prev')} className="p-1 hover:bg-[var(--bg-surface-elevated)] rounded-md text-[var(--text-secondary)]"><ChevronLeft size={16} /></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-2 text-[10px] text-[var(--text-primary)] font-bold uppercase hover:bg-[var(--bg-surface-elevated)] rounded-md">Today</button>
                <button onClick={() => navigate('next')} className="p-1 hover:bg-[var(--bg-surface-elevated)] rounded-md text-[var(--text-secondary)]"><ChevronRight size={16} /></button>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  background: isSidebarOpen ? 'rgba(137,121,255,0.1)' : 'var(--bg-surface)',
                  border: `1px solid ${isSidebarOpen ? '#8979FF' : 'var(--border-subtle)'}`,
                  color: isSidebarOpen ? '#8979FF' : 'var(--text-secondary)',
                  padding: '8px 16px', gap: 8, display: 'flex', alignItems: 'center', borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                <PanelLeft size={16} />
                <span style={{ fontSize: 12, fontWeight: 700 }}>Library</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 3, alignItems: 'center', gap: 4 }}>
              {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
                <button
                  key={v} onClick={() => setView(v)}
                  style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    background: view === v ? 'var(--bg-surface-elevated)' : 'transparent',
                    color: view === v ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative min-h-0 bg-[var(--bg-canvas)]">
          {/* Sidebar Library */}
          <div className={`border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]/60 backdrop-blur-xl flex-shrink-0 transition-all overflow-hidden flex flex-col absolute md:relative z-[60] h-full ${isSidebarOpen ? 'w-72 opacity-100 shadow-2xl md:shadow-none' : 'w-0 border-r-0 opacity-0'}`}>
            <div className="w-72 flex flex-col h-full">
              <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center">
                <h3 className="font-extrabold text-[var(--text-primary)] text-sm flex items-center gap-2">
                  <Book size={16} className="text-violet-400" /> Item Library
                </h3>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 hover:bg-[var(--bg-surface-elevated)] rounded-lg"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-32">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Unscheduled Tasks</h4>
                  <div className="space-y-2">
                    {pendingTasks.map(task => (
                      <DraggableSidebarItem key={task.id} id={task.id} type="task" className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 rounded-xl text-xs hover:border-violet-500/20 cursor-grab active:cursor-grabbing shadow-sm flex flex-col" style={{ borderLeftColor: task.color || '#3b82f6', borderLeftWidth: '3.5px' }}>
                        <div className="font-bold text-[var(--text-primary)] truncate">{task.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-[var(--text-tertiary)] font-mono">
                          <Clock size={10} /> {task.duration || 30}m
                        </div>
                      </DraggableSidebarItem>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Flow Routines</h4>
                  <div className="space-y-2">
                    {recurringRoutines.map(routine => (
                      <DraggableSidebarItem key={routine.id} id={routine.id} type="routine" className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 rounded-xl text-xs hover:border-violet-500/20 cursor-grab active:cursor-grabbing shadow-sm flex flex-col">
                         <div className="font-bold text-[var(--text-primary)] truncate">{routine.title}</div>
                         <div className="flex items-center gap-1.5 mt-1 text-[9px] text-[var(--text-tertiary)] font-mono">
                           <Layers size={10} /> {routine.steps.length} Steps
                         </div>
                      </DraggableSidebarItem>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase font-mono">Habits</h4>
                  <div className="space-y-2">
                    {habits.map(habit => (
                      <DraggableSidebarItem key={habit.id} id={habit.id} type="habit" className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 rounded-xl text-xs hover:border-violet-500/20 cursor-grab active:cursor-grabbing shadow-sm flex items-center gap-2.5">
                         <div className="w-2.5 h-2.5 rounded-full shadow shrink-0" style={{ backgroundColor: habit.color }} />
                         <span className="truncate font-bold text-[var(--text-secondary)]">{habit.title}</span>
                      </DraggableSidebarItem>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-canvas)] relative">
            {view === 'month' ? renderMonthGrid() : renderTimeGrid(getDaysToRender())}
          </div>
        </div>
      </div>

      {/* Drag Overlay for smooth dragging visual */}
      <DragOverlay>
        {activeDragId && activeDragData ? (
          <div className="bg-[var(--bg-surface)] border-2 border-violet-500 p-3 rounded-xl text-xs shadow-2xl opacity-90 cursor-grabbing w-48">
            <div className="font-bold text-[var(--text-primary)] flex items-center gap-2">
               <GripVertical size={14} className="text-violet-400" />
               <span className="truncate">{getDragTitle()}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>

      {/* Trash Zone */}
      {activeDragId && <TrashZone />}
    </DndContext>
  );
};

export default CalendarModule;
