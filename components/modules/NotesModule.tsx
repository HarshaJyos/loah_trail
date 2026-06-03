'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Note, NoteItem } from '../../types';
import {
  Pin,
  Trash2,
  Plus,
  X,
  Palette,
  StickyNote,
  CheckSquare,
  Image as ImageIcon,
  Search,
  Archive,
  RefreshCcw,
  PlusCircle,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export const COLORS = [
  'transparent',
  'rgba(239, 68, 68, 0.15)',
  'rgba(249, 115, 22, 0.15)',
  'rgba(234, 179, 8, 0.15)',
  'rgba(16, 185, 129, 0.15)',
  'rgba(6, 182, 212, 0.15)',
  'rgba(59, 130, 246, 0.15)',
  'rgba(139, 92, 246, 0.15)',
  'rgba(236, 72, 153, 0.15)',
];

const COLOR_LABELS: Record<string, string> = {
  'transparent': 'Default',
  'rgba(239, 68, 68, 0.15)': 'Red Glow',
  'rgba(249, 115, 22, 0.15)': 'Orange Glow',
  'rgba(234, 179, 8, 0.15)': 'Yellow Glow',
  'rgba(16, 185, 129, 0.15)': 'Green Glow',
  'rgba(6, 182, 212, 0.15)': 'Cyan Glow',
  'rgba(59, 130, 246, 0.15)': 'Blue Glow',
  'rgba(139, 92, 246, 0.15)': 'Purple Glow',
  'rgba(236, 72, 153, 0.15)': 'Pink Glow',
};

export const NoteEditorModal: React.FC<{
  initialNote?: Partial<Note>;
  onSave: (data: Partial<Note>) => void;
  onClose: () => void;
  titleLabel?: string;
}> = ({ initialNote, onSave, onClose, titleLabel }) => {
  const [title, setTitle] = React.useState(initialNote?.title || '');
  const [content, setContent] = React.useState(initialNote?.content || '');
  const [listItems, setListItems] = React.useState<NoteItem[]>(
    initialNote?.items || []
  );
  const [listItemInput, setListItemInput] = React.useState('');
  const [images, setImages] = React.useState<string[]>(
    initialNote?.images || []
  );
  const [selectedColor, setSelectedColor] = React.useState(
    initialNote?.color || COLORS[0]
  );
  const [isPinned, setIsPinned] = React.useState(
    initialNote?.isPinned || false
  );

  const [showChecklist, setShowChecklist] = React.useState(
    !!(initialNote?.items && initialNote.items.length > 0)
  );
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (
      !title.trim() &&
      !content.trim() &&
      listItems.length === 0 &&
      images.length === 0
    ) {
      onClose();
      return;
    }
    const noteData: Partial<Note> = {
      title,
      content,
      items: listItems.length > 0 ? listItems : undefined,
      images: images.length > 0 ? images : undefined,
      type: listItems.length > 0 ? 'mixed' : 'text',
      isPinned,
      color: selectedColor,
    };
    onSave(noteData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          setImages((prev) => [...prev, reader.result as string]);
        reader.readAsDataURL(file);
      });
    }
  };

  const addListItem = () => {
    if (!listItemInput.trim()) return;
    setListItems([
      ...listItems,
      {
        id: (Date.now().toString() + Math.random()),
        text: listItemInput,
        isDone: false,
      },
    ]);
    setListItemInput('');
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all relative"
        style={{
          boxShadow: selectedColor !== 'transparent' ? `0 0 30px ${selectedColor}` : undefined,
          borderColor: selectedColor !== 'transparent' ? selectedColor : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex justify-between items-center border-b border-white/5">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">
            {titleLabel || (initialNote?.id ? 'Edit Note' : 'New Note')}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-xl transition-all ${
                isPinned
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'hover:bg-white/5 text-zinc-400 hover:text-white'
              }`}
              title={isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin size={18} fill={isPinned ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar space-y-4">
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-square">
                  <img
                    src={img}
                    className="w-full h-full object-cover rounded-xl border border-white/5"
                    alt="note attachment"
                  />
                  <button
                    onClick={() =>
                      setImages(images.filter((_, i) => i !== idx))
                    }
                    className="absolute top-1 right-1 bg-black/75 hover:bg-rose-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title..."
            className="w-full bg-transparent text-2xl font-black text-white placeholder-zinc-700 focus:outline-none"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your note details..."
            className="w-full bg-transparent text-zinc-300 placeholder-zinc-600 focus:outline-none resize-none min-h-[160px] leading-relaxed text-sm"
          />
          {(showChecklist || listItems.length > 0) && (
            <div className="space-y-2 border-t border-white/5 pt-4">
              {listItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 group">
                  <button
                    onClick={() =>
                      setListItems(
                        listItems.map((i, k) =>
                          k === idx ? { ...i, isDone: !i.isDone } : i
                        )
                      )
                    }
                    className={item.isDone ? 'text-zinc-500' : 'text-zinc-300'}
                  >
                    {item.isDone ? (
                      <CheckSquare size={18} className="text-violet-400" />
                    ) : (
                      <div className="w-4.5 h-4.5 border border-white/10 rounded-md hover:border-violet-500" />
                    )}
                  </button>
                  <input
                    value={item.text}
                    onChange={(e) =>
                      setListItems(
                        listItems.map((i, k) =>
                          k === idx ? { ...i, text: e.target.value } : i
                        )
                      )
                    }
                    className={`flex-1 bg-transparent focus:outline-none text-sm ${
                      item.isDone
                        ? 'line-through text-zinc-600'
                        : 'text-zinc-300'
                    }`}
                  />
                  <button
                    onClick={() =>
                      setListItems(listItems.filter((_, k) => k !== idx))
                    }
                    className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity pt-1">
                <Plus size={16} className="text-zinc-500" />
                <input
                  value={listItemInput}
                  onChange={(e) => setListItemInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && listItemInput.trim())
                      addListItem();
                  }}
                  placeholder="Add item details..."
                  className="flex-1 bg-transparent focus:outline-none text-sm text-zinc-400"
                />
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-white/5 flex justify-between items-center bg-[#1a1a26]">
          <div className="flex gap-1.5 relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              title="Background Color Glow"
            >
              <Palette size={18} />
            </button>
            {showColorPicker && (
              <div className="absolute bottom-full left-0 mb-3 bg-[#12121a] border border-white/10 shadow-2xl rounded-2xl p-2.5 flex gap-1.5 z-50 animate-fade-in w-max">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedColor(c);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border border-white/10 hover:scale-110 transition-transform relative ${
                      selectedColor === c ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-[#12121a]' : ''
                    }`}
                    style={{ backgroundColor: c === 'transparent' ? '#222' : c }}
                    title={COLOR_LABELS[c]}
                  />
                ))}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              title="Add Image"
            >
              <ImageIcon size={18} />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </button>
            <button
              onClick={() => setShowChecklist(!showChecklist)}
              className={`p-2 rounded-xl transition-all ${
                showChecklist
                  ? 'bg-white/10 text-white border border-white/10 shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
              title="Toggle Checklist"
            >
              <CheckSquare size={18} />
            </button>
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary">
              Save Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NoteCard: React.FC<{
  note: Note;
  onClick: () => void;
  onPin: (e: React.MouseEvent, note: Note) => void;
  onDelete: (e: React.MouseEvent) => void;
  onToggleItem: (noteId: string, itemId: string) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
}> = ({
  note,
  onClick,
  onPin,
  onDelete,
  onToggleItem,
  onArchive,
  onUnarchive,
}) => {
  return (
    <div
      onClick={onClick}
      className="h-fit min-h-[160px] rounded-2xl border border-white/5 hover:border-violet-500/20 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col bg-[#12121a]"
      style={{
        boxShadow: note.color !== 'transparent' ? `0 0 25px -5px ${note.color}` : undefined,
        borderColor: note.color !== 'transparent' ? note.color : undefined,
      }}
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-extrabold text-white text-base leading-tight line-clamp-2 pr-6 group-hover:text-violet-300 transition-colors">
            {note.title || 'Untitled note'}
          </h3>
          <button
            onClick={(e) => onPin(e, note)}
            className={`absolute top-4 right-4 p-1.5 rounded-lg transition-all z-10 ${
              note.isPinned
                ? 'bg-violet-600 text-white shadow-lg'
                : 'text-zinc-500 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100'
            }`}
          >
            <Pin size={12} fill={note.isPinned ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="flex-1">
          {note.images && note.images.length > 0 && (
            <div className="mb-3 rounded-xl overflow-hidden h-32 w-full border border-white/5">
              <img
                src={note.images[0]}
                alt="Note attachment"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {note.items && note.items.length > 0 ? (
            <div className="space-y-1.5">
              {note.items.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 text-xs text-zinc-300"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleItem(note.id, item.id);
                    }}
                    className={`shrink-0 ${item.isDone ? 'text-zinc-600' : 'text-zinc-300'}`}
                  >
                    {item.isDone ? (
                      <CheckSquare size={14} className="text-violet-400" />
                    ) : (
                      <div className="w-3.5 h-3.5 border border-white/10 rounded" />
                    )}
                  </button>
                  <span
                    className={`truncate ${
                      item.isDone ? 'line-through text-zinc-600' : ''
                    }`}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
              {note.items.length > 4 && (
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block font-mono pl-6">
                  +{note.items.length - 4} more items
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 line-clamp-6 whitespace-pre-wrap leading-relaxed">
              {note.content}
            </p>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-white/5 flex justify-between items-center">
          <span className="text-[9px] text-zinc-500 font-bold font-mono">
            {new Date(note.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onArchive ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(note.id);
                }}
                className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all"
                title="Archive"
              >
                <Archive size={12} />
              </button>
            ) : (
              onUnarchive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnarchive(note.id);
                  }}
                  className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all"
                  title="Unarchive"
                >
                  <RefreshCcw size={12} />
                </button>
              )
            )}
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-rose-500/10 rounded-lg text-zinc-500 hover:text-rose-400 transition-all"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NotesModule: React.FC = () => {
  const notes = useAppStore((state) => state.notes);
  const onAddNote = useAppStore((state) => state.handleAddNote);
  const onUpdateNote = useAppStore((state) => state.handleUpdateNote);
  const onDeleteNote = useAppStore((state) => state.handleDeleteNote);
  const onArchiveNote = (id: string) => useAppStore.getState().handleArchive(id, 'note');
  const onUnarchiveNote = (id: string) => useAppStore.getState().handleUnarchive(id, 'note');
  const convertingDump = useAppStore((state) => state.convertingDump);
  const onClearConvertingDump = () => useAppStore.getState().setConvertingDump(null);
  const onConvertComplete = useAppStore((state) => state.handleConvertComplete);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [showArchived, setShowArchived] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const activeNotes = notes.filter((n) => !n.deletedAt && !n.archivedAt);
  const archivedNotes = notes.filter((n) => !n.deletedAt && n.archivedAt);

  const currentViewNotes = showArchived ? archivedNotes : activeNotes;

  const filteredNotes = React.useMemo(() => {
    return currentViewNotes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.items?.some((i) =>
            i.text.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
      .sort(
        (a, b) =>
          (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) ||
          b.updatedAt - a.updatedAt
      );
  }, [currentViewNotes, searchQuery]);

  React.useEffect(() => {
    if (convertingDump) {
      setIsModalOpen(true);
      setEditingNoteId(null);
    }
  }, [convertingDump]);

  const handleSaveNote = (noteData: Partial<Note>) => {
    if (editingNoteId) {
      const existing = notes.find((n) => n.id === editingNoteId);
      if (existing)
        onUpdateNote({ ...existing, ...noteData, updatedAt: Date.now() });
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        items: [],
        images: [],
        type: 'text',
        isPinned: false,
        color: 'transparent',
        title: '',
        content: '',
        ...noteData,
      };
      onAddNote(newNote);
    }

    if (convertingDump) {
      onConvertComplete();
    }

    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNoteId(null);
    onClearConvertingDump();
  };

  const handleToggleItem = (noteId: string, itemId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note && note.items) {
      const newItems = note.items.map((i) =>
        i.id === itemId ? { ...i, isDone: !i.isDone } : i
      );
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

  const initialNoteForModal = React.useMemo(() => {
    if (convertingDump) {
      return {
        title: convertingDump.title,
        content: convertingDump.description,
      };
    }
    if (editingNoteId) {
      return notes.find((n) => n.id === editingNoteId);
    }
    return undefined;
  }, [convertingDump, editingNoteId, notes]);

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto no-scrollbar pb-32 max-w-7xl mx-auto flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Notes
          </h2>
          {showArchived && (
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-2 border border-orange-500/20 inline-block font-mono">
              Archived View
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-[#12121a] border border-white/5 pl-9 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-violet-500/50 text-white transition-all font-semibold"
            />
          </div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`p-2.5 rounded-xl border transition-all ${
              showArchived
                ? 'bg-amber-500/15 border-amber-500/20 text-amber-400'
                : 'border-white/5 text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
            title={showArchived ? 'View Active' : 'View Archive'}
          >
            <Archive size={20} />
          </button>
          <Button
            onClick={() => {
              setEditingNoteId(null);
              setIsModalOpen(true);
            }}
            variant="primary"
            className="flex items-center gap-2 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} />
            <span>New Note</span>
          </Button>
        </div>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 pb-10">
        {filteredNotes.map((note) => (
          <div key={note.id} className="break-inside-avoid">
            <NoteCard
              note={note}
              onClick={() => {
                setEditingNoteId(note.id);
                setIsModalOpen(true);
              }}
              onPin={handlePin}
              onDelete={(e) => handleDelete(e, note.id)}
              onToggleItem={handleToggleItem}
              onArchive={showArchived ? undefined : onArchiveNote}
              onUnarchive={showArchived ? onUnarchiveNote : undefined}
            />
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="text-center py-20 text-zinc-500 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-[#12121a]/10">
          <StickyNote size={48} className="mb-4 opacity-20 text-zinc-400" />
          <p className="text-sm">No notes found.</p>
        </div>
      )}

      {isModalOpen && (
        <NoteEditorModal
          initialNote={initialNoteForModal}
          onSave={handleSaveNote}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default NotesModule;
