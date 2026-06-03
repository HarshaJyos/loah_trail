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
      style={{ background: '#FFFAC3' }}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid #FEF08A',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, background: '#FFFAC3',
          position: 'sticky', top: 0, zIndex: 50,
        }}
      >
        <button
          onClick={() => router.push('/dump' as any)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: '1px solid #FEF08A', background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748B',
          }}
        >
          <ArrowLeft size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Lightbulb size={18} color="#D97706" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1E1E1E' }}>New Idea</span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => router.push('/dump' as any)}
            style={{
              padding: '7px 14px', borderRadius: 200,
              border: '1px solid #FEF08A', background: 'transparent',
              fontSize: 12, fontWeight: 700, color: '#64748B', cursor: 'pointer',
            }}
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '7px 16px', borderRadius: 200,
              background: '#8979FF', border: 'none',
              fontSize: 12, fontWeight: 700, color: '#fff', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(137,121,255,0.30)',
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* ── Form content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '16px 20px 80px' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="WHAT'S THE BIG IDEA?"
          className="loah-title-input"
          style={{ marginBottom: 16 }}
          autoFocus
        />

        <div
          style={{
            background: 'rgba(255,255,255,0.60)',
            border: '1px solid #FEF08A',
            borderRadius: 15,
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Flesh out details
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Unload descriptions, notes, or lists... Don't worry about formatting — just get it out of your head."
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              fontSize: 14, color: '#1E1E1E', lineHeight: 1.7,
              resize: 'none', minHeight: 200,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DumpEditor;
