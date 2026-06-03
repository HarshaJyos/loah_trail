'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Habit } from '../../types';
import { ArrowLeft, Repeat, Plus, Target } from 'lucide-react';

export const HabitEditor: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onAddHabit = useAppStore((s) => s.handleAddHabit);
  const onUpdateHabit = useAppStore((s) => s.handleUpdateHabit);
  const habits = useAppStore((s) => s.habits);
  const onDeleteDump = useAppStore((s) => s.handleDeleteDump);

  const habitId = searchParams?.get('id');
  const existingHabit = React.useMemo(() => habits.find(h => h.id === habitId), [habits, habitId]);

  const [title, setTitle] = React.useState(searchParams?.get('title') || '');
  const [description, setDescription] = React.useState(searchParams?.get('desc') || '');
  const [color, setColor] = React.useState('var(--cat-learning)');
  const [freqType, setFreqType] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [goalTarget, setGoalTarget] = React.useState('1');
  const [goalUnit, setGoalUnit] = React.useState('times');

  React.useEffect(() => {
    if (existingHabit) {
      setTitle(existingHabit.title);
      setDescription(existingHabit.description || '');
      setColor(existingHabit.color || 'var(--cat-learning)');
      if (existingHabit.frequency) setFreqType(existingHabit.frequency.type);
      if (existingHabit.goal) {
        setGoalTarget(existingHabit.goal.target.toString());
        setGoalUnit(existingHabit.goal.unit);
      }
    }
  }, [existingHabit]);

  const deleteDumpId = searchParams?.get('deleteDumpId');

  const handleSave = () => {
    if (!title.trim()) {
      router.push('/habits' as any);
      return;
    }
    const newHabit: Habit = {
      id: existingHabit ? existingHabit.id : Date.now().toString(),
      title: title.trim(),
      description,
      color,
      type: existingHabit ? existingHabit.type : 'simple',
      frequency: { type: freqType },
      goal: { type: 'check', target: parseFloat(goalTarget) || 1, unit: goalUnit || 'times' },
      history: existingHabit ? existingHabit.history : {},
      streak: existingHabit ? existingHabit.streak : 0,
      createdAt: existingHabit ? existingHabit.createdAt : Date.now(),
    };
    if (existingHabit) {
      onUpdateHabit(newHabit);
    } else {
      onAddHabit(newHabit);
    }
    if (deleteDumpId) {
      onDeleteDump(deleteDumpId);
    }
    router.push('/habits' as any);
  };

  const colors = [
    'var(--cat-learning)', 'var(--cat-hydration)', 'var(--cat-meditation)',
    'var(--cat-movement)', 'var(--cat-journaling)', 'var(--cat-deepwork)'
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-fade-in" style={{ background: 'var(--bg-app)' }}>
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, background: 'var(--bg-canvas)',
          position: 'sticky', top: 0, zIndex: 50,
        }}
      >
        <button onClick={() => router.back()} className="loah-icon-btn">
          <ArrowLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Repeat size={18} color={color} />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {existingHabit ? 'Edit Habit' : 'New Habit'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.back()} className="loah-btn-ghost">
            Discard
          </button>
          <button onClick={handleSave} className="loah-btn-primary">
            Save Habit
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '32px 24px 100px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Habit Name"
          className="loah-title-input"
          style={{ marginBottom: 32, fontSize: '40px' }}
          autoFocus
        />

        <div className="loah-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Details
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why are you building this habit? What's your trigger?"
            className="loah-input"
            style={{ minHeight: 120 }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="loah-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Frequency
              </div>
              <div className="flex gap-2">
                {(['daily', 'weekly', 'monthly'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFreqType(f)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '12px',
                      border: `1px solid ${freqType === f ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                      background: freqType === f ? 'var(--brand-primary-muted)' : 'var(--bg-surface-elevated)',
                      color: freqType === f ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: '13px', textTransform: 'capitalize',
                      transition: 'all 0.2s',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 16 }}>
                  Target Goal
                </div>
                <input
                  type="number"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="loah-input"
                  placeholder="e.g. 1"
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 16 }}>
                  Unit
                </div>
                <input
                  value={goalUnit}
                  onChange={(e) => setGoalUnit(e.target.value)}
                  className="loah-input"
                  placeholder="e.g. times, mins"
                />
              </div>
            </div>
          </div>

          <div className="loah-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Habit Color
            </div>
            <div className="flex gap-4 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: c,
                    border: color === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                    transition: 'all 0.2s ease',
                    opacity: color === c ? 1 : 0.6,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitEditor;
