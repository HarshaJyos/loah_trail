'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Task } from '../../types';
import { ArrowLeft, ListTodo, Plus, Calendar, Flag } from 'lucide-react';

export const TaskEditor: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onAddTask = useAppStore((s) => s.handleAddTask);
  const onDeleteDump = useAppStore((s) => s.handleDeleteDump);

  const [title, setTitle] = React.useState(searchParams?.get('title') || '');
  const [description, setDescription] = React.useState(searchParams?.get('desc') || '');
  const [priority, setPriority] = React.useState<'low' | 'medium' | 'high'>('medium');
  const [projectId, setProjectId] = React.useState<string | undefined>();
  const deleteDumpId = searchParams?.get('deleteDumpId');

  const projects = useAppStore((s) => s.projects);
  const activeProjects = React.useMemo(() => projects.filter((p) => !p.deletedAt && !p.archivedAt), [projects]);

  const handleSave = () => {
    if (!title.trim()) {
      router.push('/tasks' as any);
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      title: title.trim(),
      description,
      priority,
      projectId,
      isCompleted: false,
      createdAt: Date.now(),
    };
    onAddTask(newTask);
    if (deleteDumpId) {
      onDeleteDump(deleteDumpId);
    }
    router.push('/tasks' as any);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-fade-in" style={{ background: 'var(--bg-app)' }}>
      {/* ── Header ───────────────────────────────────────────── */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, background: 'var(--bg-canvas)',
          position: 'sticky', top: 0, zIndex: 50,
        }}
      >
        <button
          onClick={() => router.back()}
          className="loah-icon-btn"
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ListTodo size={18} color="var(--brand-primary)" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>New Task</span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.back()} className="loah-btn-ghost">
            Discard
          </button>
          <button onClick={handleSave} className="loah-btn-primary">
            Save Task
          </button>
        </div>
      </div>

      {/* ── Form content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '32px 24px 100px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
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
            placeholder="Add notes, subtasks, or context..."
            className="loah-input"
            style={{ minHeight: 120 }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Priority */}
          <div className="loah-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
              Priority Level
            </div>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '12px',
                    border: `1px solid ${priority === p ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                    background: priority === p ? 'var(--brand-primary-muted)' : 'var(--bg-surface-elevated)',
                    color: priority === p ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '13px', textTransform: 'capitalize',
                    transition: 'all 0.2s',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Project Assignment */}
          {activeProjects.length > 0 && (
            <div className="loah-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Assign to Project
              </div>
              <select
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value || undefined)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
                }}
              >
                <option value="">No Project</option>
                {activeProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskEditor;
