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
  const onDeleteDump = useAppStore((s) => s.handleDeleteDump);

  const [title, setTitle] = React.useState(searchParams?.get('title') || '');
  const [description, setDescription] = React.useState(searchParams?.get('desc') || '');
  const [color, setColor] = React.useState('var(--cat-learning)');
  const deleteDumpId = searchParams?.get('deleteDumpId');

  const handleSave = () => {
    if (!title.trim()) {
      router.push('/habits' as any);
      return;
    }
    const newHabit: Habit = {
      id: Date.now().toString(),
      title: title.trim(),
      description,
      color,
      type: 'simple',
      frequency: { type: 'daily' },
      goal: { type: 'check', target: 1, unit: 'times' },
      history: {},
      streak: 0,
      createdAt: Date.now(),
    };
    onAddHabit(newHabit);
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
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>New Habit</span>
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

        <div className="loah-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Habit Color
          </div>
          <div className="flex gap-4">
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
  );
};

export default HabitEditor;
