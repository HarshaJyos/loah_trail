'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Dump } from '../../types';
import {
  Plus,
  Trash2,
  ListTodo,
  StickyNote,
  BookOpen,
  Brain,
  X,
  Lightbulb,
  ArrowRight,
  CornerDownRight,
  Sparkles,
  Archive,
  RefreshCcw,
  Briefcase,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useRouter } from 'next/navigation';

export const BrainDumpModule: React.FC = () => {
  const dumps = useAppStore((state) => state.dumps);
  const onAddDump = useAppStore((state) => state.handleAddDump);
  const onDeleteDump = useAppStore((state) => state.handleDeleteDump);
  const onConvertToTask = useAppStore((state) => state.convertDumpToTask);
  const onConvertToNote = useAppStore((state) => state.convertDumpToNote);
  const onConvertToJournal = useAppStore((state) => state.convertDumpToJournal);
  const onConvertToProject = useAppStore((state) => state.convertDumpToProject);
  const onArchiveDump = (id: string) => useAppStore.getState().handleArchive(id, 'dump');
  const onUnarchiveDump = (id: string) => useAppStore.getState().handleUnarchive(id, 'dump');

  const router = useRouter();
  const autoTrigger = useAppStore((state) => state.triggerDumpModal);
  const setTriggerDumpModal = useAppStore((state) => state.setTriggerDumpModal);
  const onAutoTriggerHandled = () => setTriggerDumpModal(false);

  const [showArchived, setShowArchived] = React.useState(false);

  const activeDumps = React.useMemo(() => {
    return dumps
      .filter((d) => !d.deletedAt && !d.archivedAt)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [dumps]);

  const archivedDumps = React.useMemo(() => {
    return dumps
      .filter((d) => !d.deletedAt && d.archivedAt)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [dumps]);

  const currentViewDumps = showArchived ? archivedDumps : activeDumps;

  // Handle Auto Trigger
  React.useEffect(() => {
    if (autoTrigger) {
      openModal();
      onAutoTriggerHandled();
    }
  }, [autoTrigger]);

  const openModal = () => {
    router.push('/dump/new' as any);
  };

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto no-scrollbar pb-32 max-w-7xl mx-auto flex flex-col space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-row justify-between items-center border-b border-slate-200/60 pb-4 shrink-0 gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Brain Dump
          </h2>
          {showArchived && (
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-2 border border-orange-500/20 inline-block font-mono">
              Archived View
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`p-2.5 rounded-xl border transition-all ${
              showArchived
                ? 'bg-amber-500/15 border-amber-500/20 text-amber-400'
                : 'border-slate-200/60 text-slate-400 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
            title={showArchived ? 'View Active' : 'View Archive'}
          >
            <Archive size={20} />
          </button>
          <Button
            onClick={openModal}
            variant="primary"
            className="flex items-center gap-2 active:scale-95"
          >
            <Plus size={18} />
            <span>New Idea</span>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 pb-10">
        {currentViewDumps.map((dump) => (
          <div
            key={dump.id}
            className="break-inside-avoid bg-white border border-slate-200/60 rounded-2xl p-5 hover:border-violet-500/30 transition-all duration-300 group flex flex-col relative overflow-hidden h-fit"
          >
            {/* Ambient gold glow decoration */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-40 group-hover:opacity-100 transition-opacity" />

            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="bg-yellow-500/10 p-2 rounded-lg text-amber-600 border border-amber-200/60 group-hover:scale-110 transition-transform">
                <Lightbulb size={18} fill="currentColor" className="opacity-20" />
              </div>
              <span className="text-[9px] font-bold font-mono text-slate-400">
                {new Date(dump.createdAt).toLocaleDateString()}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-tight group-hover:text-[#8979FF] transition-colors">
              {dump.title}
            </h3>

            <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed mb-6">
              {dump.description || <span className="italic text-slate-500">No details provided...</span>}
            </p>

            <div className="pt-4 border-t border-slate-200/60 mt-auto">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 font-mono">
                  <CornerDownRight size={12} className="text-[#8979FF]" /> Convert Idea
                </span>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {showArchived ? (
                    <button
                      onClick={() => onUnarchiveDump(dump.id)}
                      className="text-slate-400 hover:text-slate-900 transition-all p-1.5 hover:bg-slate-100/50 rounded-lg"
                      title="Restore"
                    >
                      <RefreshCcw size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onArchiveDump(dump.id)}
                      className="text-slate-400 hover:text-slate-900 transition-all p-1.5 hover:bg-slate-100/50 rounded-lg"
                      title="Archive"
                    >
                      <Archive size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteDump(dump.id)}
                    className="text-slate-400 hover:text-rose-400 transition-all p-1.5 hover:bg-rose-500/10 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Conversion Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => onConvertToTask(dump)}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200/60 bg-white/[0.01] hover:border-blue-500/30 hover:bg-blue-500/10 group/btn transition-all active:scale-[0.97]"
                  title="Convert to Task"
                >
                  <ListTodo size={15} className="text-slate-400 group-hover/btn:text-blue-400 transition-colors" />
                  <span className="text-[8px] font-bold text-slate-400 group-hover/btn:text-blue-400 uppercase tracking-wider font-mono">
                    Task
                  </span>
                </button>
                <button
                  onClick={() => onConvertToNote(dump)}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200/60 bg-white/[0.01] hover:border-yellow-500/30 hover:bg-yellow-500/10 group/btn transition-all active:scale-[0.97]"
                  title="Convert to Note"
                >
                  <StickyNote size={15} className="text-slate-400 group-hover/btn:text-yellow-400 transition-colors" />
                  <span className="text-[8px] font-bold text-slate-400 group-hover/btn:text-yellow-400 uppercase tracking-wider font-mono">
                    Note
                  </span>
                </button>
                <button
                  onClick={() => onConvertToJournal(dump)}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200/60 bg-white/[0.01] hover:border-emerald-500/30 hover:bg-emerald-500/10 group/btn transition-all active:scale-[0.97]"
                  title="Convert to Journal Log"
                >
                  <BookOpen size={15} className="text-slate-400 group-hover/btn:text-emerald-400 transition-colors" />
                  <span className="text-[8px] font-bold text-slate-400 group-hover/btn:text-emerald-400 uppercase tracking-wider font-mono">
                    Log
                  </span>
                </button>
                <button
                  onClick={() => onConvertToProject(dump)}
                  className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200/60 bg-white/[0.01] hover:border-pink-500/30 hover:bg-pink-500/10 group/btn transition-all active:scale-[0.97]"
                  title="Convert to Project"
                >
                  <Briefcase size={15} className="text-slate-400 group-hover/btn:text-pink-400 transition-colors" />
                  <span className="text-[8px] font-bold text-slate-400 group-hover/btn:text-pink-400 uppercase tracking-wider font-mono">
                    Proj
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {currentViewDumps.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-3xl bg-slate-100 text-slate-400">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center shadow-lg border border-yellow-500/20 mb-6">
            <Sparkles size={28} className="text-yellow-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {showArchived ? 'Archive Empty' : 'Your mind is clear'}
          </h3>
          {!showArchived && (
            <>
              <p className="text-slate-400 text-xs max-w-sm mt-1 mb-6 px-4 leading-relaxed">
                Dump everything here—messy, raw, incomplete thoughts, and sort them into tasks or projects later.
              </p>
              <button
                onClick={openModal}
                className="text-violet-400 font-bold hover:underline text-xs uppercase tracking-wider font-mono"
              >
                Start dumping ideas &rarr;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default BrainDumpModule;
