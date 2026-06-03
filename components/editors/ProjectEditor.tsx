'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Project, Priority, Reminder } from '../../types';
import { ArrowLeft, Calendar, Clock, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PROJECT_COLORS = [
  '#8979FF',
  '#3b82f6',
  '#02C98B',
  '#D97706',
  '#f43f5e',
  '#ec4899',
  '#a78bfa',
];

interface ProjectEditorProps {
  mode: 'new' | 'edit';
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({ mode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Zustand State & Actions
  const projects = useAppStore((state) => state.projects);
  const onAddProject = useAppStore((state) => state.handleAddProject);
  const onUpdateProject = useAppStore((state) => state.handleUpdateProject);
  const convertingDump = useAppStore((state) => state.convertingDump);
  const onConvertComplete = useAppStore((state) => state.handleConvertComplete);
  const onClearConvertingDump = () => useAppStore.getState().setConvertingDump(null);

  // Form State
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(PROJECT_COLORS[0]);
  const [status, setStatus] = React.useState<'active' | 'completed' | 'on-hold'>('active');
  const [priority, setPriority] = React.useState<Priority>('Medium');
  const [startDateStr, setStartDateStr] = React.useState('');
  const [dueDateStr, setDueDateStr] = React.useState('');

  // Reminders
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [newReminderOffset, setNewReminderOffset] = React.useState(15);

  // Load project if editing
  React.useEffect(() => {
    if (mode === 'edit' && id) {
      const proj = projects.find((p) => p.id === id);
      if (proj) {
        setTitle(proj.title);
        setDescription(proj.description || '');
        setSelectedColor(proj.color || PROJECT_COLORS[0]);
        setStatus(proj.status);
        setPriority(proj.priority);

        if (proj.startDate) {
          setStartDateStr(new Date(proj.startDate).toISOString().split('T')[0]);
        }
        if (proj.dueDate) {
          setDueDateStr(new Date(proj.dueDate).toISOString().split('T')[0]);
        }

        setReminders(proj.reminders || []);
      }
    } else if (mode === 'new' && convertingDump) {
      setTitle(convertingDump.title);
      setDescription(convertingDump.description || '');
      setStartDateStr(new Date().toISOString().split('T')[0]);
    }
  }, [mode, id, projects, convertingDump]);

  const handleSave = () => {
    if (!title.trim()) return;

    const startDate = startDateStr ? new Date(startDateStr).getTime() : Date.now();
    const dueDate = dueDateStr ? new Date(dueDateStr).getTime() : Date.now() + 86400000 * 7;

    const projectData: Partial<Project> = {
      title: title.trim(),
      description: description.trim(),
      color: selectedColor,
      status,
      priority,
      startDate,
      dueDate,
      reminders,
    };

    if (mode === 'edit' && id) {
      const existing = projects.find((p) => p.id === id);
      if (existing) onUpdateProject({ ...existing, ...projectData });
    } else {
      const newProj: Project = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        color: selectedColor,
        status,
        priority,
        startDate,
        dueDate,
        reminders,
        createdAt: Date.now(),
      };
      onAddProject(newProj);
    }

    if (convertingDump) {
      onConvertComplete();
    } else {
      onClearConvertingDump();
    }

    router.push('/projects' as any);
  };

  const handleDiscard = () => {
    onClearConvertingDump();
    router.push('/projects' as any);
  };

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
              {mode === 'edit' ? 'Edit Project' : 'New Project'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Set schedules and key attributes for this project.
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

      <Card variant="glass" className="p-6 md:p-8 space-y-6 border border-slate-200/60 shadow-xl bg-white text-sm font-bold">
        {/* Title */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Project Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Redesign Web App, Term Paper"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#8979FF] focus:bg-white focus:shadow-[var(--glow-purple)] outline-none transition-all text-sm font-bold"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Objective & Notes
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Specify goals and notes..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[#8979FF] focus:bg-white outline-none transition-all min-h-[100px] resize-none"
          />
        </div>

        {/* Status, Priority & Color */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#8979FF] outline-none transition-all"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#8979FF] outline-none transition-all"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 font-mono">
              Card Glow Accent
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {PROJECT_COLORS.map((c) => (
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

        {/* Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Start Date
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:border-[#8979FF] focus:bg-white outline-none transition-all font-mono"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Due Date
            </label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:border-[#8979FF] focus:bg-white outline-none transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Reminders section */}
        <div className="pt-4 border-t border-slate-100">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Reminders Notifications
          </label>
          <div className="flex gap-2 mb-3">
            <select
              value={newReminderOffset}
              onChange={(e) => setNewReminderOffset(Number(e.target.value))}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:border-[#8979FF] outline-none"
            >
              <option value={0}>At start date (9:00 AM)</option>
              <option value={15}>15 minutes before</option>
              <option value={60}>1 hour before</option>
              <option value={1440}>1 day before</option>
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
                    {r.timeOffset === 0 ? 'At start time' : r.timeOffset === 1440 ? '1 day before' : `${r.timeOffset}m before`}
                  </span>
                  <button type="button" onClick={() => removeReminder(r.id)} className="hover:text-rose-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProjectEditor;
