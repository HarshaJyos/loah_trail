'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Note, NoteItem } from '../../types';
import { ArrowLeft, Pin, X, Plus, Trash2, CheckSquare } from 'lucide-react';
import QuillEditor from '../ui/QuillEditor';

// Note background colors from Frame132
const NOTE_BG_COLORS = [
  { label: 'Default', bg: '#FFFFFF', border: '#E2E8F0' },
  { label: 'Yellow',  bg: '#FFFAC3', border: '#FEF08A' },
  { label: 'Red',     bg: '#FECACA', border: '#FCA5A5' },
  { label: 'Orange',  bg: '#FED7AA', border: '#FDBA74' },
  { label: 'Green',   bg: '#BBF7D0', border: '#6EE7B7' },
  { label: 'Blue',    bg: '#C3E5FF', border: '#93C5FD' },
  { label: 'Purple',  bg: '#DDD6FE', border: '#C4B5FD' },
  { label: 'Pink',    bg: '#FBD1AB', border: '#FCA5A5' },
];

interface NoteEditorProps {
  mode: 'new' | 'edit';
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ mode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const notes = useAppStore((s) => s.notes);
  const onAddNote = useAppStore((s) => s.handleAddNote);
  const onUpdateNote = useAppStore((s) => s.handleUpdateNote);
  const convertingDump = useAppStore((s) => s.convertingDump);
  const onConvertComplete = useAppStore((s) => s.handleConvertComplete);
  const onClearConvertingDump = () => useAppStore.getState().setConvertingDump(null);

  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [noteType, setNoteType] = React.useState<'text' | 'list' | 'mixed'>('text');
  const [selectedColorIdx, setSelectedColorIdx] = React.useState(0);
  const [isPinned, setIsPinned] = React.useState(false);
  const [items, setItems] = React.useState<NoteItem[]>([]);
  const [itemInput, setItemInput] = React.useState('');
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  React.useEffect(() => {
    if (mode === 'edit' && id) {
      const note = notes.find((n) => n.id === id);
      if (note) {
        setTitle(note.title);
        setContent(note.content || '');
        setNoteType(note.type);
        setIsPinned(note.isPinned || false);
        setItems(note.items || []);
        // Find matching color
        const idx = NOTE_BG_COLORS.findIndex((c) => c.bg === note.color);
        setSelectedColorIdx(idx >= 0 ? idx : 0);
      }
    } else if (mode === 'new' && convertingDump) {
      setTitle(convertingDump.title);
      setContent(convertingDump.description);
    }
  }, [mode, id, notes, convertingDump]);

