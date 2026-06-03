'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Task, Routine, FocusSession, Habit, Project, Priority } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  Calendar as CalIcon,
  ZoomIn,
  ZoomOut,
  PlayCircle,
  CheckCircle2,
  Focus,
  Layers,
  PanelLeft,
  LayoutGrid,
  ListTodo,
  Book,
  Briefcase,
  Eye,
  EyeOff,
  CalendarPlus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  CalendarOff,
  Move,
  CheckSquare,
  Droplets,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

type CalendarView = 'month' | 'week' | 'day';
type CalendarMode = 'scheduled' | 'focus';

const FOCUS_COLORS = [
  '#a855f7', // Violet
  '#ec4899', // Pink
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
];

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

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isDraggingOverLibrary, setIsDraggingOverLibrary] = React.useState(false);

  // Zoom / Scaling State
  const [hourHeight, setHourHeight] = React.useState(60);

  // Selection / Mobile Edit State
  const [selectedBlock, setSelectedBlock] = React.useState<{ id: string; type: 'task' | 'routine' } | null>(null);

  // Resizing State (Desktop)
  const [resizingTaskId, setResizingTaskId] = React.useState<string | null>(null);
  const resizeRef = React.useRef<{ startY: number; startDuration: number; taskId: string } | null>(null);

  const ignoreClickRef = React.useRef(false);

  // Real-time state
  const [now, setNow] = React.useState(new Date());

  // Refs for scroll syncing
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const headerContainerRef = React.useRef<HTMLDivElement>(null);

  // Derived Data
  const pendingTasks = React.useMemo(() => tasks.filter((t) => !t.isCompleted && !t.deletedAt && !t.startTime), [tasks]);
  const recurringRoutines = React.useMemo(() => routines.filter((r) => r.type === 'repeatable' && !r.deletedAt), [routines]);

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
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

  // Sync horizontal scroll between header and body
  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headerContainerRef.current) {
      headerContainerRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleScroll = (amount: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: amount, behavior: 'smooth' });
    }
  };

  const handleZoom = (amount: number) => {
    setHourHeight((prev) => Math.max(40, Math.min(150, prev + amount)));
  };

  // --- Mobile Touch Logic (Touch Control Panel) ---
  const getTargetDateForQuickSchedule = () => {
    const targetDate = new Date(currentDate);
    const currentHour = new Date().getHours();
    if (isSameDay(targetDate, new Date())) {
      targetDate.setHours(currentHour + 1, 0, 0, 0);
    } else {
      targetDate.setHours(9, 0, 0, 0);
    }
    return targetDate.getTime();
  };

  const handleQuickScheduleTask = (task: Task) => {
    onUpdateTask({ ...task, startTime: getTargetDateForQuickSchedule() });
    setSelectedBlock({ id: task.id, type: 'task' });
    setIsSidebarOpen(false);
  };

  const handleQuickScheduleRoutine = (routine: Routine) => {
    onScheduleRoutine(routine.id, getTargetDateForQuickSchedule());
    setIsSidebarOpen(false);
  };

  const handleQuickScheduleHabit = (habit: Habit) => {
    onScheduleHabit(habit.id, getTargetDateForQuickSchedule());
    setIsSidebarOpen(false);
  };

  const moveSelectedItem = (minutes: number) => {
    if (!selectedBlock) return;

    if (selectedBlock.type === 'task') {
      const task = tasks.find((t) => t.id === selectedBlock.id);
      if (task && task.startTime) {
        onUpdateTask({ ...task, startTime: task.startTime + minutes * 60000 });
      }
    } else {
      const routine = routines.find((r) => r.id === selectedBlock.id);
      if (routine && routine.startTime) {
        onUpdateRoutine({ ...routine, startTime: routine.startTime + minutes * 60000 });
      }
    }
  };

  const shiftSelectedItemDay = (days: number) => {
    if (!selectedBlock) return;

    const updateTime = (startTime: number) => {
      const newDate = new Date(startTime);
      newDate.setDate(newDate.getDate() + days);
      return newDate.getTime();
    };

    if (selectedBlock.type === 'task') {
      const task = tasks.find((t) => t.id === selectedBlock.id);
      if (task && task.startTime) {
        const newTime = updateTime(task.startTime);
        onUpdateTask({ ...task, startTime: newTime });
        if (view === 'day') setCurrentDate(new Date(newTime));
      }
    } else {
      const routine = routines.find((r) => r.id === selectedBlock.id);
      if (routine && routine.startTime) {
        const newTime = updateTime(routine.startTime);
        onUpdateRoutine({ ...routine, startTime: newTime });
        if (view === 'day') setCurrentDate(new Date(newTime));
      }
    }
  };

  const resizeSelectedItem = (minutes: number) => {
    if (!selectedBlock || selectedBlock.type !== 'task') return;
    const task = tasks.find((t) => t.id === selectedBlock.id);
    if (task) {
      const currentDuration = task.duration || 30;
      const newDuration = Math.max(15, currentDuration + minutes);
      onUpdateTask({ ...task, duration: newDuration });
    }
  };

  const unscheduleSelectedItem = () => {
    if (!selectedBlock) return;
    onUnschedule(selectedBlock.id, selectedBlock.type);
    setSelectedBlock(null);
  };

  const startSelectedItem = () => {
    if (!selectedBlock) return;
    if (selectedBlock.type === 'task') {
      const task = tasks.find((t) => t.id === selectedBlock.id);
      if (task) {
        onStartTask(task);
        setSelectedBlock(null);
      }
    } else {
      onStartRoutine(selectedBlock.id);
      setSelectedBlock(null);
    }
  };

  // --- Resizing Logic (Desktop Mouse) ---
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;

      const { startY, startDuration, taskId } = resizeRef.current;
      const deltaY = e.clientY - startY;
      const deltaMinutes = Math.round((deltaY / hourHeight) * 60);
      const snappedDelta = Math.round(deltaMinutes / 10) * 10;
      const newDuration = Math.max(10, startDuration + snappedDelta);

      const task = tasks.find((t) => t.id === taskId);
      if (task && task.duration !== newDuration) {
        onUpdateTask({ ...task, duration: newDuration });
      }
    };

    const handleMouseUp = () => {
      if (resizingTaskId) {
        setResizingTaskId(null);
        resizeRef.current = null;
        ignoreClickRef.current = true;
        setTimeout(() => {
          ignoreClickRef.current = false;
        }, 100);
      }
    };

    if (resizingTaskId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingTaskId, hourHeight, tasks, onUpdateTask]);

  const handleResizeStart = (e: React.MouseEvent, task: Task) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingTaskId(task.id);
    resizeRef.current = {
      taskId: task.id,
      startY: e.clientY,
      startDuration: task.duration || 60,
    };
  };

  // --- Helpers ---
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
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
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    return [];
  };

  const getFocusSessionColor = (index: number) => {
    return FOCUS_COLORS[index % FOCUS_COLORS.length];
  };

  const getPriorityColor = (priority?: Priority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-500';
      case 'Medium':
        return 'bg-amber-500';
      case 'Low':
        return 'bg-blue-500';
      default:
        return 'bg-zinc-400';
    }
  };

  const handleDragStart = (
    e: React.DragEvent,
    id: string,
    type: 'task' | 'routine' | 'habit',
    origin: 'grid' | 'sidebar'
  ) => {
    if (resizingTaskId || mode === 'focus') {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('id', id);
    e.dataTransfer.setData('type', type);
    e.dataTransfer.setData('origin', origin);
    e.dataTransfer.effectAllowed = 'move';

    if (origin === 'sidebar' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnDay = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (mode === 'focus') return;

    const id = e.dataTransfer.getData('id');
    const type = e.dataTransfer.getData('type');
    const origin = e.dataTransfer.getData('origin');

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const pxPerMin = hourHeight / 60;
    const totalMinutes = offsetY / pxPerMin;
    const snappedMinutes = Math.round(totalMinutes / 10) * 10;
    const hour = Math.floor(snappedMinutes / 60);
    const minute = snappedMinutes % 60;

    const newStart = new Date(targetDate);
    newStart.setHours(hour, minute, 0, 0);

    if (type === 'task') {
      const task = tasks.find((t) => t.id === id);
      if (task) onUpdateTask({ ...task, startTime: newStart.getTime() });
    } else if (type === 'routine') {
      if (origin === 'sidebar') {
        onScheduleRoutine(id, newStart.getTime());
      } else if (origin === 'grid') {
        const routine = routines.find((r) => r.id === id);
        if (routine) onUpdateRoutine({ ...routine, startTime: newStart.getTime() });
      }
    } else if (type === 'habit') {
      onScheduleHabit(id, newStart.getTime());
    }
  };

  const handleDropOnMonthCell = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (mode === 'focus') return;

    const id = e.dataTransfer.getData('id');
    const type = e.dataTransfer.getData('type');
    const origin = e.dataTransfer.getData('origin');
    const newStart = new Date(targetDate);

    if (type === 'task') {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        if (task.startTime) {
          const old = new Date(task.startTime);
          newStart.setHours(old.getHours(), old.getMinutes());
        } else {
          newStart.setHours(9, 0, 0, 0);
        }
        onUpdateTask({ ...task, startTime: newStart.getTime() });
      }
    } else if (type === 'routine') {
      if (origin === 'sidebar') {
        newStart.setHours(9, 0, 0, 0);
        onScheduleRoutine(id, newStart.getTime());
      } else {
        const routine = routines.find((r) => r.id === id);
        if (routine) {
          if (routine.startTime) {
            const old = new Date(routine.startTime);
            newStart.setHours(old.getHours(), old.getMinutes());
          } else {
            newStart.setHours(9, 0, 0, 0);
          }
          onUpdateRoutine({ ...routine, startTime: newStart.getTime() });
        }
      }
    } else if (type === 'habit') {
      newStart.setHours(9, 0, 0, 0);
      onScheduleHabit(id, newStart.getTime());
    }
  };

  const handleDropOnLibrary = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverLibrary(false);
    const id = e.dataTransfer.getData('id');
    const type = e.dataTransfer.getData('type') as 'task' | 'routine' | 'habit';
    const origin = e.dataTransfer.getData('origin');

    if (origin === 'sidebar') return;
    if (type === 'habit') return;
    onUnschedule(id, type);
  };

  const handleBlockClick = (e: React.MouseEvent, item: Task | Routine, type: 'task' | 'routine') => {
    e.stopPropagation();
    if (mode === 'focus') return;
    if (ignoreClickRef.current || resizingTaskId) return;

    if (selectedBlock?.id === item.id) {
      setSelectedBlock(null);
    } else {
      setSelectedBlock({ id: item.id, type });
    }
  };

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
      <div className="flex flex-col flex-1 h-full overflow-hidden bg-[#F5F7FA]">
        <div className="grid grid-cols-7 border-b border-slate-200/60 bg-white/30 flex-shrink-0">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((h) => (
            <div
              key={h}
              className="py-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono"
            >
              {h}
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 grid-rows-6 min-h-0 bg-[#F5F7FA]/50">
          {days.map((day) => {
            const isSameMonth = day.getMonth() === month;
            const isToday = isSameDay(day, now);
            const dayTasks = tasks.filter(
              (t) => t.startTime && isSameDay(new Date(t.startTime), day) && (showCompleted || !t.isCompleted)
            );
            const dayRoutines = routines.filter((r) => r.startTime && isSameDay(new Date(r.startTime), day));

            return (
              <div
                key={day.toISOString()}
                className={`border-b border-r border-slate-200/60 p-1.5 relative flex flex-col gap-1.5 transition-colors ${
                  !isSameMonth
                    ? 'bg-transparent text-slate-600'
                    : 'bg-slate-200 hover:bg-slate-50/40'
                }`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnMonthCell(e, day)}
              >
                <div className="flex justify-center mb-1 shrink-0">
                  <span
                    className={`text-[9px] font-bold font-mono w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-rose-600 text-white shadow-[0_0_8px_#f43f5e]'
                        : isSameMonth
                        ? 'text-slate-500'
                        : 'text-slate-600'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 min-h-0">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id, 'task', 'grid')}
                      onClick={(e) => handleBlockClick(e, task, 'task')}
                      className={`flex items-center gap-1.5 text-[9px] px-1.5 py-0.5 rounded-lg border truncate cursor-pointer bg-white border-slate-200/60 hover:border-violet-500/20 shadow-sm transition-all ${
                        selectedBlock?.id === task.id ? 'ring-2 ring-violet-500' : ''
                      }`}
                      style={{ borderLeftColor: task.color || '#3b82f6', borderLeftWidth: '3px' }}
                    >
                      {task.priority && (
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPriorityColor(task.priority)}`} />
                      )}
                      <span
                        className={`truncate text-slate-700 ${
                          task.isCompleted ? 'line-through opacity-40' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                  ))}
                  {dayRoutines.map((routine) => (
                    <div
                      key={routine.id}
                      draggable={!routine.completedAt}
                      onDragStart={(e) => handleDragStart(e, routine.id, 'routine', 'grid')}
                      onClick={(e) => handleBlockClick(e, routine, 'routine')}
                      className={`text-[9px] px-1.5 py-0.5 rounded-lg border truncate cursor-pointer bg-slate-50 border-violet-200 text-[#8979FF] font-bold ${
                        selectedBlock?.id === routine.id ? 'ring-2 ring-violet-500' : ''
                      }`}
                      style={{
                        backgroundColor: routine.id.startsWith('habit-') ? routine.color + '15' : undefined,
                      }}
                    >
                      {routine.title}
                    </div>
                  ))}
                </div>
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
      <div className="flex flex-col flex-1 min-h-0 bg-[#F5F7FA] relative select-none">
        {/* Days Header */}
        <div className="flex border-b border-slate-200/60 bg-white/85 backdrop-blur-md z-20 shrink-0 shadow-md">
          <div className="w-[50px] md:w-[60px] border-r border-slate-200/60 shrink-0 sticky left-0 z-30" />
          <div ref={headerContainerRef} className="flex-1 overflow-hidden">
            <div className="grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
              {days.map((day) => {
                const isToday = isSameDay(day, now);
                return (
                  <div
                    key={day.toISOString()}
                    className={`py-2 md:py-3 px-1 md:px-2 text-center border-r border-slate-200/60 last:border-0 group ${minColWidth}`}
                  >
                    <div
                      className={`text-[9px] md:text-[10px] font-bold font-mono uppercase mb-1 ${
                        isToday ? 'text-rose-500' : 'text-slate-400'
                      }`}
                    >
                      <span className="md:hidden">
                        {day.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </span>
                      <span className="hidden md:inline">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                    </div>
                    <div
                      className={`text-base md:text-lg font-bold w-7 h-7 md:w-8 md:h-8 flex items-center justify-center mx-auto rounded-full transition-all ${
                        isToday
                          ? 'bg-rose-600 text-white shadow-[0_0_8px_#f43f5e]'
                          : 'text-slate-500 group-hover:text-slate-900'
                      }`}
                    >
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable grid body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleBodyScroll}
          className="flex-1 overflow-y-auto overflow-x-auto no-scrollbar relative"
        >
          <div className="flex" style={{ height: `${24 * hourHeight}px` }}>
            {/* Time labels column */}
            <div className="w-[50px] md:w-[60px] border-r border-slate-200/60 bg-[#F5F7FA] shrink-0 sticky left-0 z-50">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="relative border-b border-transparent box-border"
                  style={{ height: `${hourHeight}px` }}
                >
                  <span className="absolute -top-2.5 right-1 md:right-2 text-[9px] md:text-[10px] text-slate-400 font-bold font-mono">
                    {hour === 0
                      ? ''
                      : hour < 12
                      ? `${hour} AM`
                      : hour === 12
                      ? '12 PM'
                      : `${hour - 12} PM`}
                  </span>
                </div>
              ))}

              {(isSameDay(now, days[0]) || days.length > 1) && (
                <div
                  className="absolute right-0 z-50 pointer-events-none flex items-center justify-end pr-2"
                  style={{ top: `${redLineTop}px`, transform: 'translateY(-50%)', width: '100%' }}
                >
                  <span className="text-[9px] font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-lg font-mono">
                    {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </span>
                  <div className="absolute -right-[4px] w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0a0a0f] z-10" />
                </div>
              )}
            </div>

            {/* Grid Days Columns */}
            <div
              className={`flex-1 grid relative ${gridMinWidth}`}
              style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
            >
              <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
                {hours.map((h) => (
                  <div
                    key={h}
                    className="border-b border-slate-200/60 w-full box-border"
                    style={{ height: `${hourHeight}px` }}
                  >
                    {hourHeight > 80 && (
                      <div
                        className="w-full border-b border-white/[0.02] border-dashed"
                        style={{ height: `${hourHeight / 2}px` }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {(isSameDay(now, days[0]) || days.length > 1) && (
                <div
                  className="absolute left-0 right-0 z-30 pointer-events-none"
                  style={{ top: `${redLineTop}px` }}
                >
                  <div className="h-[1.5px] bg-rose-500 w-full shadow-[0_0_8px_#f43f5e]" />
                </div>
              )}

              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`relative border-r border-slate-200/60 last:border-0 z-10 h-full ${minColWidth}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnDay(e, day)}
                >
                  {mode === 'scheduled' && (
                    <>
                      {tasks
                        .filter(
                          (t) =>
                            t.startTime &&
                            isSameDay(new Date(t.startTime!), day) &&
                            (showCompleted || !t.isCompleted)
                        )
                        .map((task) => {
                          const date = new Date(task.startTime!);
                          const top = (date.getHours() * 60 + date.getMinutes()) * pxPerMin;
                          const height = (task.duration || 60) * pxPerMin;
                          const endTime = new Date(task.startTime! + (task.duration || 60) * 60000);
                          const linkedProject = task.projectId
                            ? projects.find((p) => p.id === task.projectId)
                            : null;
                          const isSelected = selectedBlock?.id === task.id;

                          return (
                            <div
                              key={task.id}
                              draggable={resizingTaskId !== task.id}
                              onDragStart={(e) => handleDragStart(e, task.id, 'task', 'grid')}
                              onClick={(e) => handleBlockClick(e, task, 'task')}
                              className={`absolute left-0.5 right-0.5 md:left-1 md:right-1 rounded-xl p-2 text-xs transition-all z-20 overflow-hidden flex flex-col justify-between border border-slate-200 group shadow-md
                                ${
                                  resizingTaskId === task.id
                                    ? 'cursor-ns-resize !scale-100 z-30 shadow-2xl ring-2 ring-violet-500/50'
                                    : 'cursor-pointer'
                                }
                                ${
                                  isSelected
                                    ? 'ring-2 ring-violet-500 z-30 scale-[1.02] shadow-2xl shadow-violet-500/10'
                                    : ''
                                }
                                ${task.isCompleted ? 'opacity-40 border-dashed' : ''}
                              `}
                              style={{
                                top: `${top}px`,
                                height: `${Math.max(height, hourHeight * 0.45)}px`,
                                backgroundColor: task.color || '#3b82f6',
                                color: '#ffffff',
                              }}
                            >
                              <div className="flex flex-col h-full relative">
                                <div className="flex items-center gap-1.5 min-w-0 mb-0.5">
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${getPriorityColor(
                                      task.priority
                                    )} ring-1 ring-white/30`}
                                  />
                                  <span
                                    className={`font-bold truncate text-[10px] leading-tight flex-1 ${
                                      task.isCompleted ? 'line-through opacity-70' : ''
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                  {task.isCompleted && <CheckCircle2 size={10} className="shrink-0" />}
                                </div>

                                <div className="text-[8px] font-bold font-mono opacity-80 leading-none truncate mb-1">
                                  {date
                                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                                    .toLowerCase()}
                                  -
                                  {endTime
                                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                                    .toLowerCase()}
                                </div>

                                {height > 40 && (
                                  <div className="mt-auto flex items-center gap-1 overflow-hidden pt-0.5">
                                    <span className="text-[7px] font-bold uppercase tracking-wider bg-black/25 px-1 rounded truncate">
                                      {task.category}
                                    </span>
                                    {linkedProject && (
                                      <span className="text-[7px] bg-slate-200 px-1 rounded flex items-center gap-0.5 truncate max-w-[50%]">
                                        <Briefcase size={8} /> {linkedProject.title}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {!task.isCompleted && (
                                <div
                                  onMouseDown={(e) => handleResizeStart(e, task)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/20 to-transparent"
                                >
                                  <div className="w-8 h-1 bg-slate-100/500 rounded-full" />
                                </div>
                              )}
                            </div>
                          );
                        })}

                      {routines
                        .filter((r) => r.startTime && isSameDay(new Date(r.startTime!), day))
                        .map((routine) => {
                          const date = new Date(routine.startTime!);
                          const durationMins = Math.ceil(
                            routine.steps.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
                          );
                          const top = (date.getHours() * 60 + date.getMinutes()) * pxPerMin;
                          const height = durationMins * pxPerMin;
                          const endTime = new Date(routine.startTime! + durationMins * 60000);
                          const isHabit = routine.id.startsWith('habit-');
                          const isSelected = selectedBlock?.id === routine.id;

                          return (
                            <div
                              key={routine.id}
                              draggable={!routine.completedAt}
                              onDragStart={(e) => handleDragStart(e, routine.id, 'routine', 'grid')}
                              onClick={(e) => handleBlockClick(e, routine, 'routine')}
                              className={`absolute left-0.5 right-0.5 md:left-1 md:right-1 rounded-xl p-2 text-xs transition-all z-20 overflow-hidden flex flex-col justify-start border border-slate-200 cursor-pointer shadow-md
                                ${routine.completedAt ? 'opacity-40 border-dashed' : 'hover:brightness-95'}
                                ${
                                  isSelected
                                    ? 'ring-2 ring-violet-500 z-30 scale-[1.02] shadow-2xl shadow-violet-500/10'
                                    : ''
                                }
                              `}
                              style={{
                                top: `${top}px`,
                                height: `${Math.max(height, hourHeight * 0.45)}px`,
                                backgroundColor: isHabit ? routine.color : '#7c3aed',
                                color: '#ffffff',
                              }}
                            >
                              <div className="flex flex-col h-full relative">
                                <div className="flex items-start justify-between mb-0.5 opacity-90 text-[10px]">
                                  <div className="font-bold truncate leading-tight text-[10px] md:text-[11px] flex-1 text-slate-900">
                                    {routine.title}
                                  </div>
                                  {routine.completedAt && (
                                    <CheckCircle2 size={10} className="shrink-0 ml-1" />
                                  )}
                                </div>
                                <div className="text-[8px] font-bold font-mono opacity-80 leading-none truncate">
                                  {date
                                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                                    .toLowerCase()}
                                  -
                                  {endTime
                                    .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                                    .toLowerCase()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </>
                  )}

                  {mode === 'focus' && (
                    <>
                      {focusSessions
                        .filter((session) => isSameDay(new Date(session.startTime), day))
                        .map((session, index) => {
                          const date = new Date(session.startTime);
                          const durationMins = Math.max(10, session.durationSeconds / 60);
                          const top = (date.getHours() * 60 + date.getMinutes()) * pxPerMin;
                          const height = durationMins * pxPerMin;
                          return (
                            <div
                              key={session.id}
                              className="absolute left-1 right-1 rounded-xl p-2 text-xs shadow-md border border-slate-200 pointer-events-none text-slate-900"
                              style={{
                                top: `${top}px`,
                                height: `${Math.max(height, hourHeight * 0.45)}px`,
                                backgroundColor: getFocusSessionColor(index),
                              }}
                            >
                              <div className="flex flex-col justify-between h-full">
                                <div className="font-bold truncate leading-tight text-[10px] md:text-[11px]">
                                  {session.routineTitle}
                                </div>
                                <div className="text-[8px] font-bold font-mono opacity-80 leading-none">
                                  {durationMins.toFixed(0)}m focused
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-20" />

        {/* Mobile Floating Zoom/Scroll Controllers */}
        {!selectedBlock && (
          <div className="md:hidden absolute right-4 bottom-20 z-30 flex flex-col gap-3 pointer-events-none">
            <div className="bg-white/90 border border-slate-200 backdrop-blur-md shadow-xl rounded-2xl flex flex-col pointer-events-auto overflow-hidden">
              <button
                onClick={() => handleZoom(10)}
                className="p-3 text-slate-500 active:bg-slate-100/50 border-b border-slate-200/60 flex items-center justify-center"
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={() => handleZoom(-10)}
                className="p-3 text-slate-500 active:bg-slate-100/50 flex items-center justify-center"
              >
                <ZoomOut size={18} />
              </button>
            </div>
            <div className="bg-white/95 border border-slate-200 backdrop-blur-md text-slate-900 shadow-xl rounded-2xl flex flex-col pointer-events-auto overflow-hidden">
              <button
                onClick={() => handleScroll(-hourHeight * 3)}
                className="p-3 active:bg-slate-100/50 border-b border-slate-200/60 flex items-center justify-center"
              >
                <ChevronUp size={18} />
              </button>
              <button
                onClick={() => handleScroll(hourHeight * 3)}
                className="p-3 active:bg-slate-100/50 flex items-center justify-center"
              >
                <ChevronDown size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-[#F5F7FA]">
      {/* Calendar Header Controls */}
      {/* ── Header matching Frame132 header-notes ──────────── */}
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex', flexDirection: 'column', gap: 16,
          flexShrink: 0, background: '#F5F7FA',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 2, alignItems: 'center' }}>
              <button
                onClick={() => navigate('prev')}
                style={{ padding: 4, borderRadius: 6, color: '#64748B', background: 'transparent', border: 'none', cursor: 'pointer' }}
                className="hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                style={{ padding: '4px 8px', fontSize: 10, fontWeight: 700, color: '#1E1E1E', background: 'transparent', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                className="hover:bg-slate-100 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigate('next')}
                style={{ padding: 4, borderRadius: 6, color: '#64748B', background: 'transparent', border: 'none', cursor: 'pointer' }}
                className="hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1E1E1E', letterSpacing: '-0.03em' }}>
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="hidden md:flex" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 2, alignItems: 'center' }}>
              {view !== 'month' && (
                <>
                  <button
                    onClick={() => setHourHeight(Math.max(40, hourHeight - 10))}
                    style={{ padding: 4, borderRadius: 6, color: '#64748B', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    className="hover:bg-slate-100 transition-colors"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <button
                    onClick={() => setHourHeight(Math.min(150, hourHeight + 10))}
                    style={{ padding: 4, borderRadius: 6, color: '#64748B', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    className="hover:bg-slate-100 transition-colors"
                  >
                    <ZoomIn size={16} />
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="loah-icon-btn"
              style={{
                background: isDraggingOverLibrary ? 'rgba(239, 68, 68, 0.1)' : isSidebarOpen ? 'rgba(137,121,255,0.1)' : '#FFFFFF',
                borderColor: isDraggingOverLibrary ? '#EF4444' : isSidebarOpen ? '#8979FF' : '#E2E8F0',
                color: isDraggingOverLibrary ? '#EF4444' : isSidebarOpen ? '#8979FF' : '#64748B',
                width: 'auto', padding: '0 12px', gap: 6, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingOverLibrary(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDraggingOverLibrary(false); }}
              onDrop={handleDropOnLibrary}
            >
              {isDraggingOverLibrary ? <X size={16} /> : <PanelLeft size={16} />}
              <span style={{ fontSize: 12, fontWeight: 700 }}>
                {isDraggingOverLibrary ? 'Drop to Unschedule' : 'Library'}
              </span>
            </button>
          </div>
        </div>

        {/* Filters/Tabs Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 3, alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => setMode('scheduled')}
              style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: mode === 'scheduled' ? '#F1F5F9' : 'transparent',
                color: mode === 'scheduled' ? '#1E1E1E' : '#64748B',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <LayoutGrid size={12} /> Plan
            </button>
            <button
              onClick={() => setMode('focus')}
              style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: mode === 'focus' ? '#F1F5F9' : 'transparent',
                color: mode === 'focus' ? '#1E1E1E' : '#64748B',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <Focus size={12} /> Focus
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: showCompleted ? 'rgba(16, 185, 129, 0.1)' : '#FFFFFF',
                color: showCompleted ? '#10B981' : '#64748B',
                border: `1px solid ${showCompleted ? '#10B981' : '#E2E8F0'}`,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              {showCompleted ? <Eye size={12} /> : <EyeOff size={12} />}
              Done Tasks
            </button>

            <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 8, padding: 3, alignItems: 'center', gap: 4 }}>
              {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                    background: view === v ? '#F1F5F9' : 'transparent',
                    color: view === v ? '#1E1E1E' : '#64748B',
                    border: 'none', cursor: 'pointer'
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative min-h-0 bg-[#F5F7FA]">
        {/* Sidebar Library */}
        <div
          className={`border-r border-slate-200/60 bg-white/60 backdrop-blur-xl flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden flex flex-col absolute md:relative z-[60] h-full
            ${isSidebarOpen ? 'w-72 opacity-100 shadow-2xl md:shadow-none' : 'w-0 border-r-0 opacity-0'}
          `}
        >
          <div className="w-72 flex flex-col h-full">
            <div className="p-4 border-b border-slate-200/60 flex justify-between items-center bg-white/80">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Book size={16} className="text-violet-400" /> Item Library
              </h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pb-32">
              {/* Tasks List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Unscheduled Tasks
                  </h4>
                  <span className="bg-slate-100/50 text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold">
                    {pendingTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id, 'task', 'sidebar')}
                      className="bg-white border border-slate-200/60 p-3 rounded-xl text-xs hover:border-violet-500/20 cursor-grab active:cursor-grabbing transition-all flex items-center justify-between shadow-sm"
                      style={{ borderLeftColor: task.color || '#3b82f6', borderLeftWidth: '3.5px' }}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-bold text-slate-900 truncate">{task.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-400 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {task.duration || 30}m
                          </span>
                          {task.priority && (
                            <span className="uppercase text-[8px] bg-slate-100/50 px-1.5 py-0.5 rounded text-slate-500">
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickScheduleTask(task)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-colors shrink-0"
                        title="Quick Schedule (+1h)"
                      >
                        <CalendarPlus size={16} />
                      </button>
                    </div>
                  ))}
                  {pendingTasks.length === 0 && (
                    <p className="text-[10px] text-slate-500 italic text-center py-4">
                      No pending tasks
                    </p>
                  )}
                </div>
              </div>

              {/* Routines List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Flow Routines
                  </h4>
                  <span className="bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold">
                    {recurringRoutines.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {recurringRoutines.map((routine) => (
                    <div
                      key={routine.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, routine.id, 'routine', 'sidebar')}
                      className="bg-white border border-slate-200/60 p-3 rounded-xl text-xs hover:border-violet-500/20 cursor-grab active:cursor-grabbing transition-all flex items-center justify-between shadow-sm"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="font-bold text-slate-900 truncate">{routine.title}</div>
                        <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-400 font-mono">
                          <Layers size={10} /> {routine.steps.length} Steps
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickScheduleRoutine(routine)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-colors shrink-0"
                        title="Quick Schedule (+1h)"
                      >
                        <CalendarPlus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Habits List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Habits Library
                  </h4>
                  <span className="bg-slate-100/50 text-slate-500 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold">
                    {habits.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, habit.id, 'habit', 'sidebar')}
                      className="bg-white border border-slate-200/60 p-3 rounded-xl text-xs hover:border-violet-500/20 cursor-grab active:cursor-grabbing transition-all flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shadow shrink-0"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="truncate font-bold text-slate-700">{habit.title}</span>
                      </div>
                      <button
                        onClick={() => handleQuickScheduleHabit(habit)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100/50 rounded-lg transition-colors shrink-0"
                        title="Quick Schedule (+1h)"
                      >
                        <CalendarPlus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid View */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#F5F7FA] relative">
          {view === 'month' ? renderMonthGrid() : renderTimeGrid(getDaysToRender())}
        </div>
      </div>

      {/* Mobile Touch Control Panel */}
      {selectedBlock && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200 backdrop-blur-xl shadow-2xl z-[100] pb-safe animate-slide-in-up">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
              <div className="flex items-center gap-2">
                <Move size={16} className="text-violet-400" />
                <span className="font-bold text-slate-900 truncate max-w-[200px] text-sm">
                  {selectedBlock.type === 'task'
                    ? tasks.find((t) => t.id === selectedBlock.id)?.title
                    : routines.find((r) => r.id === selectedBlock.id)?.title}
                </span>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="p-1.5 hover:bg-slate-100/50 rounded-full text-slate-500 hover:text-slate-900"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Direction Pad */}
              <div className="bg-[#F5F7FA] p-3 rounded-2xl border border-slate-200/60 flex flex-col items-center justify-center gap-2">
                <button
                  onClick={() => moveSelectedItem(-15)}
                  className="p-2 bg-slate-100/50 border border-slate-200/60 rounded-lg hover:bg-slate-100 active:scale-95 text-slate-900"
                  title="Move Up 15m"
                >
                  <ArrowUp size={18} />
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => shiftSelectedItemDay(-1)}
                    className="p-2 bg-slate-100/50 border border-slate-200/60 rounded-lg hover:bg-slate-100 active:scale-95 text-slate-900"
                    title="Move Back 1 Day"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-10 h-10 flex items-center justify-center text-xs font-bold text-slate-400 font-mono">
                    <Clock size={16} />
                  </div>
                  <button
                    onClick={() => shiftSelectedItemDay(1)}
                    className="p-2 bg-slate-100/50 border border-slate-200/60 rounded-lg hover:bg-slate-100 active:scale-95 text-slate-900"
                    title="Move Forward 1 Day"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
                <button
                  onClick={() => moveSelectedItem(15)}
                  className="p-2 bg-slate-100/50 border border-slate-200/60 rounded-lg hover:bg-slate-100 active:scale-95 text-slate-900"
                  title="Move Down 15m"
                >
                  <ArrowDown size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {/* Duration Controls for Tasks */}
                {selectedBlock.type === 'task' ? (
                  <div className="bg-[#F5F7FA] border border-slate-200/60 p-3 rounded-2xl flex items-center justify-between h-[64px]">
                    <button
                      onClick={() => resizeSelectedItem(-15)}
                      className="p-2 bg-slate-100/50 border border-slate-200/60 rounded-lg text-slate-900 active:scale-95 hover:bg-slate-100"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Length
                    </span>
                    <button
                      onClick={() => resizeSelectedItem(15)}
                      className="p-2 bg-slate-100/50 border border-slate-200/60 rounded-lg text-slate-900 active:scale-95 hover:bg-slate-100"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#F5F7FA] border border-slate-200/60 p-3 rounded-2xl flex items-center justify-center text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest h-[64px]">
                    Fixed Flow Time
                  </div>
                )}

                {/* Unschedule / Play */}
                <div className="flex gap-2 flex-1">
                  <button
                    onClick={unscheduleSelectedItem}
                    className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl flex flex-col items-center justify-center font-bold text-[10px] uppercase tracking-wider font-mono gap-1 active:scale-95 transition-all"
                  >
                    <CalendarOff size={16} /> Unschedule
                  </button>
                  <button
                    onClick={startSelectedItem}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-slate-900 rounded-xl flex flex-col items-center justify-center font-bold text-[10px] uppercase tracking-wider font-mono gap-1 active:scale-95 transition-all shadow-lg shadow-violet-500/10 border border-slate-200"
                  >
                    <PlayCircle size={16} /> Focus
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarModule;
