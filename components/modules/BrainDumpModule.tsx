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
import Link from 'next/link';

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
      {/* ── Header ────────── */}
      <div
        className="loah-module-header"
        style={{ paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)', marginBottom: 16 }}
      >
        <div>
          <div className="loah-module-title">
            {showArchived ? 'Archive' : 'Brain Dump'}
          </div>
          <div className="loah-module-date">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="loah-icon-btn"
            style={{
              background: showArchived ? 'var(--brand-primary-muted)' : 'var(--bg-surface)',
              borderColor: showArchived ? 'var(--brand-primary)' : 'var(--border-default)',
              color: showArchived ? 'var(--brand-primary)' : 'var(--text-secondary)',
            }}
          >
            <Archive size={17} />
          </button>
          <button
            onClick={openNew}
            className="loah-btn-primary"
            style={{ padding: '0 16px', borderRadius: '12px', height: '40px' }}
          >
            <Plus size={17} />
            <span>New</span>
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
              border: '1px dashed var(--border-strong)', borderRadius: 20,
              background: 'var(--bg-surface-elevated)', marginTop: 8,
            }}
          >
            <div
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'rgba(77, 169, 255, 0.1)',
                border: '1px solid var(--info-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Lightbulb size={28} color="var(--info-default)" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              {showArchived ? 'Archive Empty' : 'Your mind is clear'}
            </p>
            {!showArchived && (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 260, lineHeight: 1.5, marginBottom: 20 }}>
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

      <div style={{ padding: '16px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'rgba(77, 169, 255, 0.1)',
                border: '1px solid var(--info-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Lightbulb size={16} color="var(--info-default)" />
            </div>
            <span
              style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              BRAIN DUMP
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, flexShrink: 0 }}>
            {new Date(dump.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.3 }}>
          {dump.title}
        </h3>

        {/* Content */}
        {dump.description && (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }} className="line-clamp-3 whitespace-pre-wrap">
            {dump.description}
          </p>
        )}

        {/* Convert actions */}
        <div
          style={{
            paddingTop: 12, borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span
              style={{
                fontSize: 10, fontWeight: 700, color: 'var(--brand-primary)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              <CornerDownRight size={12} />
              Convert Idea
            </span>
            <div style={{ display: 'flex', gap: 4, opacity: 0 }} className="group-hover:opacity-100 transition-opacity">
              {showArchived ? (
                <button
                  onClick={() => onUnarchive(dump.id)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}
                  className="hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                >
                  <RefreshCcw size={14} />
                </button>
              ) : (
                <button
                  onClick={() => onArchive(dump.id)}
                  style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}
                  className="hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-primary)]"
                >
                  <Archive size={14} />
                </button>
              )}
              <button
                onClick={() => onDelete(dump.id)}
                style={{ width: 28, height: 28, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}
                className="hover:bg-[var(--danger-surface)] hover:text-[var(--danger-default)] transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* 4 convert buttons using next/link */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[
              { label: 'Task', icon: ListTodo, color: 'var(--cat-deepwork)', route: '/tasks/new' },
              { label: 'Note', icon: StickyNote, color: 'var(--warning-default)', route: '/notes/new' },
              { label: 'Log', icon: BookOpen, color: 'var(--cat-journaling)', route: '/journal/new' },
              { label: 'Proj', icon: Briefcase, color: 'var(--cat-meditation)', route: '/projects/new' },
            ].map((btn) => (
              <Link
                key={btn.label}
                href={`${btn.route}?title=${encodeURIComponent(dump.title)}&desc=${encodeURIComponent(dump.description || '')}&deleteDumpId=${dump.id}`}
                className="loah-quick-btn"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 4, padding: '8px 4px',
                  borderRadius: 10,
                  border: `1px solid var(--border-subtle)`,
                  background: 'var(--bg-surface-elevated)',
                }}
              >
                <btn.icon size={16} color={btn.color} />
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                  {btn.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainDumpModule;
