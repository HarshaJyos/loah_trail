'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { JournalEntry, Mood } from '../../types';
import { ArrowLeft, Smile, Plus, Trash2, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import QuillEditor from '../ui/QuillEditor';

const MOODS: { type: Mood; emoji: string; label: string; color: string }[] = [
  { type: 'awesome', emoji: '🤩', label: 'Awesome', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { type: 'good', emoji: '😊', label: 'Good', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { type: 'neutral', emoji: '😐', label: 'Neutral', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' },
  { type: 'bad', emoji: '😕', label: 'Bad', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  { type: 'awful', emoji: '😭', label: 'Awful', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
];

interface JournalEditorProps {
  mode: 'new' | 'edit';
}

export const JournalEditor: React.FC<JournalEditorProps> = ({ mode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Zustand State & Actions
  const journalEntries = useAppStore((state) => state.journalEntries);
  const onAddEntry = useAppStore((state) => state.handleAddJournalEntry);
  const onUpdateEntry = useAppStore((state) => state.handleUpdateJournalEntry);
  const convertingDump = useAppStore((state) => state.convertingDump);
  const onConvertComplete = useAppStore((state) => state.handleConvertComplete);
  const onClearConvertingDump = () => useAppStore.getState().setConvertingDump(null);

  // Form State
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [mood, setMood] = React.useState<Mood>('neutral');
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');

  // Load journal entry if editing
  React.useEffect(() => {
    if (mode === 'edit' && id) {
      const entry = journalEntries.find((j) => j.id === id);
      if (entry) {
        setTitle(entry.title || '');
        setContent(entry.content || '');
        setMood(entry.mood || 'neutral');
        setTags(entry.tags || []);
      }
    } else if (mode === 'new') {
      const pr = searchParams.get('prompt');
      if (pr) {
        setContent(pr);
      }
      if (convertingDump) {
        setTitle(convertingDump.title);
        setContent(convertingDump.description);
        setMood('neutral');
        setTags([]);
      }
    }
  }, [mode, id, journalEntries, convertingDump, searchParams]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    const entryData: Partial<JournalEntry> = {
      title: title.trim() || 'Untitled Log',
      content,
      mood,
      tags,
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
        createdAt: Date.now(),
      };
      onAddEntry(newEntry);
    }

    if (convertingDump) {
      onConvertComplete();
    } else {
      onClearConvertingDump();
    }

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

  const removeTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
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
              {mode === 'edit' ? 'Edit Log' : 'New Journal Log'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Check in with yourself and record reflections.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
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
            Log Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="How was your day?"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#8979FF] focus:bg-white focus:shadow-[var(--glow-purple)] outline-none transition-all text-sm font-bold"
            autoFocus
          />
        </div>

        {/* Mood Selector Grid */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5 font-mono">
            How are you feeling?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {MOODS.map((m) => {
              const isSelected = mood === m.type;
              return (
                <button
                  key={m.type}
                  type="button"
                  onClick={() => setMood(m.type)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 active:scale-95
                    ${
                      isSelected
                        ? 'bg-[#8979FF] border-transparent text-white shadow-lg shadow-indigo-500/25 scale-[1.02]'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50 text-slate-700'
                    }`}
                >
                  <span className="text-2xl mb-1">{m.emoji}</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quill Editor */}
        <div className="pt-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Reflections / Journal Details
          </label>
          <QuillEditor
            value={content}
            onChange={setContent}
            placeholder="Start writing down your feelings, thoughts, and reflections..."
          />
        </div>

        {/* Tags list */}
        <div className="pt-2 border-t border-slate-100">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Tags / Labels
          </label>
          <div className="flex gap-2 mb-3">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 focus:border-[#8979FF] outline-none"
            />
            <Button type="button" onClick={addTag} variant="secondary" className="rounded-2xl">
              <Plus size={18} />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-600 rounded-full text-xs font-bold border border-purple-500/20 font-mono">
                  <span>{tag}</span>
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-rose-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default JournalEditor;
