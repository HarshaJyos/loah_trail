'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Routine } from '../../types';
import { ArrowLeft, Route, Plus, Trash2 } from 'lucide-react';

export const RoutineEditor: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onAddRoutine = useAppStore((s) => s.handleAddRoutine);
  const onUpdateRoutine = useAppStore((s) => s.handleUpdateRoutine);
  const routines = useAppStore((s) => s.routines);
  const onDeleteDump = useAppStore((s) => s.handleDeleteDump);

  const routineId = searchParams?.get('id');
  const existingRoutine = React.useMemo(() => routines.find(r => r.id === routineId), [routines, routineId]);

  const [title, setTitle] = React.useState(searchParams?.get('title') || '');
  const [color, setColor] = React.useState('var(--cat-meditation)');
  const [steps, setSteps] = React.useState([{ id: '1', title: 'Step 1', duration: 300 }]);

  React.useEffect(() => {
    if (existingRoutine) {
      setTitle(existingRoutine.title);
      setColor(existingRoutine.color || 'var(--cat-meditation)');
      if (existingRoutine.steps && existingRoutine.steps.length > 0) {
        setSteps(existingRoutine.steps.map(s => ({
          id: s.id,
          title: s.title,
          duration: s.durationSeconds
        })));
      }
    }
  }, [existingRoutine]);

  const deleteDumpId = searchParams?.get('deleteDumpId');

  const handleSave = () => {
    if (!title.trim()) {
      router.push('/routines' as any);
      return;
    }
    const newRoutine: Routine = {
      id: existingRoutine ? existingRoutine.id : Date.now().toString(),
      title: title.trim(),
      color,
      type: existingRoutine ? existingRoutine.type : 'repeatable',
      steps: steps.map(s => ({ id: s.id, title: s.title, durationSeconds: s.duration })),
    };
    if (existingRoutine) {
      onUpdateRoutine(newRoutine);
    } else {
      onAddRoutine(newRoutine);
    }
    if (deleteDumpId) {
      onDeleteDump(deleteDumpId);
    }
    router.push('/routines' as any);
  };

  const colors = [
    'var(--cat-meditation)', 'var(--cat-hydration)', 'var(--cat-learning)',
    'var(--cat-movement)', 'var(--cat-journaling)', 'var(--cat-deepwork)'
  ];

  const addStep = () => {
    setSteps([...steps, { id: Date.now().toString(), title: `Step ${steps.length + 1}`, duration: 300 }]);
  };

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
          <Route size={18} color={color} />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {existingRoutine ? 'Edit Routine' : 'New Routine'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.back()} className="loah-btn-ghost">
            Discard
          </button>
          <button onClick={handleSave} className="loah-btn-primary">
            Save Routine
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '32px 24px 100px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Routine Name"
          className="loah-title-input"
          style={{ marginBottom: 32, fontSize: '40px' }}
          autoFocus
        />

        <div className="loah-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Routine Steps
            </div>
            <button onClick={addStep} className="loah-btn-ghost" style={{ padding: '6px 12px', fontSize: '12px' }}>
              <Plus size={14} /> Add Step
            </button>
          </div>
          
          <div className="flex flex-col gap-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex gap-3 items-center">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {idx + 1}
                </div>
                <input
                  value={step.title}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[idx].title = e.target.value;
                    setSteps(newSteps);
                  }}
                  placeholder="Step title"
                  className="loah-input flex-1"
                  style={{ background: 'var(--bg-surface-elevated)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}
                />
                <input
                  type="number"
                  value={step.duration / 60}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[idx].duration = Math.max(1, parseInt(e.target.value) || 1) * 60;
                    setSteps(newSteps);
                  }}
                  className="loah-input w-24"
                  style={{ background: 'var(--bg-surface-elevated)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>min</span>
                <button
                  onClick={() => setSteps(steps.filter((_, i) => i !== idx))}
                  style={{ padding: '8px', color: 'var(--danger-default)', opacity: steps.length > 1 ? 1 : 0.3 }}
                  disabled={steps.length <= 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="loah-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Routine Color
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

export default RoutineEditor;
