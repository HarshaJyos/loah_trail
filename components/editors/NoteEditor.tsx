'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Note, NoteItem } from '../../types';
import { ArrowLeft, Plus, Trash2, Pin, CheckSquare } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import QuillEditor from '../ui/QuillEditor';

const NOTE_COLORS = [
  '#FFFFFF', // White
  '#FFF9DB', // Soft Yellow Glow
  '#E6FCF5', // Soft Green Glow
  '#E8F4FD', // Soft Blue Glow
  '#F3F0FF', // Soft Purple Glow
  '#FFF0F6', // Soft Pink Glow
];

interface NoteEditorProps {
  mode: 'new' | 'edit';
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ mode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Zustand State & Actions
  const notes = useAppStore((state) => state.notes);
  const onAddNote = useAppStore((state) => state.handleAddNote);
  const onUpdateNote = useAppStore((state) => state.handleUpdateNote);
  const convertingDump = useAppStore((state) => state.convertingDump);
  const onConvertComplete = useAppStore((state) => state.handleConvertComplete);
  const onClearConvertingDump = () => useAppStore.getState().setConvertingDump(null);

  // Form State
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [noteType, setNoteType] = React.useState<'text' | 'list' | 'mixed'>('text');
  const [selectedColor, setSelectedColor] = React.useState(NOTE_COLORS[0]);
  const [isPinned, setIsPinned] = React.useState(false);

  // Checklist Items
  const [items, setItems] = React.useState<NoteItem[]>([]);
  const [itemInput, setItemInput] = React.useState('');

  // Load note if editing
  React.useEffect(() => {
    if (mode === 'edit' && id) {
      const note = notes.find((n) => n.id === id);
      if (note) {
        setTitle(note.title);
        setContent(note.content || '');
        setNoteType(note.type);
        setSelectedColor(note.color || NOTE_COLORS[0]);
        setIsPinned(note.isPinned || false);
        setItems(note.items || []);
      }
    } else if (mode === 'new' && convertingDump) {
      setTitle(convertingDump.title);
      setContent(convertingDump.description);
      setNoteType('text');
      setSelectedColor(NOTE_COLORS[0]);
      setIsPinned(false);
      setItems([]);
    }
  }, [mode, id, notes, convertingDump]);

  const handleSave = () => {
    if (!title.trim() && !content.trim() && items.length === 0) return;

    const noteData: Partial<Note> = {
      title: title.trim() || 'Untitled Note',
      content,
      type: noteType,
      color: selectedColor,
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
        title: title.trim() || 'Untitled Note',
        content,
        type: noteType,
        color: selectedColor,
        isPinned,
        items: noteType !== 'text' ? items : [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      onAddNote(newNote);
    }

    if (convertingDump) {
      onConvertComplete();
    } else {
      onClearConvertingDump();
    }

    router.push('/notes' as any);
  };

  const handleDiscard = () => {
    onClearConvertingDump();
    router.push('/notes' as any);
  };

  const addChecklistItem = () => {
    if (!itemInput.trim()) return;
    setItems([
      ...items,
      {
        id: Date.now().toString() + Math.random(),
        text: itemInput.trim(),
        isDone: false,
      },
    ]);
    setItemInput('');
  };

  const toggleChecklistItem = (itemid: string) => {
    setItems(
      items.map((i) => (i.id === itemid ? { ...i, isDone: !i.isDone } : i))
    );
  };

  const removeChecklistItem = (itemid: string) => {
    setItems(items.filter((i) => i.id !== itemid));
  };

  return (
    <div className="w-full min-h-screen bg-[#F5F7FA] text-[#1E1E1E] p-4 md:p-8 pb-32 max-w-3xl mx-auto flex flex-col space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleDiscard}
            className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-500 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200/60 active:scale-95"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'edit' ? 'Edit Note' : 'New Note'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Draft rich text notes and checklists.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pin Button */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`p-2.5 rounded-2xl border transition-all ${
              isPinned
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-500'
                : 'border-slate-200/60 text-slate-400 hover:text-slate-600 hover:bg-slate-150/40'
            }`}
            title={isPinned ? 'Unpin Note' : 'Pin Note'}
          >
            <Pin size={18} fill={isPinned ? 'currentColor' : 'none'} />
          </button>
          <Button onClick={handleDiscard} variant="ghost" className="text-slate-500">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            Save
          </Button>
        </div>
      </div>

      <Card variant="glass" className="p-6 md:p-8 space-y-6 border border-slate-200/60 shadow-xl bg-white text-sm font-bold">
        {/* Title */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Note Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title your thoughts..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#8979FF] focus:bg-white focus:shadow-[var(--glow-purple)] outline-none transition-all text-sm font-bold"
            autoFocus
          />
        </div>

        {/* Note Type & Color */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Note Format
            </label>
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:border-[#8979FF] outline-none transition-all"
            >
              <option value="text">Rich Text Only</option>
              <option value="list">Checklist Only</option>
              <option value="mixed">Mixed (Rich Text + Checklist)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 font-mono">
              Card Color Accent
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform active:scale-95 border
                    ${selectedColor === c ? 'scale-110 border-slate-800 ring-2 ring-[#8979FF]/20' : 'border-slate-200'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Rich Text Editor Block (Quill) */}
        {(noteType === 'text' || noteType === 'mixed') && (
          <div className="pt-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Rich Text Content
            </label>
            <QuillEditor
              value={content}
              onChange={setContent}
              placeholder="Flesh out your rich note content here..."
            />
          </div>
        )}

        {/* Checklist Block */}
        {(noteType === 'list' || noteType === 'mixed') && (
          <div className="pt-2 border-t border-slate-100">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
              Checklist Items
            </label>
            <div className="flex gap-2 mb-3">
              <input
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                placeholder="Add checklist item..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-[#8979FF] outline-none"
              />
              <Button type="button" onClick={addChecklistItem} variant="secondary" className="rounded-2xl">
                <Plus size={18} />
              </Button>
            </div>
            {items.length > 0 && (
              <div className="space-y-2 border border-slate-200/60 rounded-2xl p-3 bg-slate-50/50">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between bg-white border border-slate-200 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => toggleChecklistItem(it.id)}>
                      <button type="button" className={`text-slate-500 ${it.isDone ? 'text-emerald-500' : 'text-slate-300'}`}>
                        {it.isDone ? <CheckSquare size={16} /> : <div className="w-4 h-4 border border-current rounded" />}
                      </button>
                      <span className={`text-xs font-bold text-slate-800 ${it.isDone ? 'line-through opacity-50' : ''}`}>
                        {it.text}
                      </span>
                    </div>
                    <button type="button" onClick={() => removeChecklistItem(it.id)} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NoteEditor;