  const handleSave = () => {
    if (!title.trim() && !content.trim() && items.length === 0) {
      handleDiscard();
      return;
    }

    const noteData: Partial<Note> = {
      title: title.trim() || 'Untitled',
      content,
      type: noteType,
      color: NOTE_BG_COLORS[selectedColorIdx].bg,
      isPinned,
      items: noteType !== 'text' ? items : [],
      updatedAt: Date.now(),
    };

    if (mode === 'edit' && id) {
      const existing = notes.find((n) => n.id === id);
      if (existing) onUpdateNote({ ...existing, ...noteData });
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim() || 'Untitled',
        content,
        type: noteType,
        color: NOTE_BG_COLORS[selectedColorIdx].bg,
        isPinned,
        items: noteType !== 'text' ? items : [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      onAddNote(newNote);
    }

    if (convertingDump) onConvertComplete();
    else onClearConvertingDump();

    router.push('/notes' as any);
  };

  const handleDiscard = () => {
    onClearConvertingDump();
    router.push('/notes' as any);
  };

  const addItem = () => {
    if (!itemInput.trim()) return;
    setItems([...items, { id: Date.now().toString() + Math.random(), text: itemInput.trim(), isDone: false }]);
    setItemInput('');
  };

  const selectedColor = NOTE_BG_COLORS[selectedColorIdx];

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden animate-fade-in"
      style={{ background: selectedColor.bg }}
    >
      {/* ── Header matching Frame132 header-new-notes ──────────── */}
      <div
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${selectedColor.border}`,
          background: selectedColor.bg,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Left: back button */}
        <button
          onClick={handleDiscard}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: `1px solid ${selectedColor.border}`,
            background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748B',
          }}
        >
          <ArrowLeft size={18} />
        </button>

        {/* Center: title */}
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1E1E1E' }}>
          {mode === 'edit' ? 'Edit Note' : 'New Note'}
        </span>

        {/* Right: Pin + Color + Save/Discard */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Color picker trigger */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: `1px solid ${selectedColor.border}`,
                background: selectedColor.bg,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Pick Color"
            >
              <div
                style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: selectedColor.bg,
                  border: `2px solid ${selectedColor.border}`,
                  outline: '2px solid rgba(0,0,0,0.1)',
                }}
              />
            </button>
            {showColorPicker && (
              <div
                style={{
                  position: 'absolute', top: 44, right: 0,
                  background: '#FFFFFF', borderRadius: 14,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  padding: '10px 12px',
                  display: 'flex', gap: 8, flexWrap: 'wrap',
                  width: 160, zIndex: 200,
                }}
                className="animate-fade-in"
              >
                {NOTE_BG_COLORS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedColorIdx(i); setShowColorPicker(false); }}
                    style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: c.bg,
                      border: `2px solid ${c.border}`,
                      outline: selectedColorIdx === i ? '2px solid #8979FF' : '2px solid transparent',
                      outlineOffset: 2,
                      cursor: 'pointer',
                      transition: 'outline 0.15s',
                    }}
                    title={c.label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pin */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: `1px solid ${isPinned ? '#8979FF' : selectedColor.border}`,
              background: isPinned ? 'rgba(137,121,255,0.10)' : 'transparent',
              color: isPinned ? '#8979FF' : '#64748B',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={16} fill={isPinned ? 'currentColor' : 'none'} />
          </button>

          {/* Discard */}
          <button
            onClick={handleDiscard}
            style={{
              padding: '7px 14px', borderRadius: 200,
              border: `1px solid ${selectedColor.border}`,
              background: 'transparent',
              fontSize: 12, fontWeight: 700, color: '#64748B',
              cursor: 'pointer',
            }}
          >
            Discard
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            style={{
              padding: '7px 16px', borderRadius: 200,
              background: '#8979FF', border: 'none',
              fontSize: 12, fontWeight: 700, color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(137,121,255,0.30)',
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* ── Content area — full page Quill editor ───────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ paddingBottom: 120 }}>
        {/* Title */}
        <div style={{ padding: '16px 20px 0' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="UNTITLED"
            className="loah-title-input"
            autoFocus
          />
        </div>

        {/* Note type selector (minimal pills) */}
        <div style={{ padding: '8px 20px', display: 'flex', gap: 6 }}>
          {(['text', 'list', 'mixed'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setNoteType(t)}
              style={{
                padding: '3px 10px', borderRadius: 200,
                fontSize: 10, fontWeight: 700,
                border: `1px solid ${noteType === t ? '#8979FF' : selectedColor.border}`,
                background: noteType === t ? 'rgba(137,121,255,0.10)' : 'transparent',
                color: noteType === t ? '#8979FF' : '#64748B',
                cursor: 'pointer',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}
            >
              {t === 'text' ? 'Rich Text' : t === 'list' ? 'Checklist' : 'Mixed'}
            </button>
          ))}
        </div>

        {/* Rich Text Quill Editor */}
        {(noteType === 'text' || noteType === 'mixed') && (
          <div style={{ padding: '0 20px' }}>
            <QuillEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing your note here... The formatting controls are placed in a floating island, creating a premium and distraction-free writing experience."
            />
          </div>
        )}

        {/* Checklist */}
        {(noteType === 'list' || noteType === 'mixed') && (
          <div style={{ padding: '12px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Checklist
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                placeholder="Add item..."
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.6)',
                  border: `1px solid ${selectedColor.border}`,
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 13, color: '#1E1E1E',
                  outline: 'none',
                }}
              />
              <button
                onClick={addItem}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#8979FF', border: 'none', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Plus size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {items.map((it) => (
                <div
                  key={it.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(255,255,255,0.5)',
                    border: `1px solid ${selectedColor.border}`,
                    borderRadius: 10, padding: '8px 12px',
                  }}
                >
                  <button
                    onClick={() => setItems(items.map((i) => i.id === it.id ? { ...i, isDone: !i.isDone } : i))}
                    style={{
                      width: 16, height: 16, borderRadius: 4,
                      border: `1.5px solid ${it.isDone ? '#8979FF' : '#D4D4D4'}`,
                      background: it.isDone ? '#8979FF' : 'transparent',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      flex: 1, fontSize: 13, color: it.isDone ? '#9CA3AF' : '#1E1E1E',
                      textDecoration: it.isDone ? 'line-through' : 'none',
                    }}
                  >
                    {it.text}
                  </span>
                  <button
                    onClick={() => setItems(items.filter((i) => i.id !== it.id))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
