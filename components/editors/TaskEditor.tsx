'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Task, Priority, Subtask, Reminder, RecurrenceConfig } from '../../types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  Clock,
  CheckSquare,
  AlertCircle,
  Briefcase,
  CalendarClock,
  ListTodo,
  Sparkles,
  X,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const TASK_COLORS = [
  '#8979FF', // Violet Brand Accent
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#02C98B', // Emerald
  '#D97706', // Amber
  '#10b981', // Green
  '#a78bfa', // Purple Light
  '#64748b', // Slate
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

interface TaskEditorProps {
  mode: 'new' | 'edit';
}

export const TaskEditor: React.FC<TaskEditorProps> = ({ mode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Zustand Actions & Store
  const tasks = useAppStore((state) => state.tasks);
  const projects = useAppStore((state) => state.projects);
  const onAddTask = useAppStore((state) => state.handleAddTask);
  const onUpdateTask = useAppStore((state) => state.handleUpdateTask);
  const convertingDump = useAppStore((state) => state.convertingDump);
  const onConvertComplete = useAppStore((state) => state.handleConvertComplete);
  const onClearConvertingDump = () => useAppStore.getState().setConvertingDump(null);

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

  const availableProjects = React.useMemo(() => {
    return projects.filter((p) => !p.deletedAt && !p.archivedAt);
  }, [projects]);

  // Load Task details if in edit mode
  React.useEffect(() => {
    if (mode === 'edit' && id) {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setCategory(task.category);
        setDuration(task.duration?.toString() || '30');
        setProjectId(task.projectId || '');
        setSubtasks(task.subtasks || []);
        setSelectedColor(task.color || TASK_COLORS[0]);
        if (task.startTime) {
          const d = new Date(task.startTime);
          setScheduledDate(d.toISOString().split('T')[0]);
          setScheduledTime(
            d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
          );
        } else {
          setScheduledDate('');
          setScheduledTime('');
        }
        if (task.recurrence) {
          setIsRecurring(true);
          setRecurrenceType(task.recurrence.type);
          setRecurrenceInterval(task.recurrence.interval);
          setRecurrenceInstances(task.recurrence.instancesToGenerate || 5);
          setRecurrenceDays(task.recurrence.daysOfWeek || []);
        } else {
          setIsRecurring(false);
        }
        setReminders(task.reminders || []);
      }
    } else if (mode === 'new' && convertingDump) {
      setTitle(convertingDump.title);
      setDescription(convertingDump.description);
      setPriority('Medium');
      setCategory('Personal');
      setDuration('30');
      setProjectId('');
      setSubtasks([]);
      setSelectedColor(TASK_COLORS[0]);
      setScheduledDate('');
      setScheduledTime('');
      setIsRecurring(false);
      setReminders([]);
    }
  }, [mode, id, tasks, convertingDump]);

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

    if (mode === 'edit' && id) {
      const existing = tasks.find((t) => t.id === id);
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
    } else {
      onClearConvertingDump();
    }

    router.push('/tasks' as any);
  };

  const handleDiscard = () => {
    onClearConvertingDump();
    router.push('/tasks' as any);
  };

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: Date.now().toString() + Math.random(),
        title: subtaskInput.trim(),
        isCompleted: false,
      },
    ]);
    setSubtaskInput('');
  };

  const toggleSubtask = (sid: string) =>
    setSubtasks(
      subtasks.map((s) => (s.id === sid ? { ...s, isCompleted: !s.isCompleted } : s))
    );

  const removeSubtask = (sid: string) => setSubtasks(subtasks.filter((s) => s.id !== sid));

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

  const removeReminder = (rid: string) => setReminders(reminders.filter((r) => r.id !== rid));

  const toggleRecurrenceDay = (day: number) => {
    if (recurrenceDays.includes(day)) {
      setRecurrenceDays(recurrenceDays.filter((d) => d !== day));
    } else {
      setRecurrenceDays([...recurrenceDays, day].sort());
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FA] text-[#1E1E1E] p-4 md:p-8 pb-32 max-w-3xl mx-auto flex flex-col space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleDiscard}
            className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-500 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200/60 active:scale-95"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'edit' ? 'Edit Task' : 'New Task'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Fill in the specifics for your to-do item.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDiscard} variant="ghost" className="text-slate-500">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            Save
          </Button>
        </div>
      </div>

      {/* Editor Content Forms */}
      <Card variant="glass" className="p-6 md:p-8 space-y-6 border border-slate-200/60 shadow-xl bg-white">
        {/* Title Input */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Task Name
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#8979FF] focus:bg-white focus:shadow-[var(--glow-purple)] outline-none transition-all text-sm font-bold"
            autoFocus
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context or notes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#8979FF] focus:bg-white focus:shadow-[var(--glow-purple)] outline-none transition-all text-sm font-bold min-h-[100px] resize-none"
          />
        </div>

        {/* Row 1: Priority, Category, Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#8979FF] outline-none transition-all"
            >
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Category
            </label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Work, Health"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#8979FF] focus:bg-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Duration Est. (Mins)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#8979FF] focus:bg-white outline-none transition-all font-mono"
            />
          </div>
        </div>

        {/* Color picker & Project Select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Project Link
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#8979FF] outline-none transition-all"
            >
              <option value="">No Project Link</option>
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 font-mono">
              Card Glow Accent
            </label>
            <div className="flex flex-wrap gap-2.5">
              {TASK_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform active:scale-90 border-2
                    ${selectedColor === c ? 'scale-110 border-slate-900' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Date and Time Scheduling */}
        <div className="pt-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Schedule Date & Time
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:border-[#8979FF] focus:bg-white outline-none transition-all font-mono"
              />
            </div>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:border-[#8979FF] focus:bg-white outline-none transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Checklist Subtasks */}
        <div className="pt-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Nested Subtasks Checklist
          </label>
          <div className="flex gap-2 mb-3">
            <input
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
              placeholder="Add a step to complete..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-[#8979FF] focus:bg-white outline-none"
            />
            <Button type="button" onClick={addSubtask} variant="secondary" className="rounded-2xl">
              <Plus size={18} />
            </Button>
          </div>
          {subtasks.length > 0 && (
            <div className="space-y-2 border border-slate-200/60 rounded-2xl p-3 bg-slate-50/50">
              {subtasks.map((st) => (
                <div key={st.id} className="flex items-center justify-between bg-white border border-slate-200/60 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => toggleSubtask(st.id)}>
                    <button type="button" className={`text-slate-500 ${st.isCompleted ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {st.isCompleted ? <CheckSquare size={16} /> : <div className="w-4 h-4 border border-current rounded" />}
                    </button>
                    <span className={`text-xs font-bold text-slate-800 ${st.isCompleted ? 'line-through opacity-50' : ''}`}>
                      {st.title}
                    </span>
                  </div>
                  <button type="button" onClick={() => removeSubtask(st.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reminders section */}
        <div className="pt-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Reminders Notifications
          </label>
          <div className="flex gap-2 mb-3">
            <select
              value={newReminderOffset}
              onChange={(e) => setNewReminderOffset(Number(e.target.value))}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#8979FF] outline-none"
            >
              <option value={0}>At start time</option>
              <option value={5}>5 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
            </select>
            <Button type="button" onClick={addReminder} variant="secondary" className="rounded-2xl">
              Add Reminder
            </Button>
          </div>
          {reminders.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {reminders.map((r) => (
                <div key={r.id} className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 text-violet-600 rounded-full text-xs font-bold border border-violet-500/20">
                  <span>
                    {r.timeOffset === 0 ? 'At start time' : `${r.timeOffset}m before`}
                  </span>
                  <button type="button" onClick={() => removeReminder(r.id)} className="hover:text-rose-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recurrence config */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-bold text-slate-800">Recurring Task</span>
              <p className="text-[10px] text-slate-500">Automatically generate repeated task cards</p>
            </div>
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none border
                ${isRecurring ? 'bg-[#8979FF] border-[#8979FF]' : 'bg-slate-200 border-slate-300'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                ${isRecurring ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {isRecurring && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60 animate-fade-in text-sm font-bold">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
                    Frequency
                  </label>
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-[#8979FF] outline-none"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="specific_days">Specific Days</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
                    Every (Interval)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-[#8979FF] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
                    Generate (Instances)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={recurrenceInstances}
                    onChange={(e) => setRecurrenceInstances(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-[#8979FF] outline-none font-mono"
                  />
                </div>
              </div>

              {recurrenceType === 'specific_days' && (
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
                    Select Days
                  </label>
                  <div className="flex gap-2">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => {
                      const dayVal = (idx + 1) % 7; // Monday = 1, Sunday = 0
                      const isSelected = recurrenceDays.includes(dayVal);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleRecurrenceDay(dayVal)}
                          className={`w-8 h-8 rounded-full text-xs font-bold border transition-colors
                            ${isSelected ? 'bg-[#8979FF] text-white border-transparent' : 'bg-white border-slate-200 text-slate-500'}`}
                        >
                          {dayName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TaskEditor;
