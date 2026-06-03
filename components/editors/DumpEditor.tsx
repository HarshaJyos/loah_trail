'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Dump } from '../../types';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export const DumpEditor: React.FC = () => {
  const router = useRouter();

  // Zustand State & Actions
  const onAddDump = useAppStore((state) => state.handleAddDump);

  // Form State
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');

  const handleSave = () => {
    if (!title.trim() && !description.trim()) return;

    const newDump: Dump = {
      id: Date.now().toString(),
      title: title.trim() || 'Untitled Idea',
      description: description,
      createdAt: Date.now(),
    };

    onAddDump(newDump);
    router.push('/dump' as any);
  };

  const handleDiscard = () => {
    router.push('/dump' as any);
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
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Lightbulb size={24} className="text-amber-500 fill-amber-500/20" /> Capture Idea
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Dump messy, raw, and incomplete thoughts here to organize later.
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
            Idea Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's the big idea?"
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#8979FF] focus:bg-white focus:shadow-[var(--glow-purple)] outline-none transition-all text-sm font-bold"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 font-mono">
            Flesh out details
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Unload descriptions, notes, or lists..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder-slate-400 focus:border-[#8979FF] focus:bg-white outline-none transition-all min-h-[160px] resize-none"
          />
        </div>
      </Card>
    </div>
  );
};

export default DumpEditor;
