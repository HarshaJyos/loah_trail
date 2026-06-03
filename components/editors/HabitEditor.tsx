'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Habit, HabitFrequency, HabitGoal, ElasticConfig, Reminder } from '../../types';
import { ArrowLeft, Check, Plus, Trash2, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const HABIT_COLORS = [
  '#8979FF',
  '#02C98B',
  '#3b82f6',
  '#D97706',
  '#f43f5e',
  '#ec4899',
  '#a78bfa',
];

interface HabitEditorProps {
  mode: 'new' | 'edit';
}

export const HabitEditor: React.FC<HabitEditorProps> = ({ mode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Zustand State & Actions
  const habits = useAppStore((state) => state.habits);
  const onAddHabit = useAppStore((state) => state.handleAddHabit);
  const onUpdateHabit = useAppStore((state) => state.handleUpdateHabit);

  // Form State
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedColor, setSelectedColor] = React.useState(HABIT_COLORS[0]);
  const [habitType, setHabitType] = React.useState<'simple' | 'elastic'>('simple');

  // Frequency
  const [freqType, setFreqType] = React.useState<'daily' | 'weekly' | 'specific_days' | 'interval'>('daily');
  const [freqInterval, setFreqInterval] = React.useState(1);
  const [freqTimesPerWeek, setFreqTimesPerWeek] = React.useState(3);
  const [freqDays, setFreqDays] = React.useState<number[]>([]);

  // Goal
  const [goalType, setGoalType] = React.useState<'check' | 'quantity' | 'duration'>('check');
  const [goalTarget, setGoalTarget] = React.useState(1);
  const [goalUnit, setGoalUnit] = React.useState('');

  // Elastic Config
  const [elasticUnit, setElasticUnit] = React.useState('mins');
  const [elasticMiniLabel, setElasticMiniLabel] = React.useState('Mini');
  const [elasticMiniTarget, setElasticMiniTarget] = React.useState(5);
  const [elasticPlusLabel, setElasticPlusLabel] = React.useState('Plus');
  const [elasticPlusTarget, setElasticPlusTarget] = React.useState(15);
  const [elasticEliteLabel, setElasticEliteLabel] = React.useState('Elite');
  const [elasticEliteTarget, setElasticEliteTarget] = React.useState(30);

  // Reminders
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [newReminderOffset, setNewReminderOffset] = React.useState(15);

  // Load habit if in edit mode
  React.useEffect(() => {
    if (mode === 'edit' && id) {
      const habit = habits.find((h) => h.id === id);
      if (habit) {
        setTitle(habit.title);
        setDescription(habit.description || '');
        setSelectedColor(habit.color || HABIT_COLORS[0]);
        setHabitType(habit.type);

        if (habit.frequency) {
          setFreqType(habit.frequency.type);
          setFreqInterval(habit.frequency.interval || 1);
          setFreqTimesPerWeek(habit.frequency.timesPerWeek || 3);
          setFreqDays(habit.frequency.daysOfWeek || []);
        }

        if (habit.goal) {
          setGoalType(habit.goal.type);
          setGoalTarget(habit.goal.target || 1);
          setGoalUnit(habit.goal.unit || '');
        }

        if (habit.elasticConfig) {
          setElasticUnit(habit.elasticConfig.unit || 'mins');
          setElasticMiniLabel(habit.elasticConfig.mini?.label || 'Mini');
          setElasticMiniTarget(habit.elasticConfig.mini?.target || 5);
          setElasticPlusLabel(habit.elasticConfig.plus?.label || 'Plus');
          setElasticPlusTarget(habit.elasticConfig.plus?.target || 15);
          setElasticEliteLabel(habit.elasticConfig.elite?.label || 'Elite');
          setElasticEliteTarget(habit.elasticConfig.elite?.target || 30);
        }

        setReminders(habit.reminders || []);
      }
    }
  }, [mode, id, habits]);

  const handleSave = () => {
    if (!title.trim()) return;

    const frequency: HabitFrequency = {
      type: freqType,
      interval: freqType === 'interval' ? freqInterval : undefined,
      timesPerWeek: freqType === 'weekly' ? freqTimesPerWeek : undefined,
      daysOfWeek: freqType === 'specific_days' ? freqDays : undefined,
    };

    const goal: HabitGoal = {
      type: goalType,
      target: goalTarget,
      unit: goalType !== 'check' ? goalUnit : '',
    };

    const elasticConfig: ElasticConfig | undefined = habitType === 'elastic'
      ? {
          unit: elasticUnit,
          mini: { label: elasticMiniLabel, target: elasticMiniTarget },
          plus: { label: elasticPlusLabel, target: elasticPlusTarget },
          elite: { label: elasticEliteLabel, target: elasticEliteTarget },
        }
      : undefined;

    const habitData: Partial<Habit> = {
      title: title.trim(),
      description: description.trim(),
      color: selectedColor,
      type: habitType,
      frequency,
      goal,
      elasticConfig,
      reminders,
    };

    if (mode === 'edit' && id) {
      const existing = habits.find((h) => h.id === id);
      if (existing) onUpdateHabit({ ...existing, ...habitData });
    } else {
      const newHabit: Habit = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        color: selectedColor,
        type: habitType,
        frequency,
        goal,
        elasticConfig,
        reminders,
        history: {},
        streak: 0,
        createdAt: Date.now(),
      };
      onAddHabit(newHabit);
    }

    router.push('/habits' as any);
  };

  const handleDiscard = () => {
    router.push('/habits' as any);
  };

  const toggleFreqDay = (day: number) => {
    if (freqDays.includes(day)) {
      setFreqDays(freqDays.filter((d) => d !== day));
    } else {
      setFreqDays([...freqDays, day].sort());
    }
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
              {mode === 'edit' ? 'Edit Habit' : 'New Habit'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Set streaks and checking configuration.
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
        {/* Habit Title */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Habit Name
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Read Book, Exercise, Hydrate"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#8979FF] focus:bg-white focus:shadow-[var(--glow-purple)] outline-none transition-all text-sm font-bold"
            autoFocus
          />
        </div>

        {/* Habit Description */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Purpose / Motivation
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why do you want to form this habit?"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-[#8979FF] focus:bg-white outline-none transition-all min-h-[70px] resize-none"
          />
        </div>

        {/* Color Accent and Habit Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 font-mono">
              Habit Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHabitType('simple')}
                className={`py-2 rounded-xl text-xs border transition-all ${
                  habitType === 'simple'
                    ? 'bg-[#8979FF] text-white border-transparent'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Simple Check-in
              </button>
              <button
                type="button"
                onClick={() => setHabitType('elastic')}
                className={`py-2 rounded-xl text-xs border transition-all ${
                  habitType === 'elastic'
                    ? 'bg-[#8979FF] text-white border-transparent'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Elastic (Tiers)
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 font-mono">
              Card Glow Accent
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {HABIT_COLORS.map((c) => (
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

        {/* Habit Frequency */}
        <div className="pt-2 border-t border-slate-100">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 font-mono">
            Frequency Configuration
          </label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
            {(['daily', 'weekly', 'specific_days', 'interval'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFreqType(t)}
                className={`py-2 rounded-xl text-xs border transition-all capitalize ${
                  freqType === t
                    ? 'bg-slate-900 text-white border-transparent'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                {t === 'specific_days' ? 'Specific Days' : t}
              </button>
            ))}
          </div>

          {freqType === 'interval' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fade-in flex items-center gap-3">
              <span className="text-xs text-slate-700">Repeat every</span>
              <input
                type="number"
                min={1}
                value={freqInterval}
                onChange={(e) => setFreqInterval(Number(e.target.value))}
                className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono"
              />
              <span className="text-xs text-slate-700">days</span>
            </div>
          )}

          {freqType === 'weekly' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fade-in flex items-center gap-3">
              <span className="text-xs text-slate-700">Perform</span>
              <input
                type="number"
                min={1}
                max={7}
                value={freqTimesPerWeek}
                onChange={(e) => setFreqTimesPerWeek(Number(e.target.value))}
                className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono"
              />
              <span className="text-xs text-slate-700">times per week</span>
            </div>
          )}

          {freqType === 'specific_days' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fade-in space-y-2">
              <span className="text-xs text-slate-700 block mb-1">Select Days</span>
              <div className="flex gap-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => {
                  const dayVal = (idx + 1) % 7; // Monday = 1, Sunday = 0
                  const isSelected = freqDays.includes(dayVal);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleFreqDay(dayVal)}
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

        {/* Goals Config / Elastic Config */}
        <div className="pt-2 border-t border-slate-100">
          {habitType === 'simple' ? (
            /* Simple Habit Goal */
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
                Completion Goal
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {(['check', 'quantity', 'duration'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGoalType(t)}
                    className={`py-2 rounded-xl text-xs border transition-all capitalize ${
                      goalType === t
                        ? 'bg-slate-900 text-white border-transparent'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    {t === 'check' ? 'Check-in only' : t}
                  </button>
                ))}
              </div>

              {goalType !== 'check' && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl animate-fade-in">
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Target Quantity</span>
                    <input
                      type="number"
                      min={1}
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 block mb-1">Unit</span>
                    <input
                      value={goalUnit}
                      onChange={(e) => setGoalUnit(e.target.value)}
                      placeholder="e.g. Pages, Mins, Steps"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Elastic Habit Tiers Config */
            <div className="space-y-4 animate-fade-in">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
                Elastic Tiers Setup
              </label>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                <div>
                  <span className="text-xs text-slate-600 block mb-1">Elastic Tracking Unit</span>
                  <input
                    value={elasticUnit}
                    onChange={(e) => setElasticUnit(e.target.value)}
                    placeholder="e.g. Mins, Pages, Reps"
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 w-full max-w-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Mini Tier */}
                  <div className="bg-white border border-slate-200 p-3 rounded-xl">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Mini Goal</span>
                    <input
                      value={elasticMiniLabel}
                      onChange={(e) => setElasticMiniLabel(e.target.value)}
                      placeholder="Mini Label"
                      className="w-full border-slate-200 rounded-lg text-xs p-1 mb-2 font-bold"
                    />
                    <input
                      type="number"
                      value={elasticMiniTarget}
                      onChange={(e) => setElasticMiniTarget(Number(e.target.value))}
                      className="w-full border-slate-200 rounded-lg text-xs p-1 font-mono"
                    />
                  </div>

                  {/* Plus Tier */}
                  <div className="bg-white border border-slate-200 p-3 rounded-xl">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Plus Goal</span>
                    <input
                      value={elasticPlusLabel}
                      onChange={(e) => setElasticPlusLabel(e.target.value)}
                      placeholder="Plus Label"
                      className="w-full border-slate-200 rounded-lg text-xs p-1 mb-2 font-bold"
                    />
                    <input
                      type="number"
                      value={elasticPlusTarget}
                      onChange={(e) => setElasticPlusTarget(Number(e.target.value))}
                      className="w-full border-slate-200 rounded-lg text-xs p-1 font-mono"
                    />
                  </div>

                  {/* Elite Tier */}
                  <div className="bg-white border border-slate-200 p-3 rounded-xl">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Elite Goal</span>
                    <input
                      value={elasticEliteLabel}
                      onChange={(e) => setElasticEliteLabel(e.target.value)}
                      placeholder="Elite Label"
                      className="w-full border-slate-200 rounded-lg text-xs p-1 mb-2 font-bold"
                    />
                    <input
                      type="number"
                      value={elasticEliteTarget}
                      onChange={(e) => setElasticEliteTarget(Number(e.target.value))}
                      className="w-full border-slate-200 rounded-lg text-xs p-1 font-mono"
                    />
                  </div>
                </div>
              </div>
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

export default HabitEditor;
