'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Project, Priority } from '../../types';
import { ArrowLeft, Briefcase, Plus, Folder } from 'lucide-react';

export const ProjectEditor: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onAddProject = useAppStore((s) => s.handleAddProject);
  const onUpdateProject = useAppStore((s) => s.handleUpdateProject);
  const projects = useAppStore((s) => s.projects);
  const onDeleteDump = useAppStore((s) => s.handleDeleteDump);

  const projectId = searchParams?.get('id');
  const existingProject = React.useMemo(() => projects.find(p => p.id === projectId), [projects, projectId]);

  const [title, setTitle] = React.useState(searchParams?.get('title') || '');
  const [description, setDescription] = React.useState(searchParams?.get('desc') || '');
  const [priority, setPriority] = React.useState<Priority>('Medium');
  const [deadline, setDeadline] = React.useState('');
  const [color, setColor] = React.useState('var(--cat-deepwork)');

  React.useEffect(() => {
    if (existingProject) {
      setTitle(existingProject.title);
      setDescription(existingProject.description || '');
      setPriority(existingProject.priority);
      setColor(existingProject.color || 'var(--cat-deepwork)');
      if (existingProject.dueDate) {
        const d = new Date(existingProject.dueDate);
        setDeadline(d.toISOString().split('T')[0]);
      }
    }
  }, [existingProject]);

  const deleteDumpId = searchParams?.get('deleteDumpId');

  const handleSave = () => {
    if (!title.trim()) {
      router.push('/projects' as any);
      return;
    }
    const newProject: Project = {
      id: existingProject ? existingProject.id : Date.now().toString(),
      title: title.trim(),
      description,
      priority,
      color,
      startDate: existingProject ? existingProject.startDate : Date.now(),
      dueDate: deadline ? new Date(deadline).getTime() : (existingProject ? existingProject.dueDate : Date.now() + 86400000 * 7),
      status: existingProject ? existingProject.status : 'active',
      createdAt: existingProject ? existingProject.createdAt : Date.now(),
    };
    if (existingProject) {
      onUpdateProject(newProject);
    } else {
      onAddProject(newProject);
    }
    if (deleteDumpId) {
      onDeleteDump(deleteDumpId);
    }
    router.push('/projects' as any);
  };

  const colors = [
    'var(--cat-deepwork)', 'var(--cat-learning)', 'var(--cat-meditation)',
    'var(--cat-movement)', 'var(--cat-journaling)', 'var(--cat-hydration)'
  ];

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
        <button onClick={() => router.back()} className="loah-icon-btn">
          <ArrowLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Briefcase size={18} color={color} />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {existingProject ? 'Edit Project' : 'New Project'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.back()} className="loah-btn-ghost">
            Discard
          </button>
          <button onClick={handleSave} className="loah-btn-primary">
            Save Project
          </button>
        </div>
      </div>

      {/* ── Form content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '32px 24px 100px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name your project..."
          className="loah-title-input"
          style={{ marginBottom: 32, fontSize: '40px' }}
          autoFocus
        />

        <div className="loah-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Project Vision & Details
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Define the scope, goals, or references for this project..."
            className="loah-input"
            style={{ minHeight: 160 }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="loah-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                Priority Level
              </div>
              <div className="flex gap-2">
                {(['High', 'Medium', 'Low'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '12px',
                      border: `1px solid ${priority === p ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
                      background: priority === p ? 'var(--brand-primary-muted)' : 'var(--bg-surface-elevated)',
                      color: priority === p ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontWeight: 600, fontSize: '13px',
                      transition: 'all 0.2s',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, marginTop: 16 }}>
                Target Deadline
              </div>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="loah-input"
              />
            </div>
          </div>

          <div className="loah-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
              Project Color
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

export default ProjectEditor;
