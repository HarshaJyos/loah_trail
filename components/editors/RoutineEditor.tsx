'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Routine, RoutineStep, Habit, Reminder } from '../../types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  PlayCircle,
  Bell,
  X,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ROUTINE_COLORS = [
  '#8979FF',
  '#3b82f6',
  '#02C98B',
  '#D97706',
  '#f43f5e',
  '#ec4899',
  '#a78bfa',
];

interface RoutineEditorProps {
  mode: 'new' | 'edit';
}

export const RoutineEditor: React.FC<RoutineEditorProps> = ({ mode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Zustand State & Actions
  const routines = useAppStore((state) => state.routines);
  const habits = useAppStore((state) => state.habits);
  const onAddRoutine = useAppStore((state) => state.handleAddRoutine);
  const onUpdateRoutine = useAppStore((state) => state.handleUpdateRoutine);

  // Form State
  const [title, setTitle] = React.useState('');
  const [steps, setSteps] = React.useState<RoutineStep[]>([]);
  const [routineType, setRoutineType] = React.useState<'once' | 'repeatable'>('repeatable');
  const [selectedColor, setSelectedColor] = React.useState(ROUTINE_COLORS[0]);

  // Step Creation State
  const [stepTitle, setStepTitle] = React.useState('');
  const [stepMins, setStepMins] = React.useState('5');
  const [linkedHabitId, setLinkedHabitId] = React.useState('');

  // Reminders
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [newReminderOffset, setNewReminderOffset] = React.useState(15);

  const activeHabits = React.useMemo(() => {
    return habits.filter((h) => !h.deletedAt && !h.archivedAt);
  }, [habits]);

  // Load routine if in edit mode
  React.useEffect(() => {
    if (mode === 'edit' && id) {
      const routine = routines.find((r) => r.id === id);
      if (routine) {
        setTitle(routine.title);
        setSteps([...(routine.steps || [])]);
        setRoutineType(routine.type);
        setReminders(routine.reminders || []);
        setSelectedColor(routine.color || ROUTINE_COLORS[0]);
      }
    }
  }, [mode, id, routines]);

  const handleSave = () => {
    if (!title.trim()) return;

    const routineData: Partial<Routine> = {
      title: title.trim(),
      steps,
      type: routineType,
      reminders,
      color: selectedColor,
    };

    if (mode === 'edit' && id) {
      const existing = routines.find((r) => r.id === id);
      if (existing) onUpdateRoutine({ ...existing, ...routineData });
    } else {
      const newRoutine: Routine = {
        id: Date.now().toString(),
        title: title.trim(),
        steps,
        type: routineType,
        color: selectedColor,
        reminders,
        createdAt: Date.now(),
      } as any; // Cast since Next version might have minor property drift
      onAddRoutine(newRoutine);
    }

    router.push('/routines' as any);
  };

  const handleDiscard = () => {
    router.push('/routines' as any);
  };

  const addStep = () => {
    if (!stepTitle.trim()) return;
    const step: RoutineStep = {
      id: Date.now().toString() + Math.random(),
      title: stepTitle.trim(),
      durationSeconds: (parseInt(stepMins) * 60) || 300,
      linkedHabitId: linkedHabitId || undefined,
    };
    setSteps([...steps, step]);
    setStepTitle('');
    setStepMins('5');
    setLinkedHabitId('');
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, idx) => idx !== index));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= steps.length) return;

    const updated = [...steps];
    const temp = updated[index];
    updated[index] = updated[nextIdx];
    updated[nextIdx] = temp;
    setSteps(updated);
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
              {mode === 'edit' ? 'Edit Routine' : 'New Routine'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Define focus steps and notifications for this routine.
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

      {/* Routine details */}
      <Card variant="glass" className="p-6 md:p-8 space-y-6 border border-slate-200/60 shadow-xl bg-white">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Routine Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Morning Focus, Bedtime Reset"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#8979FF] focus:bg-white focus:shadow-[var(--glow-purple)] outline-none transition-all text-sm font-bold"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Routine Type
            </label>
            <select
              value={routineType}
              onChange={(e) => setRoutineType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#8979FF] outline-none transition-all"
            >
              <option value="repeatable">Repeatable Focus Session</option>
              <option value="once">Run Once & Complete</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 font-mono">
              Card Glow Accent
            </label>
            <div className="flex flex-wrap gap-2.5">
              {ROUTINE_COLORS.map((c) => (
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

        {/* Routine Steps Builder */}
        <div className="pt-4 border-t border-slate-100">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 font-mono">
            Focus Steps checklist
          </label>

          {/* New Step Form */}
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-4 mb-4">
            <span className="text-xs font-bold text-slate-800">Add Next step</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={stepTitle}
                onChange={(e) => setStepTitle(e.target.value)}
                placeholder="What to do? (e.g. Meditate, Drink Water)"
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-[#8979FF] outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  value={stepMins}
                  onChange={(e) => setStepMins(e.target.value)}
                  placeholder="Mins"
                  className="w-20 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-[#8979FF] outline-none font-mono"
                  title="Duration in minutes"
                />
                <select
                  value={linkedHabitId}
                  onChange={(e) => setLinkedHabitId(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-[#8979FF] outline-none"
                >
                  <option value="">Link Habit (Optional)</option>
                  {activeHabits.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={addStep} size="sm" variant="secondary" className="flex items-center gap-1">
                <Plus size={14} /> Add Step
              </Button>
            </div>
          </div>

          {/* Steps List */}
          {steps.length > 0 ? (
            <div className="space-y-2">
              {steps.map((step, index) => {
                const habit = activeHabits.find((h) => h.id === step.linkedHabitId);
                return (
                  <div
                    key={step.id}
                    className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-slate-400 bg-slate-50 border border-slate-200/60 w-6 h-6 rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {step.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 pl-8">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 font-mono">
                          <Clock size={10} /> {Math.round(step.durationSeconds / 60)}m
                        </span>
                        {habit && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 border border-violet-500/10">
                            Habit: {habit.title}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-30"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === steps.length - 1}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-30"
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              No steps defined. Add steps above to build your focus routine.
            </div>
          )}
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
              <option value={0}>At scheduled time</option>
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
      </Card>
    </div>
  );
};

export default RoutineEditor;
