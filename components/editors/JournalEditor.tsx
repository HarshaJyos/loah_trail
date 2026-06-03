'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { JournalEntry, Mood } from '../../types';
import { ArrowLeft, Image as ImageIcon, X, Plus } from 'lucide-react';
import QuillEditor from '../ui/QuillEditor';

const MOODS: { type: Mood; emoji: string; label: string; color: string; bg: string }[] = [
  { type: 'awesome', emoji: '😁', label: 'Awesome', color: '#059669', bg: '#BBF7D0' },
  { type: 'good', emoji: '😊', label: 'Good', color: '#3366CC', bg: '#BFDBFE' },
  { type: 'neutral', emoji: '😐', label: 'Neutral', color: '#64748B', bg: '#E6E8EB' },
  { type: 'bad', emoji: '🙁', label: 'Bad', color: '#DB8A66', bg: '#FED7AA' },
  { type: 'awful', emoji: '😒', label: 'Awful', color: '#9F3834', bg: '#FECACA' },
];

interface JournalEditorProps {
  mode: 'new' | 'edit';
}

export const JournalEditor: React.FC<JournalEditorProps> = ({ mode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const journalEntries = useAppStore((s) => s.journalEntries);
  const onAddEntry = useAppStore((s) => s.handleAddJournalEntry);
  const onUpdateEntry = useAppStore((s) => s.handleUpdateJournalEntry);
  const convertingDump = useAppStore((s) => s.convertingDump);
  const onConvertComplete = useAppStore((s) => s.handleConvertComplete);
  const onClearConvertingDump = () => useAppStore.getState().setConvertingDump(null);

  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [mood, setMood] = React.useState<Mood>('neutral');
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');
  const [images, setImages] = React.useState<string[]>([]);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (mode === 'edit' && id) {
      const entry = journalEntries.find((j) => j.id === id);
      if (entry) {
        setTitle(entry.title || '');
        setContent(entry.content || '');
        setMood(entry.mood || 'neutral');
        setTags(entry.tags || []);
        setImages(entry.images || []);
      }
    } else if (mode === 'new') {
      const prompt = searchParams.get('prompt');
      if (prompt) setContent(prompt);
      if (convertingDump) {
        setTitle(convertingDump.title);
        setContent(convertingDump.description);
      }
    }
  }, [mode, id, journalEntries, convertingDump, searchParams]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      handleDiscard();
      return;
    }

    const entryData: Partial<JournalEntry> = {
      title: title.trim() || 'Untitled Log',
      content,
      mood,
      tags,
      images,
    };

    if (mode === 'edit' && id) {
      const existing = journalEntries.find((j) => j.id === id);
      if (existing) onUpdateEntry({ ...existing, ...entryData });
    } else {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: title.trim() || 'Untitled Log',
        content,
        mood,
        tags,
        images,
        createdAt: Date.now(),
      };
      onAddEntry(newEntry);
    }

    if (convertingDump) onConvertComplete();
    else onClearConvertingDump();

    router.push('/journal' as any);
  };

  const handleDiscard = () => {
    onClearConvertingDump();
    router.push('/journal' as any);
  };

  const addTag = () => {
    const clean = tagInput.trim().toLowerCase();
    if (!clean || tags.includes(clean)) return;
    setTags([...tags, clean]);
    setTagInput('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((f) => {
        const reader = new FileReader();
        reader.onloadend = () => setImages((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(f);
      });
    }
  };

  const activeMood = MOODS.find((m) => m.type === mood)!;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-fade-in" style={{ background: 'var(--bg-app)' }}>
      {/* ── Header ───────────── */}
      <div
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          background: 'var(--bg-canvas)',
          position: 'sticky', top: 0, zIndex: 50,
        }}
      >
        {/* Back */}
        <button onClick={handleDiscard} className="loah-icon-btn">
          <ArrowLeft size={18} />
        </button>

        {/* Title */}
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          {mode === 'edit' ? 'Edit Log' : 'New Log'}
        </span>

        {/* Right: mood indicator + image + save/discard */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Active mood pill */}
          <div
            style={{
              fontSize: 18, background: activeMood.bg + '40',
              borderRadius: 200, padding: '3px 10px',
              border: `1px solid ${activeMood.bg}`,
              cursor: 'default',
            }}
            title={activeMood.label}
          >
            {activeMood.emoji}
          </div>

          {/* Image attach */}
          <button
            onClick={() => fileRef.current?.click()}
            className="loah-icon-btn"
            title="Attach Image"
          >
            <ImageIcon size={18} />
          </button>
          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />

          {/* Discard */}
          <button
            onClick={handleDiscard}
            className="loah-btn-ghost"
          >
            Discard
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className="loah-btn-primary"
          >
            Save
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: 120, maxWidth: '800px', margin: '0 auto', width: '100%' }}>
        {/* Title input */}
        <div style={{ padding: '32px 24px 0' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="UNTITLED LOG"
            className="loah-title-input"
            style={{ fontSize: '40px' }}
            autoFocus
          />
        </div>

        {/* Mood selector */}
        <div
          style={{
            padding: '24px 24px 16px',
            display: 'flex', gap: 12,
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: 16,
          }}
        >
          {MOODS.map((m) => (
            <button
              key={m.type}
              onClick={() => setMood(m.type)}
              style={{
                width: 48, height: 48, borderRadius: '50%',
                fontSize: 24,
                border: `2px solid ${mood === m.type ? m.color : 'transparent'}`,
                background: mood === m.type ? m.bg + '20' : 'var(--bg-surface-elevated)',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: mood === m.type ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.15s ease',
              }}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>

        {/* Attached images */}
        {images.length > 0 && (
          <div style={{ padding: '8px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: 'relative', width: 70, height: 70 }}>
                <img
                  src={img}
                  alt={`att ${i}`}
                  style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-subtle)' }}
                />
                <button
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 18, height: 18, borderRadius: '50%',
                    background: '#EF4444', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Quill editor */}
        <div style={{ padding: '0 20px' }}>
          <QuillEditor
            value={content}
            onChange={setContent}
            placeholder="Start writing your log here... The formatting controls are placed in a floating island, creating a premium and distraction-free writing experience."
          />
        </div>

        {/* Tags */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(226,232,240,0.60)', marginTop: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Tags
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '3px 10px', borderRadius: 200,
                  background: 'rgba(137,121,255,0.10)',
                  border: '1px solid rgba(137,121,255,0.25)',
                  fontSize: 11, fontWeight: 700, color: '#8979FF',
                }}
              >
                {t}
                <button
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ABA2FD', display: 'flex' }}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                placeholder="Add tag..."
                style={{
                  background: '#FFFFFF', border: '1px solid var(--border-subtle)',
                  borderRadius: 200, padding: '4px 12px',
                  fontSize: 12, color: 'var(--text-primary)', outline: 'none',
                  width: 110,
                }}
              />
              <button
                onClick={addTag}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(137,121,255,0.15)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#8979FF',
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEditor;
