'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Dump } from '../../types';
import { ArrowLeft, Lightbulb } from 'lucide-react';

export const DumpEditor: React.FC = () => {
  const router = useRouter();
  const onAddDump = useAppStore((s) => s.handleAddDump);

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSave = () => {
    if (!title.trim() && !description.trim()) {
      router.push('/dump' as any);
      return;
    }
    const newDump: Dump = {
      id: Date.now().toString(),
      title: title.trim() || 'Untitled Idea',
      description,
      createdAt: Date.now(),
    };
    onAddDump(newDump);
    router.push('/dump' as any);
  };

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden animate-fade-in"
      style={{ background: 'var(--bg-app)' }}
    >
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
          onClick={() => router.push('/dump' as any)}
          className="loah-icon-btn"
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lightbulb size={18} color="var(--cat-deepwork)" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>New Idea</span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => router.push('/dump' as any)} className="loah-btn-ghost">
            Discard
          </button>
          <button onClick={handleSave} className="loah-btn-primary">
            Save
          </button>
        </div>
      </div>

      {/* ── Form content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '32px 24px 100px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="WHAT'S THE BIG IDEA?"
          className="loah-title-input"
          style={{ marginBottom: 32, fontSize: '40px' }}
          autoFocus
        />

        <div className="loah-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>
            Flesh out details
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Unload descriptions, notes, or lists... Don't worry about formatting — just get it out of your head."
            className="loah-input"
            style={{ minHeight: 200 }}
          />
        </div>
      </div>
    </div>
  );
};

export default DumpEditor;
