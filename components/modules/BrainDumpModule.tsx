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
  Lightbulb,
  CornerDownRight,
  Archive,
  RefreshCcw,
  Briefcase,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export const BrainDumpModule: React.FC = () => {
  const dumps = useAppStore((s) => s.dumps);
  const onDeleteDump = useAppStore((s) => s.handleDeleteDump);
  const onConvertToTask = useAppStore((s) => s.convertDumpToTask);
  const onConvertToNote = useAppStore((s) => s.convertDumpToNote);
  const onConvertToJournal = useAppStore((s) => s.convertDumpToJournal);
  const onConvertToProject = useAppStore((s) => s.convertDumpToProject);
  const autoTrigger = useAppStore((s) => s.triggerDumpModal);
  const setTriggerDumpModal = useAppStore((s) => s.setTriggerDumpModal);

  const onArchiveDump = (id: string) => useAppStore.getState().handleArchive(id, 'dump');
  const onUnarchiveDump = (id: string) => useAppStore.getState().handleUnarchive(id, 'dump');

  const router = useRouter();
  const [showArchived, setShowArchived] = React.useState(false);

  const activeDumps = React.useMemo(
    () => dumps.filter((d) => !d.deletedAt && !d.archivedAt).sort((a, b) => b.createdAt - a.createdAt),
    [dumps]
  );

  const archivedDumps = React.useMemo(
    () => dumps.filter((d) => !d.deletedAt && d.archivedAt).sort((a, b) => b.createdAt - a.createdAt),
    [dumps]
  );

  const currentDumps = showArchived ? archivedDumps : activeDumps;

  React.useEffect(() => {
    if (autoTrigger) {
      router.push('/dump/new' as any);
      setTriggerDumpModal(false);
    }
  }, [autoTrigger]);

  const openNew = () => router.push('/dump/new' as any);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* ── Header matching Frame132 header-brain-dump ────────── */}
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexShrink: 0,
          background: '#F5F7FA',
        }}
      >
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#1E1E1E', letterSpacing: '-0.03em' }}>
            {showArchived ? 'Archive' : 'Brain Dump'}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="loah-icon-btn"
            style={{
              background: showArchived ? 'rgba(137,121,255,0.10)' : '#FFFFFF',
              borderColor: showArchived ? '#8979FF' : '#E2E8F0',
              color: showArchived ? '#8979FF' : '#64748B',
            }}
          >
            <Archive size={17} />
          </button>
          <button
            onClick={openNew}
            className="loah-icon-btn"
            style={{ background: '#8979FF', borderColor: '#8979FF', color: '#fff' }}
          >
            <Plus size={17} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '16px 16px 100px' }}>
        {currentDumps.length === 0 ? (
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '60px 20px', textAlign: 'center',
              border: '1px dashed #E2E8F0', borderRadius: 20,
              background: '#FAFBFC', marginTop: 8,
            }}
          >
            <div
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(253, 230, 138, 0.25)',
                border: '1px solid #FED7AA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Lightbulb size={28} color="#D97706" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1E1E1E', marginBottom: 6 }}>
              {showArchived ? 'Archive Empty' : 'Your mind is clear'}
            </p>
            {!showArchived && (
              <>
                <p style={{ fontSize: 13, color: '#64748B', maxWidth: 260, lineHeight: 1.5, marginBottom: 20 }}>
                  Dump everything here — messy, raw, incomplete thoughts, and sort them into tasks or projects later.
                </p>
                <button onClick={openNew} className="loah-btn-primary">
                  <Plus size={16} />
                  New Idea
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4" style={{ columnGap: 12 }}>
            {currentDumps.map((dump) => (
              <div key={dump.id} style={{ marginBottom: 12, breakInside: 'avoid' }}>
                <DumpCard
                  dump={dump}
                  showArchived={showArchived}
                  onArchive={onArchiveDump}
                  onUnarchive={onUnarchiveDump}
                  onDelete={onDeleteDump}
                  onConvertToTask={onConvertToTask}
                  onConvertToNote={onConvertToNote}
                  onConvertToJournal={onConvertToJournal}
                  onConvertToProject={onConvertToProject}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Individual dump card matching Frame132 brain-dump-card ──
const DumpCard: React.FC<{
  dump: Dump;
  showArchived: boolean;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onConvertToTask: (d: Dump) => void;
  onConvertToNote: (d: Dump) => void;
  onConvertToJournal: (d: Dump) => void;
  onConvertToProject: (d: Dump) => void;
}> = ({ dump, showArchived, onArchive, onUnarchive, onDelete, onConvertToTask, onConvertToNote, onConvertToJournal, onConvertToProject }) => {
  return (
    <div className="loah-card group" style={{ overflow: 'hidden', position: 'relative' }}>
      {/* Ambient glow dot */}
      <div
        style={{
          position: 'absolute', top: -10, right: -10,
          width: 50, height: 50, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(253,230,138,0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ padding: '12px 14px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(253, 230, 138, 0.25)',
                border: '1px solid #FED7AA',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Lightbulb size={16} color="#D97706" />
            </div>
            <span
              style={{
                fontSize: 9, fontWeight: 700, color: '#9CA3AF',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              BRAIN DUMP
            </span>
          </div>
          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, flexShrink: 0 }}>
            {new Date(dump.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1E1E1E', marginBottom: 6, lineHeight: 1.3 }}>
          {dump.title}
        </h3>

        {/* Content */}
        {dump.description && (
          <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5, marginBottom: 12 }} className="line-clamp-3 whitespace-pre-wrap">
            {dump.description}
          </p>
        )}

        {/* Convert actions */}
        <div
          style={{
            paddingTop: 10, borderTop: '1px solid rgba(226,232,240,0.60)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span
              style={{
                fontSize: 9, fontWeight: 700, color: '#8979FF',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <CornerDownRight size={11} />
              Convert Idea
            </span>
            <div style={{ display: 'flex', gap: 4, opacity: 0 }} className="group-hover:opacity-100 transition-opacity">
              {showArchived ? (
                <button
                  onClick={() => onUnarchive(dump.id)}
                  style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}
                >
                  <RefreshCcw size={13} />
                </button>
              ) : (
                <button
                  onClick={() => onArchive(dump.id)}
                  style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}
                >
                  <Archive size={13} />
                </button>
              )}
              <button
                onClick={() => onDelete(dump.id)}
                style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* 4 convert buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[
              { label: 'Task', icon: ListTodo, color: '#3366CC', bg: '#EFF6FF', action: () => onConvertToTask(dump) },
              { label: 'Note', icon: StickyNote, color: '#D97706', bg: '#FFFAC3', action: () => onConvertToNote(dump) },
              { label: 'Log', icon: BookOpen, color: '#059669', bg: '#F0FDF4', action: () => onConvertToJournal(dump) },
              { label: 'Proj', icon: Briefcase, color: '#8979FF', bg: '#F5F0FF', action: () => onConvertToProject(dump) },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 4, padding: '8px 4px',
                  borderRadius: 10,
                  border: `1px solid ${btn.bg}`,
                  background: btn.bg,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = btn.color;
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = btn.bg;
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                }}
              >
                <btn.icon size={14} color={btn.color} />
                <span style={{ fontSize: 9, fontWeight: 700, color: btn.color, letterSpacing: '0.04em' }}>
                  {btn.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainDumpModule;
