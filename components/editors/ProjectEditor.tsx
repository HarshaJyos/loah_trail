'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Project } from '../../types';
import { ArrowLeft, Briefcase, Plus, Folder } from 'lucide-react';

export const ProjectEditor: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const onAddProject = useAppStore((s) => s.handleAddProject);
  const onDeleteDump = useAppStore((s) => s.handleDeleteDump);

  const [title, setTitle] = React.useState(searchParams?.get('title') || '');
  const [description, setDescription] = React.useState(searchParams?.get('desc') || '');
  const deleteDumpId = searchParams?.get('deleteDumpId');

  const handleSave = () => {
    if (!title.trim()) {
      router.push('/projects' as any);
      return;
    }
    const newProject: Project = {
      id: Date.now().toString(),
      title: title.trim(),
      description,
      status: 'active',
      createdAt: Date.now(),
    };
    onAddProject(newProject);
    if (deleteDumpId) {
      onDeleteDump(deleteDumpId);
    }
    router.push('/projects' as any);
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
        <button onClick={() => router.back()} className="loah-icon-btn">
          <ArrowLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Briefcase size={18} color="var(--brand-primary)" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>New Project</span>
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
            style={{ minHeight: 200 }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
