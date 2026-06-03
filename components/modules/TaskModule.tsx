'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Task, Priority, Subtask, Reminder, RecurrenceConfig } from '../../types';
import {
  Plus,
  Trash2,
  Play,
  CheckSquare,
  Calendar,
  Clock,
  X,
  Palette,
  Archive,
  Briefcase,
  CalendarClock,
  Search,
  ListTodo,
  ArrowUpAZ,
  ArrowDown01,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Modal from '../ui/Modal';

import { useRouter } from 'next/navigation';

type GroupingMode = 'date' | 'priority' | 'project';
type SortMode = 'time' | 'priority' | 'alpha';
type ViewMode = 'list' | 'board';

const TASK_COLORS = [
  '#7c3aed', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#f43f5e', // Rose
  '#a78bfa', // Purple Light
  '#64748b', // Slate
  '#1e1b4b', // Dark Indigo
];

export const TaskModule: React.FC = () => {
  const router = useRouter();
  const tasks = useAppStore((state) => state.tasks);
  const projects = useAppStore((state) => state.projects);
  const convertingDump = useAppStore((state) => state.convertingDump);
  const autoTrigger = useAppStore((state) => state.triggerTaskModal);

  const onAddTask = useAppStore((state) => state.handleAddTask);
  const onUpdateTask = useAppStore((state) => state.handleUpdateTask);
  const onDeleteTask = useAppStore((state) => state.handleDeleteTask);
  const onStartTask = useAppStore((state) => state.startTaskFocus);
  const onToggleTask = useAppStore((state) => state.toggleTask);
  const onArchiveTask = (id: string) => useAppStore.getState().handleArchive(id, 'task');
  const onUnarchiveTask = (id: string) => useAppStore.getState().handleUnarchive(id, 'task');
  const onClearConvertingDump = () => useAppStore.getState().setConvertingDump(null);
  const onConvertComplete = useAppStore((state) => state.handleConvertComplete);
  const onAutoTriggerHandled = () => useAppStore.getState().setTriggerTaskModal(false);

  // Modal State (kept legacy definitions to avoid compile/type breaks, but unused now)
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);

  // View State
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [grouping, setGrouping] = React.useState<GroupingMode>('date');
  const [sortBy, setSortBy] = React.useState<SortMode>('time');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showArchived, setShowArchived] = React.useState(false);
  const [showCompleted, setShowCompleted] = React.useState(false);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  // Form State
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<Priority>('Medium');
  const [category, setCategory] = React.useState('Personal');
  const [duration, setDuration] = React.useState('30');
  const [projectId, setProjectId] = React.useState('');
  const [subtasks, setSubtasks] = React.useState<Subtask[]>([]);
  const [subtaskInput, setSubtaskInput] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(TASK_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [scheduledDate, setScheduledDate] = React.useState('');
  const [scheduledTime, setScheduledTime] = React.useState('');

  // Recurrence State
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [recurrenceType, setRecurrenceType] = React.useState<'daily' | 'weekly' | 'monthly' | 'specific_days'>('daily');
  const [recurrenceInterval, setRecurrenceInterval] = React.useState(1);
  const [recurrenceInstances, setRecurrenceInstances] = React.useState(5);
  const [recurrenceDays, setRecurrenceDays] = React.useState<number[]>([]);

  // Reminder State
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [newReminderOffset, setNewReminderOffset] = React.useState(15);

  const activeTasks = React.useMemo(() => tasks.filter((t) => !t.deletedAt && !t.archivedAt), [tasks]);
  const archivedTasks = React.useMemo(() => tasks.filter((t) => !t.deletedAt && t.archivedAt), [tasks]);

  let visibleTasks: Task[] = [];
  if (showArchived) {
    visibleTasks = archivedTasks;
  } else if (showCompleted) {
    visibleTasks = activeTasks.filter((t) => t.isCompleted);
  } else {
    visibleTasks = activeTasks.filter((t) => !t.isCompleted);
  }

  const availableProjects = React.useMemo(() => {
    return projects.filter((p) => !p.deletedAt && !p.archivedAt);
  }, [projects]);

  React.useEffect(() => {
    if (convertingDump) {
      router.push('/tasks/new' as any);
    }
  }, [convertingDump]);

  React.useEffect(() => {
    if (autoTrigger) {
      router.push('/tasks/new' as any);
      onAutoTriggerHandled();
    }
  }, [autoTrigger]);

  const openModal = (task?: Task, defaultDate?: string) => {
    if (task) {
      router.push(`/tasks/edit?id=${task.id}` as any);
    } else {
      if (defaultDate) {
        router.push(`/tasks/new?date=${defaultDate}` as any);
      } else {
        router.push(`/tasks/new` as any);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    onClearConvertingDump();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setCategory('Personal');
    setDuration('30');
    setSubtasks([]);
    setSubtaskInput('');
    setShowColorPicker(false);
    setProjectId('');
    setScheduledDate('');
    setScheduledTime('');
    setIsRecurring(false);
    setRecurrenceType('daily');
    setRecurrenceInterval(1);
    setRecurrenceInstances(5);
    setRecurrenceDays([]);
    setReminders([]);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    let startTime: number | undefined = undefined;
    if (scheduledDate) {
      const d = new Date(scheduledDate);
      if (scheduledTime) {
        const [h, m] = scheduledTime.split(':').map(Number);
        d.setHours(h, m, 0, 0);
      } else {
        d.setHours(9, 0, 0, 0);
      }
      startTime = d.getTime();
    }

    const recurrence: RecurrenceConfig | undefined = isRecurring
      ? {
          type: recurrenceType,
          interval: recurrenceInterval,
          daysOfWeek: recurrenceType === 'specific_days' ? recurrenceDays : undefined,
          instancesToGenerate: recurrenceInstances,
        }
      : undefined;

    const taskData: Partial<Task> = {
      title,
      description,
      priority,
      category,
      duration: parseInt(duration) || 30,
      projectId: projectId || undefined,
      subtasks,
      color: selectedColor,
      startTime,
      recurrence,
      reminders,
    };

    if (editingTaskId) {
      const existing = tasks.find((t) => t.id === editingTaskId);
      if (existing) onUpdateTask({ ...existing, ...taskData });
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        isCompleted: false,
        createdAt: Date.now(),
        color: selectedColor,
        title,
        priority,
        category,
        description,
        duration: parseInt(duration) || 30,
        subtasks,
        projectId: projectId || undefined,
        startTime,
        recurrence,
        reminders,
      };
      onAddTask(newTask);
    }

    if (convertingDump) {
      onConvertComplete();
    }

    setIsModalOpen(false);
    resetForm();
  };

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: Date.now().toString() + Math.random(),
        title: subtaskInput,
        isCompleted: false,
      },
    ]);
    setSubtaskInput('');
  };

  const toggleSubtask = (id: string) =>
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s))
    );

  const removeSubtask = (id: string) => setSubtasks(subtasks.filter((s) => s.id !== id));

  const addReminder = () => {
    setReminders([
      ...reminders,
      {
        id: Date.now().toString(),
        timeOffset: newReminderOffset,
        type: 'notification',
      },
    ]);
  };

  const removeReminder = (id: string) => setReminders(reminders.filter((r) => r.id !== id));

  const getTaskDateCategory = (timestamp?: number) => {
    if (!timestamp) return 'no_date';
    const date = new Date(timestamp);
    const nowToday = new Date();
    const todayStart = new Date(nowToday.getFullYear(), nowToday.getMonth(), nowToday.getDate());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    const nextWeekStart = new Date(todayStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    const tDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (tDate < todayStart) return 'overdue';
    if (tDate.getTime() === todayStart.getTime()) return 'today';
    if (tDate.getTime() === tomorrowStart.getTime()) return 'tomorrow';
    if (tDate < nextWeekStart) return 'upcoming';
    return 'later';
  };

  const groupedTasks = React.useMemo(() => {
    const groups: Record<string, Task[]> = {};
    const filtered = visibleTasks.filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (grouping === 'date') {
      groups['overdue'] = [];
      groups['today'] = [];
      groups['tomorrow'] = [];
      groups['upcoming'] = [];
      groups['later'] = [];
      groups['no_date'] = [];
    } else if (grouping === 'priority') {
      groups['High'] = [];
      groups['Medium'] = [];
      groups['Low'] = [];
    } else if (grouping === 'project') {
      projects.forEach((p) => (groups[p.id] = []));
      groups['no_project'] = [];
    }

    filtered.forEach((task) => {
      let key = '';
      if (grouping === 'date') key = getTaskDateCategory(task.startTime);
      else if (grouping === 'priority') key = task.priority;
      else if (grouping === 'project') key = task.projectId || 'no_project';

      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => {
        if (sortBy === 'priority') {
          const pMap = { High: 3, Medium: 2, Low: 1 };
          return pMap[b.priority] - pMap[a.priority];
        } else if (sortBy === 'time') {
          return (a.startTime || 9999999999999) - (b.startTime || 9999999999999);
        } else {
          return a.title.localeCompare(b.title);
        }
      });
    });

    return groups;
  }, [visibleTasks, searchQuery, grouping, sortBy, projects]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: prev[key] === false ? true : false }));
  };

  const getGroupTitle = (key: string) => {
    switch (key) {
      case 'overdue':
        return showCompleted ? 'Past Due' : 'Overdue Tasks';
      case 'today':
        return 'Due Today';
      case 'tomorrow':
        return 'Due Tomorrow';
      case 'upcoming':
        return 'Upcoming (Next 7 Days)';
      case 'later':
        return 'Later';
      case 'no_date':
        return 'No Scheduled Date';
      case 'no_project':
        return 'No Project';
      default:
        const proj = projects.find((p) => p.id === key);
        return proj ? proj.title : key;
    }
  };

  const getSortedGroupKeys = () => {
    const keys = Object.keys(groupedTasks).filter(
      (k) => groupedTasks[k].length > 0 || ['overdue', 'today', 'tomorrow'].includes(k)
    );
    if (grouping === 'date') {
      const order = ['overdue', 'today', 'tomorrow', 'upcoming', 'later', 'no_date'];
      return keys.sort((a, b) => {
        const ixA = order.indexOf(a);
        const ixB = order.indexOf(b);
        if (ixA !== -1 && ixB !== -1) return ixA - ixB;
        if (ixA !== -1) return -1;
        if (ixB !== -1) return 1;
        return 0;
      });
    }
    return keys;
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const isCompleted = task.isCompleted;
    const project = projects.find((p) => p.id === task.projectId);
    const subtaskCount = task.subtasks ? task.subtasks.length : 0;
    const subtaskDone = task.subtasks
      ? task.subtasks.filter((s) => s.isCompleted).length
      : 0;
    const isOverdue = task.startTime && task.startTime < Date.now() && !isCompleted;

    return (
      <div
        onClick={() => openModal(task)}
        className={`group relative bg-[#1a1a26]/40 hover:bg-[#1a1a26]/70 border rounded-2xl p-4 transition-all duration-300 cursor-pointer flex flex-col gap-3
          ${isCompleted ? 'opacity-50 border-white/5 bg-white/[0.02]' : 'border-white/5 hover:border-violet-500/25'}
          ${isOverdue && !isCompleted ? 'border-rose-500/30 bg-rose-500/5' : ''}`}
      >
        {/* Color accent vertical line */}
        <div
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md"
          style={{ backgroundColor: task.color || '#fff' }}
        />

        <div className="flex items-start gap-3 pl-2">
          {/* Check Box */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleTask(task.id);
            }}
            className={`mt-1 shrink-0 transition-colors ${
              isCompleted ? 'text-emerald-500' : 'text-zinc-500 hover:text-white'
            }`}
          >
            {isCompleted ? (
              <CheckSquare size={20} />
            ) : (
              <div className="w-5 h-5 border border-current rounded-lg" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4
                className={`text-sm md:text-base font-bold text-[#f1f0ff] leading-snug group-hover:text-white ${
                  isCompleted ? 'line-through opacity-50' : ''
                }`}
              >
                {task.title}
              </h4>
              <div className="flex gap-1 shrink-0 pl-2">
                {!isCompleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartTask(task);
                    }}
                    className="p-1.5 bg-violet-600/90 hover:bg-violet-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Start Focus"
                  >
                    <Play size={12} fill="currentColor" />
                  </button>
                )}
                {isCompleted ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnarchiveTask(task.id);
                    }}
                    className="p-1.5 hover:bg-white/5 text-zinc-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Restore Task"
                  >
                    <Archive size={12} />
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchiveTask(task.id);
                    }}
                    className="p-1.5 hover:bg-white/5 text-zinc-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Archive Task"
                  >
                    <Archive size={12} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  className="p-1.5 hover:bg-rose-500/10 text-zinc-500 hover:text-rose-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Task"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {task.description && (
              <p className="text-xs text-[var(--text-secondary)] mt-1 font-light line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {task.startTime && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 font-mono
                    ${isOverdue && !isCompleted ? 'bg-rose-500/15 text-rose-300' : 'bg-white/5 text-zinc-400'}`}
                >
                  {isOverdue && !isCompleted && <AlertCircle size={10} />}
                  <Calendar size={10} />
                  {new Date(task.startTime).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                  {new Date(task.startTime).getHours() !== 9 && (
                    <span className="opacity-75">
                      {' '}
                      {new Date(task.startTime).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </span>
              )}
              <Badge
                variant={
                  task.priority === 'High'
                    ? 'rose'
                    : task.priority === 'Medium'
                    ? 'amber'
                    : 'cyan'
                }
              >
                {task.priority}
              </Badge>
              {project && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-300 flex items-center gap-1 max-w-[100px] truncate border border-violet-500/10">
                  <Briefcase size={8} /> {project.title}
                </span>
              )}
              {subtaskCount > 0 && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 text-zinc-400 flex items-center gap-1 border border-white/5">
                  <ListTodo size={8} /> {subtaskDone}/{subtaskCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const activeKeys = getSortedGroupKeys();

    if (viewMode === 'board') {
      return (
        <div className="flex h-full overflow-x-auto snap-x snap-mandatory p-4 md:p-6 gap-4 items-start no-scrollbar">
          {activeKeys.map((key) => (
            <div
              key={key}
              className="flex-shrink-0 w-[85vw] md:w-80 snap-center flex flex-col h-full max-h-full bg-[#12121a]/60 rounded-2xl border border-white/5"
            >
              <div
                className={`p-3 border-b border-white/5 flex justify-between items-center rounded-t-2xl sticky top-0 z-10 bg-[#12121a]/95`}
              >
                <h3
                  className={`font-black text-xs uppercase tracking-wider ${
                    key === 'overdue' ? 'text-rose-400' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {getGroupTitle(key)}
                </h3>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono ${
                    key === 'overdue'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-white/5 text-zinc-400'
                  }`}
                >
                  {groupedTasks[key].length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar pb-24">
                {groupedTasks[key].map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {!showCompleted && !showArchived && (
                  <button
                    onClick={() =>
                      openModal(
                        undefined,
                        key === 'tomorrow'
                          ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
                          : key === 'today'
                          ? new Date().toISOString().split('T')[0]
                          : undefined
                      )
                    }
                    className="w-full py-3 border border-dashed border-white/10 hover:border-violet-500/30 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Plus size={14} /> Add Task
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      // List View
      return (
        <div className="h-full overflow-y-auto no-scrollbar">
          <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-32">
            {activeKeys.map((key) => {
              const isExpanded = expandedGroups[key] !== true; // Default true (expanded when not explicitly set to true as false)
              const isOverdueGroup = key === 'overdue';
              const count = groupedTasks[key].length;

              if (count === 0 && !['overdue', 'today', 'tomorrow'].includes(key)) {
                return null;
              }

              return (
                <div key={key} className="animate-[fadeIn_0.2s_ease-out]">
                  <button
                    onClick={() => toggleGroup(key)}
                    className={`flex items-center gap-2 w-full mb-3 group ${
                      isOverdueGroup && count > 0 ? 'text-rose-400' : 'text-white'
                    }`}
                  >
                    <div
                      className={`p-1 rounded-md transition-colors ${
                        isExpanded
                          ? isOverdueGroup && count > 0
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-white/10 text-white'
                          : 'bg-white/5 text-zinc-500 group-hover:bg-white/10'
                      }`}
                    >
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                    <h3 className="font-extrabold uppercase tracking-widest text-xs">
                      {getGroupTitle(key)}
                    </h3>
                    <div
                      className={`h-px flex-1 ml-2 ${
                        isOverdueGroup && count > 0 ? 'bg-rose-500/10' : 'bg-white/5'
                      }`}
                    />
                    <span
                      className={`text-xs font-mono font-bold ${
                        isOverdueGroup && count > 0
                          ? 'text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full'
                          : 'text-zinc-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>

                  {isExpanded && (
                    <div
                      className={`space-y-3 pl-2 md:pl-4 border-l ${
                        isOverdueGroup && count > 0 ? 'border-rose-500/10' : 'border-white/5'
                      }`}
                    >
                      {groupedTasks[key].map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))}

                      {groupedTasks[key].length === 0 && (
                        <div className="py-2 text-xs text-zinc-500 italic pl-2">
                          No tasks in this section.
                        </div>
                      )}

                      {!showCompleted && !showArchived && (
                        <button
                          onClick={() =>
                            openModal(
                              undefined,
                              key === 'tomorrow'
                                ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
                                : key === 'today'
                                ? new Date().toISOString().split('T')[0]
                                : undefined
                            )
                          }
                          className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white px-3 py-2 hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Plus size={14} /> Add Task to {getGroupTitle(key)}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {activeKeys.length === 0 && (
              <div className="text-center py-20 text-zinc-500 flex flex-col items-center">
                <ListTodo size={48} className="mb-4 opacity-10" />
                <p>
                  {showCompleted
                    ? 'No completed tasks found.'
                    : 'No active tasks found.'}
                </p>
                {!showCompleted && !showArchived && (
                  <button
                    onClick={() => openModal()}
                    className="mt-4 text-white font-bold border-b border-white hover:text-violet-400 hover:border-violet-400 transition-colors"
                  >
                    Create one
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f] relative overflow-hidden">
      {/* Header Container */}
      <div className="flex flex-col gap-4 px-4 py-4 md:px-8 md:py-6 border-b border-white/5 bg-[#12121a]/85 backdrop-blur-md z-20 shrink-0 shadow-lg">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <ListTodo size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-none">
                Tasks
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                {showCompleted
                  ? 'Showing completed'
                  : showArchived
                  ? 'Showing archived'
                  : `${activeTasks.filter((t) => !t.isCompleted).length} pending tasks`}
              </p>
            </div>
          </div>

          <Button
            onClick={() => openModal()}
            variant="primary"
            className="flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden md:inline">New Task</span>
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-[#1e1a26]/30 border border-white/5 focus:border-violet-500/50 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:bg-[#1e1a26]/60 text-white transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {/* View Mode */}
            <div className="flex bg-[#12121a] p-1 rounded-xl border border-white/5 shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white/5 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="List View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'board'
                    ? 'bg-white/5 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Board View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>

            <div className="w-px h-6 bg-white/5 mx-1 shrink-0" />

            {/* Grouping */}
            <div className="flex items-center gap-1 bg-[#12121a] border border-white/5 rounded-xl p-1 shrink-0">
              <span className="text-[10px] font-bold text-zinc-500 uppercase px-2 hidden md:inline font-mono">
                Group
              </span>
              {(['date', 'priority', 'project'] as GroupingMode[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGrouping(g)}
                  className={`px-3 py-1 text-xs font-bold capitalize transition-colors rounded-lg ${
                    grouping === g
                      ? 'bg-white/5 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1 bg-[#12121a] border border-white/5 rounded-xl p-1 shrink-0">
              <span className="text-[10px] font-bold text-zinc-500 uppercase px-2 hidden md:inline font-mono">
                Sort
              </span>
              <button
                onClick={() => setSortBy('time')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  sortBy === 'time' ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Time"
              >
                <Clock size={14} />
              </button>
              <button
                onClick={() => setSortBy('priority')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  sortBy === 'priority' ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="Priority"
              >
                <ArrowUpAZ size={14} />
              </button>
              <button
                onClick={() => setSortBy('alpha')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  sortBy === 'alpha' ? 'bg-white/5 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title="A-Z"
              >
                <ArrowDown01 size={14} />
              </button>
            </div>

            {/* Toggles */}
            <button
              onClick={() => {
                setShowCompleted(!showCompleted);
                if (!showCompleted) setShowArchived(false);
              }}
              className={`p-2 rounded-xl border transition-all shrink-0 ml-auto ${
                showCompleted
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5'
                  : 'border-white/5 text-zinc-500 hover:text-white hover:border-white/10 bg-[#12121a]'
              }`}
              title={showCompleted ? 'Hide Completed' : 'Show Completed'}
            >
              <CheckSquare size={16} />
            </button>

            <button
              onClick={() => {
                setShowArchived(!showArchived);
                if (!showArchived) setShowCompleted(false);
              }}
              className={`p-2 rounded-xl border transition-all shrink-0 ${
                showArchived
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/5'
                  : 'border-white/5 text-zinc-500 hover:text-white hover:border-white/10 bg-[#12121a]'
              }`}
              title={showArchived ? 'Hide Archived' : 'Show Archived'}
            >
              <Archive size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Board/List Content */}
      <div className="flex-1 overflow-hidden">{renderContent()}</div>

      {/* Task Creation/Editing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTaskId ? 'Edit Task' : 'New Task'}
        className="max-w-xl"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task Title"
              className="w-full bg-transparent text-xl font-bold text-white placeholder-zinc-700 border-none p-0 focus:ring-0 focus:outline-none"
              autoFocus
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2 font-mono">
                Priority
              </label>
              <div className="flex bg-[#12121a] p-1 rounded-xl border border-white/5">
                {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      priority === p
                        ? 'bg-white/5 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2 font-mono">
                Duration (min)
              </label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2 font-mono">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--purple)] focus:ring-1 focus:ring-violet-500/30 outline-none"
              >
                <option value="" className="bg-[#12121a]">No Project</option>
                {availableProjects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#12121a]">
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2 font-mono">
                Category
              </label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Work"
              />
            </div>
          </div>

          {/* Schedule Wrapper */}
          <div className="bg-[#12121a] p-4 rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <CalendarClock size={16} className="text-violet-400" /> Schedule Task
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="bg-[var(--bg-secondary)]"
              />
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="bg-[var(--bg-secondary)]"
              />
            </div>
          </div>

          {/* Subtasks Builder */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                Subtasks Checklist
              </label>
              <span className="text-xs text-zinc-500 font-mono">
                {subtasks.filter((s) => s.isCompleted).length}/{subtasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {subtasks.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2 group p-2 hover:bg-white/5 rounded-xl transition-all">
                  <button
                    onClick={() => toggleSubtask(sub.id)}
                    className={sub.isCompleted ? 'text-emerald-500' : 'text-zinc-500 hover:text-white'}
                  >
                    {sub.isCompleted ? (
                      <CheckSquare size={16} />
                    ) : (
                      <div className="w-4 h-4 border border-zinc-500 rounded-sm" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      sub.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-300'
                    }`}
                  >
                    {sub.title}
                  </span>
                  <button
                    onClick={() => removeSubtask(sub.id)}
                    className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2 border border-white/5 bg-[#12121a] rounded-xl px-3 py-2 focus-within:border-violet-500/50 transition-colors">
                <Plus size={16} className="text-zinc-500" />
                <input
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
                  placeholder="Add a step..."
                  className="flex-1 bg-transparent text-sm focus:outline-none text-white placeholder-zinc-600"
                />
              </div>
            </div>
          </div>

          {/* Footer controls inside Modal */}
          <div className="border-t border-white/5 pt-5 flex items-center justify-between">
            <div className="flex gap-2 relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2.5 bg-[#12121a] border border-white/5 rounded-xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white"
                title="Choose Color Accent"
              >
                <Palette size={18} />
              </button>
              {showColorPicker && (
                <div className="absolute bottom-full left-0 mb-3 bg-[#12121a] border border-white/10 shadow-2xl rounded-2xl p-2.5 flex gap-1.5 z-50 animate-[scaleUp_0.15s_ease-out] w-max">
                  {TASK_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedColor(c);
                        setShowColorPicker(false);
                      }}
                      className={`w-6 h-6 rounded-full border border-white/10 hover:scale-110 transition-transform ${
                        selectedColor === c ? 'ring-2 ring-offset-2 ring-violet-500 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
              <div
                className="w-8 h-8 rounded-full border border-white/10 shadow-inner self-center ml-1"
                style={{ backgroundColor: selectedColor }}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={closeModal} variant="ghost">
                Cancel
              </Button>
              <Button onClick={handleSave} variant="primary">
                Save Task
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default TaskModule;
