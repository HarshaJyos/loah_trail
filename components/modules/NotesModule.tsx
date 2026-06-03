'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Note, NoteItem } from '../../types';
import {
  Pin,
  Trash2,
  Plus,
  StickyNote,
  Archive,
  RefreshCcw,
  SquarePen,
  CornerDownRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export const COLORS = [
  'transparent',
  'rgba(239, 68, 68, 0.12)',
  'rgba(249, 115, 22, 0.12)',
  'rgba(234, 179, 8, 0.12)',
  'rgba(16, 185, 129, 0.12)',
  'rgba(6, 182, 212, 0.12)',
  'rgba(59, 130, 246, 0.12)',
  'rgba(139, 92, 246, 0.12)',
  'rgba(236, 72, 153, 0.12)',
];

const COLOR_HEX = [
  'var(--border-subtle)',
  '#FECACA',
  '#FED7AA',
  '#FEF08A',
  '#BBF7D0',
  '#C3E5FF',
  '#BFDBFE',
  '#DDD6FE',
  '#FBCFE8',
];

// NoteCard matching Frame132 note-card layout
export const NoteCard: React.FC<{
  note: Note;
  onClick: () => void;
  onPin: (e: React.MouseEvent, note: Note) => void;
  onDelete: (e: React.MouseEvent) => void;
  onToggleItem: (noteId: string, itemId: string) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
}> = ({ note, onClick, onPin, onDelete, onToggleItem, onArchive, onUnarchive }) => {
  const hasImage = note.images && note.images.length > 0;

  return (
    <div
      onClick={onClick}
      className="loah-card cursor-pointer group"
      style={{
        background: note.color && note.color !== 'transparent'
          ? note.color.replace('0.12', '0.06')
          : '#FFFFFF',
        borderColor: note.color && note.color !== 'transparent'
          ? note.color.replace('0.12', '0.30')
          : 'var(--border-subtle)',
      }}
    >
      {/* Image Banner */}
      {hasImage && (
        <div style={{ height: 110, overflow: 'hidden' }}>
          <img
            src={note.images![0]}
            alt="note"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ padding: '12px 14px' }}>
        {/* Top row: type icon + date + pin */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 26, height: 26, borderRadius: 6,
                background: 'rgba(137, 121, 255, 0.10)',
                border: '1px solid rgba(137, 121, 255, 0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <StickyNote size={13} color="#8979FF" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>
              {new Date(note.updatedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </span>
            <button
              onClick={(e) => onPin(e, note)}
              style={{
                width: 22, height: 22, borderRadius: 6,
                background: note.isPinned ? '#8979FF' : 'transparent',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: note.isPinned ? 1 : 0,
                transition: 'all 0.15s',
              }}
              className="group-hover:opacity-100"
            >
              <Pin size={11} color={note.isPinned ? '#fff' : '#9CA3AF'} fill={note.isPinned ? '#fff' : 'none'} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: 10 }}>
          {note.title && (
            <h3
              style={{
                fontSize: 14, fontWeight: 700, color: 'var(--text-primary)',
                lineHeight: 1.3, marginBottom: 4,
              }}
              className="line-clamp-2"
            >
              {note.title}
            </h3>
          )}

          {note.items && note.items.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {note.items.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  onClick={(e) => { e.stopPropagation(); onToggleItem(note.id, item.id); }}
                >
                  <div
                    style={{
                      width: 12, height: 12, borderRadius: 3,
                      border: `1.5px solid ${item.isDone ? '#8979FF' : '#D4D4D4'}`,
                      background: item.isDone ? '#8979FF' : 'transparent',
                      flexShrink: 0, cursor: 'pointer',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11, color: item.isDone ? '#9CA3AF' : '#3F3F3F',
                      textDecoration: item.isDone ? 'line-through' : 'none',
                    }}
                    className="truncate"
                  >
                    {item.text}
                  </span>
                </div>
              ))}
              {note.items.length > 3 && (
                <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>
                  +{note.items.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <p
              style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}
              className="line-clamp-4 whitespace-pre-wrap"
            >
              {note.content}
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 8, borderTop: '1px solid rgba(226,232,240,0.60)',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 700, color: '#8979FF',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '2px 0',
            }}
          >
            <CornerDownRight size={12} />
            Open Note
          </button>

          <div style={{ display: 'flex', gap: 4, opacity: 0 }} className="group-hover:opacity-100 transition-opacity">
            {onArchive ? (
              <button
                onClick={(e) => { e.stopPropagation(); onArchive(note.id); }}
                style={{
                  width: 26, height: 26, borderRadius: 6, border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF',
                }}
                title="Archive"
              >
                <Archive size={13} />
              </button>
            ) : onUnarchive ? (
              <button
                onClick={(e) => { e.stopPropagation(); onUnarchive(note.id); }}
                style={{
                  width: 26, height: 26, borderRadius: 6, border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF',
                }}
                title="Restore"
              >
                <RefreshCcw size={13} />
              </button>
            ) : null}
            <button
              onClick={onDelete}
              style={{
                width: 26, height: 26, borderRadius: 6, border: 'none',
                background: 'transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF',
              }}
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════
// NOTES MODULE — Main list view matching Frame132 loah-notes
// ═══════════════════════════════════════════════════
export const NotesModule: React.FC = () => {
  const notes = useAppStore((s) => s.notes);
  const onAddNote = useAppStore((s) => s.handleAddNote);
  const onUpdateNote = useAppStore((s) => s.handleUpdateNote);
  const onDeleteNote = useAppStore((s) => s.handleDeleteNote);
  const convertingDump = useAppStore((s) => s.convertingDump);

  const router = useRouter();
  const [showArchived, setShowArchived] = React.useState(false);

  const onArchiveNote = (id: string) => useAppStore.getState().handleArchive(id, 'note');
  const onUnarchiveNote = (id: string) => useAppStore.getState().handleUnarchive(id, 'note');

  const activeNotes = notes.filter((n) => !n.deletedAt && !n.archivedAt);
  const archivedNotes = notes.filter((n) => !n.deletedAt && n.archivedAt);
  const currentNotes = showArchived ? archivedNotes : activeNotes;

  const sortedNotes = React.useMemo(
    () => currentNotes.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || b.updatedAt - a.updatedAt),
    [currentNotes]
  );

  React.useEffect(() => {
    if (convertingDump) router.push('/notes/new' as any);
  }, [convertingDump, router]);

  const handleToggleItem = (noteId: string, itemId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note?.items) {
      const newItems = note.items.map((i) => (i.id === itemId ? { ...i, isDone: !i.isDone } : i));
      onUpdateNote({ ...note, items: newItems, updatedAt: Date.now() });
    }
  };

  const handlePin = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    onUpdateNote({ ...note, isPinned: !note.isPinned });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteNote(id);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* ── Header matching Frame132 header-notes ─────────────── */}
      <div
        style={{
          padding: '16px 20px 12px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexShrink: 0,
          background: 'var(--bg-app)',
        }}
      >
        <div>
          <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
            {showArchived ? 'Archive' : 'Notes'}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="loah-icon-btn"
            title={showArchived ? 'View Active' : 'View Archive'}
            style={{
              background: showArchived ? 'rgba(137,121,255,0.10)' : '#FFFFFF',
              borderColor: showArchived ? '#8979FF' : 'var(--border-subtle)',
              color: showArchived ? '#8979FF' : '#64748B',
            }}
          >
            <Archive size={17} />
          </button>
          <button
            onClick={() => router.push('/notes/new' as any)}
            className="loah-icon-btn"
            style={{ background: '#8979FF', borderColor: '#8979FF', color: '#fff' }}
            title="New Note"
          >
            <Plus size={17} />
          </button>
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '16px 16px 100px' }}>
        {sortedNotes.length === 0 ? (
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '60px 20px', textAlign: 'center',
              border: '1px dashed var(--border-subtle)', borderRadius: 20,
              background: '#FAFBFC', marginTop: 8,
            }}
          >
            <StickyNote size={40} color="#D4D4D4" />
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 16, marginBottom: 6 }}>
              {showArchived ? 'No Archived Notes' : 'No Notes Yet!'}
            </p>
            <p style={{ fontSize: 13, color: '#64748B', maxWidth: 240, lineHeight: 1.5 }}>
              {showArchived
                ? 'Your archived notes will appear here.'
                : 'Create your first note and keep your thoughts organized in one place.'}
            </p>
            {!showArchived && (
              <button
                onClick={() => router.push('/notes/new' as any)}
                className="loah-btn-primary"
                style={{ marginTop: 20 }}
              >
                <Plus size={16} />
                New Note
              </button>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4" style={{ columnGap: 12 }}>
            {sortedNotes.map((note) => (
              <div key={note.id} style={{ marginBottom: 12, breakInside: 'avoid' }}>
                <NoteCard
                  note={note}
                  onClick={() => router.push(`/notes/edit?id=${note.id}` as any)}
                  onPin={handlePin}
                  onDelete={(e) => handleDelete(e, note.id)}
                  onToggleItem={handleToggleItem}
                  onArchive={showArchived ? undefined : onArchiveNote}
                  onUnarchive={showArchived ? onUnarchiveNote : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesModule;
