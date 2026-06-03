'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Routine, RoutineStep, Reminder } from '../../types';
import { ArrowLeft, Route, Plus, Trash2, Bell, Calendar as CalendarIcon, Repeat, Link2 } from 'lucide-react';

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
  const [type, setType] = React.useState<'repeatable' | 'once'>('repeatable');
  const [scheduledDate, setScheduledDate] = React.useState('');
  const [scheduledTime, setScheduledTime] = React.useState('');
  
  const [steps, setSteps] = React.useState<RoutineStep[]>([{ id: '1', title: 'Step 1', durationSeconds: 300 }]);
  const [reminders, setReminders] = React.useState<Reminder[]>([]);

  // Add Step State
  const [newStepTitle, setNewStepTitle] = React.useState('');
  const [newStepDuration, setNewStepDuration] = React.useState('5');

  React.useEffect(() => {
    if (existingRoutine) {
      setTitle(existingRoutine.title);
      setColor(existingRoutine.color || 'var(--cat-meditation)');
      setType(existingRoutine.type || 'repeatable');
      if (existingRoutine.startTime) {
        const d = new Date(existingRoutine.startTime);
        setScheduledDate(d.toISOString().split('T')[0]);
        setScheduledTime(d.toTimeString().substring(0, 5));
      }
      if (existingRoutine.steps && existingRoutine.steps.length > 0) {
        setSteps(existingRoutine.steps.map(s => ({
          id: s.id,
          title: s.title,
          durationSeconds: s.durationSeconds
        })));
      }
      if (existingRoutine.reminders) {
        setReminders(existingRoutine.reminders);
      }
    }
  }, [existingRoutine]);

  const deleteDumpId = searchParams?.get('deleteDumpId');

  const handleSave = () => {
    if (!title.trim()) {
      router.push('/routines' as any);
      return;
    }

    let startTime: number | undefined;
    if (type === 'once') {
      if (scheduledDate && scheduledTime) {
        startTime = new Date(`${scheduledDate}T${scheduledTime}`).getTime();
      } else if (scheduledDate) {
        startTime = new Date(`${scheduledDate}T00:00:00`).getTime();
      }
    }

    const newRoutine: Routine = {
      id: existingRoutine ? existingRoutine.id : Date.now().toString(),
      title: title.trim(),
      color,
      type,
      startTime,
      steps: steps.map(s => ({ id: s.id, title: s.title, durationSeconds: s.durationSeconds })),
      reminders,
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

  const handleAddNewStep = () => {
    if (!newStepTitle.trim()) return;
    setSteps([...steps, { id: Date.now().toString(), title: newStepTitle, durationSeconds: parseInt(newStepDuration) * 60 || 300 }]);
    setNewStepTitle('');
    setNewStepDuration('5');
  };

  const totalMinutes = steps.reduce((acc, step) => acc + (step.durationSeconds / 60), 0);

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
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
            {existingRoutine ? 'Edit Routine' : 'New Routine'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.back()} className="loah-btn-ghost">
            Discard
          </button>
          <button onClick={handleSave} className="loah-btn-primary" style={{ padding: '6px 16px', background: '#E2E8F0', color: '#0F172A', border: 'none', borderRadius: '8px' }}>
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '32px 24px 100px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Routine Name..."
          className="loah-title-input"
          style={{ marginBottom: 24, fontSize: '28px' }}
          autoFocus
        />

        <div className="flex flex-wrap gap-2 items-center mb-6">
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              onClick={() => setType('repeatable')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 12px', fontSize: 12, fontWeight: 600,
                background: type === 'repeatable' ? 'var(--border-subtle)' : 'transparent',
                color: type === 'repeatable' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRight: '1px solid var(--border-subtle)'
              }}
            >
              <Repeat size={14} /> REPEATABLE
            </button>
            <button
              onClick={() => setType('once')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 12px', fontSize: 12, fontWeight: 600,
                background: type === 'once' ? 'var(--border-subtle)' : 'transparent',
                color: type === 'once' ? 'var(--text-primary)' : 'var(--text-secondary)'
              }}
            >
              <CalendarIcon size={14} /> RUN ONCE
            </button>
          </div>
          {type === 'once' && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                style={{
                  background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
                  padding: '8px 12px', borderRadius: '8px', fontSize: 12, color: 'var(--text-primary)', outline: 'none'
                }}
              />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                style={{
                  background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
                  padding: '8px 12px', borderRadius: '8px', fontSize: 12, color: 'var(--text-primary)', outline: 'none'
                }}
              />
            </div>
          )}
        </div>

        <div className="loah-card" style={{ padding: '16px', marginBottom: '24px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600 }}>
            <Bell size={16} /> Reminders
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              style={{ flex: 1, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '10px 12px', borderRadius: '8px', fontSize: 13, color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
            </select>
            <button style={{ background: '#DBEAFE', color: '#1E40AF', padding: '10px 16px', borderRadius: '8px', fontSize: 13, fontWeight: 600, border: 'none' }}>
              Add
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>SEQUENCE ({steps.length})</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>TOTAL: {totalMinutes}m</span>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px', display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <input
            value={newStepTitle}
            onChange={(e) => setNewStepTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNewStep()}
            placeholder="Add New Step"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-primary)' }}
          />
          <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: '6px', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', fontSize: 12, color: 'var(--text-secondary)' }}>
            Link <Link2 size={12} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              type="number"
              value={newStepDuration}
              onChange={(e) => setNewStepDuration(e.target.value)}
              style={{ width: 40, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-primary)', textAlign: 'center' }}
            />
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>m</span>
          </div>
          <button onClick={handleAddNewStep} style={{ width: 32, height: 32, background: '#DBEAFE', color: '#1E40AF', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
            <Plus size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {steps.map((step, idx) => (
            <div key={step.id} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                {idx + 1}
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {step.title}
              </span>
              <div style={{ padding: '4px 8px', borderRadius: '12px', background: 'var(--border-subtle)', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>
                {step.durationSeconds / 60}m
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default RoutineEditor;
