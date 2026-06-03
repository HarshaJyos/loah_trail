'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { JournalEntry, Mood } from '../../types';
import {
  Smile, Frown, Meh, Annoyed, Laugh,
  Calendar, Image as ImageIcon, X, Trash2,
  Edit2, ArrowLeft, Check, Plus, PenLine,
  Archive, RefreshCcw, BookOpen,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const MOODS: { id: Mood; emoji: string; label: string; color: string; bg: string }[] = [
  { id: 'awesome', emoji: '😁', label: 'Awesome', color: '#059669', bg: '#BBF7D0' },
  { id: 'good',    emoji: '😊', label: 'Good',    color: '#3366CC', bg: '#BFDBFE' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', color: '#64748B', bg: '#E6E8EB' },
  { id: 'bad',     emoji: '🙁', label: 'Bad',     color: '#DB8A66', bg: '#FED7AA' },
  { id: 'awful',   emoji: '😒', label: 'Awful',   color: '#9F3834', bg: '#FECACA' },
];

const getMoodConfig = (id: Mood) => MOODS.find((m) => m.id === id) || MOODS[2];

// ── Journal Card matching Frame132 journal-card layout ────
const JournalCard: React.FC<{
  entry: JournalEntry;
  onClick: () => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ entry, onClick, onArchive, onUnarchive, onDelete }) => {
  const mood = getMoodConfig(entry.mood);
  const coverImg = entry.images?.[0];

  return (
    <div
      onClick={onClick}
      className="loah-journal-card group"
    >
      {coverImg && (
        <img
          src={coverImg}
          alt="cover"
          className="loah-journal-image group-hover:scale-105 transition-transform duration-400"
          style={{ transition: 'transform 0.4s ease' }}
        />
      )}
      <div style={{ padding: '12px 14px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Mood emoji pill */}
            <div
              style={{
                background: mood.bg + '40',
                borderRadius: 200,
                padding: '2px 8px',
                fontSize: 13,
                border: `1px solid ${mood.bg}`,
              }}
            >
              {mood.emoji}
            </div>
          </div>
          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>
            {new Date(entry.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>

        {/* Title + content */}
        <h4
          style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}
          className="line-clamp-2"
        >
          {entry.title}
        </h4>
        <div
            style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            dangerouslySetInnerHTML={{ __html: entry.content }}
          />

        {/* Footer */}
        <div
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 8, marginTop: 8, borderTop: '1px solid rgba(226,232,240,0.60)',
          }}
        >
          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600 }}>
            {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          <div style={{ display: 'flex', gap: 4 }} className="transition-opacity">
            {onArchive && (
              <button
                onClick={(e) => { e.stopPropagation(); onArchive(entry.id); }}
                style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}
              >
                <Archive size={13} />
              </button>
            )}
            {onUnarchive && (
              <button
                onClick={(e) => { e.stopPropagation(); onUnarchive(entry.id); }}
                style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}
              >
                <RefreshCcw size={13} />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
              style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}
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
// JOURNAL MODULE — main list view
// ═══════════════════════════════════════════════════
export const JournalModule: React.FC = () => {
  const entries = useAppStore((s) => s.journalEntries);
  const onDeleteEntry = useAppStore((s) => s.handleDeleteJournalEntry);
  const journalPrompt = useAppStore((s) => s.journalPrompt);
  const setJournalPrompt = useAppStore((s) => s.setJournalPrompt);
  const convertingDump = useAppStore((s) => s.convertingDump);
  const autoTrigger = useAppStore((s) => s.triggerJournalModal);
  const setTriggerJournalModal = useAppStore((s) => s.setTriggerJournalModal);

  const router = useRouter();
  const [viewingEntryId, setViewingEntryId] = React.useState<string | null>(null);
  const [showArchived, setShowArchived] = React.useState(false);
  const [moodFilter, setMoodFilter] = React.useState<'all' | Mood>('all');

  const onArchiveEntry = (id: string) => useAppStore.getState().handleArchive(id, 'journal');
  const onUnarchiveEntry = (id: string) => useAppStore.getState().handleUnarchive(id, 'journal');

  const activeEntries = entries.filter((e) => !e.deletedAt && !e.archivedAt);
  const archivedEntries = entries.filter((e) => !e.deletedAt && e.archivedAt);
  const currentEntries = showArchived ? archivedEntries : activeEntries;

  const filteredEntries = React.useMemo(
    () => currentEntries
      .filter((e) => moodFilter === 'all' || e.mood === moodFilter)
      .sort((a, b) => b.createdAt - a.createdAt),
    [currentEntries, moodFilter]
  );

  // Group by date
  const groupedEntries = React.useMemo(() => {
    const groups: { date: string; entries: JournalEntry[] }[] = [];
    filteredEntries.forEach((entry) => {
      const d = new Date(entry.createdAt).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
      }).toUpperCase();
      let g = groups.find((x) => x.date === d);
      if (!g) { g = { date: d, entries: [] }; groups.push(g); }
      g.entries.push(entry);
    });
    return groups;
  }, [filteredEntries]);

  React.useEffect(() => {
    if (journalPrompt) {
      router.push(`/journal/new?prompt=${encodeURIComponent(journalPrompt)}` as any);
      setJournalPrompt('');
    }
  }, [journalPrompt]);

  React.useEffect(() => {
    if (convertingDump) router.push('/journal/new' as any);
  }, [convertingDump]);

  React.useEffect(() => {
    if (autoTrigger) {
      router.push('/journal/new' as any);
      setTriggerJournalModal(false);
    }
  }, [autoTrigger]);

  // Viewing a single entry inline
  if (viewingEntryId) {
    const entry = entries.find((e) => e.id === viewingEntryId);
    if (entry) {
      return (
        <JournalDetailView
          entry={entry}
          onBack={() => setViewingEntryId(null)}
          onDelete={(id) => { onDeleteEntry(id); setViewingEntryId(null); }}
          onArchive={showArchived ? undefined : onArchiveEntry}
          onUnarchive={showArchived ? onUnarchiveEntry : undefined}
        />
      );
    }
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* ── Header matching Frame132 header-notes ─────────── */}
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
            {showArchived ? 'Archive' : 'Journal'}
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
              background: showArchived ? 'rgba(137,121,255,0.10)' : 'var(--bg-surface)',
              borderColor: showArchived ? '#8979FF' : 'var(--border-subtle)',
              color: showArchived ? '#8979FF' : 'var(--text-secondary)',
            }}
          >
            <Archive size={17} />
          </button>
          <button
            onClick={() => router.push('/journal/new' as any)}
            className="loah-icon-btn"
            style={{ background: '#8979FF', borderColor: '#8979FF', color: '#fff' }}
          >
            <Plus size={17} />
          </button>
        </div>
      </div>

      {/* Mood filter chips */}
      <div
        style={{
          padding: '10px 20px 6px',
          display: 'flex', gap: 6, overflowX: 'auto',
          flexShrink: 0, background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
        className="no-scrollbar"
      >
        <button
          onClick={() => setMoodFilter('all')}
          style={{
            padding: '4px 14px',
            borderRadius: 200,
            fontSize: 11, fontWeight: 700,
            border: `1px solid ${moodFilter === 'all' ? '#8979FF' : 'var(--border-subtle)'}`,
            background: moodFilter === 'all' ? 'rgba(137,121,255,0.10)' : 'var(--bg-surface)',
            color: moodFilter === 'all' ? '#8979FF' : 'var(--text-secondary)',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          All
        </button>
        {MOODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMoodFilter(m.id)}
            style={{
              padding: '4px 12px',
              borderRadius: 200,
              fontSize: 11, fontWeight: 700,
              border: `1px solid ${moodFilter === m.id ? m.color : 'var(--border-subtle)'}`,
              background: moodFilter === m.id ? m.bg + '50' : 'var(--bg-surface)',
              color: moodFilter === m.id ? m.color : 'var(--text-secondary)',
              cursor: 'pointer', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <span>{m.emoji}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '16px 16px 100px' }}>
        {groupedEntries.length === 0 ? (
          <div
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '60px 20px', textAlign: 'center',
              border: '1px dashed var(--border-subtle)', borderRadius: 20,
              background: 'var(--bg-surface)', marginTop: 8,
            }}
          >
            <BookOpen size={40} color="#D4D4D4" />
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 16, marginBottom: 6 }}>
              {showArchived ? 'No Archived Journal Entries' : 'No Journal Entries Yet!'}
            </p>
            <p style={{ fontSize: 13, color: '#64748B', maxWidth: 260, lineHeight: 1.5 }}>
              {showArchived
                ? 'Your archived memories and reflections will be stored here.'
                : 'Start your journaling journey and capture your thoughts, memories, and reflections.'}
            </p>
            {!showArchived && (
              <button
                onClick={() => router.push('/journal/new' as any)}
                className="loah-btn-primary"
                style={{ marginTop: 20 }}
              >
                <Plus size={16} />
                New Log
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedEntries.map((group) => (
              <div key={group.date}>
                {/* Date label — matches Frame132 frame-51 / sat-may-30 */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10, fontWeight: 700, color: '#8979FF',
                      letterSpacing: '0.08em',
                      background: 'rgba(137,121,255,0.08)',
                      border: '1px solid rgba(137,121,255,0.20)',
                      borderRadius: 200, padding: '3px 10px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {group.date}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.entries.map((entry) => (
                    <JournalCard
                      key={entry.id}
                      entry={entry}
                      onClick={() => setViewingEntryId(entry.id)}
                      onArchive={showArchived ? undefined : onArchiveEntry}
                      onUnarchive={showArchived ? onUnarchiveEntry : undefined}
                      onDelete={onDeleteEntry}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Journal Detail View (inline, not a separate page) ────
const JournalDetailView: React.FC<{
  entry: JournalEntry;
  onBack: () => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
}> = ({ entry, onBack, onDelete, onArchive, onUnarchive }) => {
  const router = useRouter();
  const mood = getMoodConfig(entry.mood);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-fade-in">
      {/* Header matching Frame132 header-edit-notes */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          background: 'var(--bg-app)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} className="loah-editor-back">
            <ArrowLeft size={17} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Log</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {onArchive && (
            <button
              onClick={() => { onArchive(entry.id); onBack(); }}
              className="loah-icon-btn"
            >
              <Archive size={16} />
            </button>
          )}
          {onUnarchive && (
            <button
              onClick={() => { onUnarchive(entry.id); onBack(); }}
              className="loah-icon-btn"
            >
              <RefreshCcw size={16} />
            </button>
          )}
          <button
            onClick={() => { if (confirm('Delete this entry?')) { onDelete(entry.id); } }}
            className="loah-icon-btn"
            style={{ color: '#EF4444', borderColor: '#FECACA' }}
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => router.push(`/journal/edit?id=${entry.id}` as any)}
            className="loah-btn-primary"
          >
            <Edit2 size={15} />
            Edit
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '24px 20px 60px' }}>
        {/* Mood + date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div
            style={{
              fontSize: 22, background: mood.bg + '40',
              borderRadius: 200, padding: '4px 12px',
              border: `1px solid ${mood.bg}`,
            }}
          >
            {mood.emoji}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: mood.color }}>{mood.label}</div>
            <div style={{ fontSize: 11, color: '#9CA3AF' }}>
              {new Date(entry.createdAt).toLocaleString(undefined, {
                weekday: 'short', month: 'short', day: 'numeric',
                hour: 'numeric', minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 12 }}>
          {entry.title}
        </h1>

        {/* Images */}
        {entry.images && entry.images.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
            {entry.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`img ${i}`}
                style={{ width: '100%', borderRadius: 12, objectFit: 'cover', maxHeight: 200, border: '1px solid var(--border-subtle)' }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            fontSize: 14, color: '#3F3F3F', lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}
        >
          {entry.content}
        </div>
      </div>
    </div>
  );
};

export default JournalModule;
