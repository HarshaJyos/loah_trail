'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { JournalEntry, Mood } from '../../types';
import {
  Save,
  Smile,
  Frown,
  Meh,
  Annoyed,
  Laugh,
  Calendar,
  Image as ImageIcon,
  X,
  Trash2,
  Edit2,
  ArrowLeft,
  Check,
  Plus,
  PenLine,
  Archive,
  RefreshCcw,
  Search,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

const MOODS: { id: Mood; icon: any; color: string; val: number }[] = [
  { id: 'awesome', icon: Laugh, color: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10', val: 5 },
  { id: 'good', icon: Smile, color: 'text-blue-500 border-blue-500/20 bg-blue-500/10', val: 4 },
  { id: 'neutral', icon: Meh, color: 'text-zinc-400 border-zinc-400/20 bg-zinc-400/10', val: 3 },
  { id: 'bad', icon: Frown, color: 'text-amber-500 border-amber-500/20 bg-amber-500/10', val: 2 },
  { id: 'awful', icon: Annoyed, color: 'text-rose-500 border-rose-500/20 bg-rose-500/10', val: 1 },
];

export const JournalModule: React.FC = () => {
  const entries = useAppStore((state) => state.journalEntries);
  const onAddEntry = useAppStore((state) => state.handleAddJournalEntry);
  const onUpdateEntry = useAppStore((state) => state.handleUpdateJournalEntry);
  const onDeleteEntry = useAppStore((state) => state.handleDeleteJournalEntry);
  const onArchiveEntry = (id: string) => useAppStore.getState().handleArchive(id, 'journal');
  const onUnarchiveEntry = (id: string) => useAppStore.getState().handleUnarchive(id, 'journal');

  const journalPrompt = useAppStore((state) => state.journalPrompt);
  const setJournalPrompt = useAppStore((state) => state.setJournalPrompt);
  const clearPrompt = () => setJournalPrompt('');

  const convertingDump = useAppStore((state) => state.convertingDump);
  const onClearConvertingDump = () => useAppStore.getState().setConvertingDump(null);
  const onConvertComplete = useAppStore((state) => state.handleConvertComplete);

  const autoTrigger = useAppStore((state) => state.triggerJournalModal);
  const setTriggerJournalModal = useAppStore((state) => state.setTriggerJournalModal);
  const onAutoTriggerHandled = () => setTriggerJournalModal(false);

  const [viewingEntryId, setViewingEntryId] = React.useState<string | null>(null);
  const [activeFilter, setActiveFilter] = React.useState<'all' | Mood>('all');
  const [showArchived, setShowArchived] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Helper to get local date string YYYY-MM-DD
  const getLocalDateStr = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form State
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [selectedMood, setSelectedMood] = React.useState<Mood>('good');
  const [selectedImages, setSelectedImages] = React.useState<string[]>([]);
  const [entryDate, setEntryDate] = React.useState(getLocalDateStr);

  const [extractedColor, setExtractedColor] = React.useState<string>('transparent');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Filter entries based on deletion and archive status
  const activeEntries = entries.filter((e) => !e.deletedAt && !e.archivedAt);
  const archivedEntries = entries.filter((e) => !e.deletedAt && e.archivedAt);

  const currentViewEntries = showArchived ? archivedEntries : activeEntries;

  const extractColorFromImage = (imageSrc: string) => {
    const img = new Image();
    img.src = imageSrc;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = 50;
      canvas.height = 50;
      ctx.drawImage(img, 0, 0, 50, 50);
      const imageData = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
        count++;
      }
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      setExtractedColor(`rgba(${r}, ${g}, ${b}, 0.15)`);
    };
  };

  // Handle Journal Prompt or Initial Data
  React.useEffect(() => {
    if (journalPrompt) {
      setContent(journalPrompt);
      setEntryDate(getLocalDateStr());
      setIsModalOpen(true);
    }
  }, [journalPrompt]);

  // Handle Brain Dump Conversion
  React.useEffect(() => {
    if (convertingDump) {
      setTitle(convertingDump.title);
      setContent(convertingDump.description);
      setEntryDate(getLocalDateStr());
      setSelectedMood('neutral');
      setSelectedImages([]);
      setIsModalOpen(true);
    }
  }, [convertingDump]);

  // Handle Auto Trigger
  React.useEffect(() => {
    if (autoTrigger) {
      handleOpenNewEntry();
      onAutoTriggerHandled();
    }
  }, [autoTrigger]);

  const handleOpenNewEntry = () => {
    resetForm();
    setEntryDate(getLocalDateStr());
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      let processedCount = 0;

      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          newImages.push(result);
          processedCount++;

          if (processedCount === files.length) {
            const updatedList = [...selectedImages, ...newImages];
            setSelectedImages(updatedList);
            if (updatedList.length > 0) {
              extractColorFromImage(updatedList[0]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const saveNewEntry = () => {
    if (!content.trim() && !title.trim() && selectedImages.length === 0) return;

    const [y, m, d] = entryDate.split('-').map(Number);
    const selectedDateObj = new Date(y, m - 1, d);
    const now = new Date();
    selectedDateObj.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds()
    );

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: title.trim() || 'Untitled Log',
      content,
      mood: selectedMood,
      tags: ['Log'],
      images: selectedImages,
      cardColor: selectedImages.length > 0 ? extractedColor : 'transparent',
      textColor: '#f1f0ff',
      createdAt: selectedDateObj.getTime(),
    };

    onAddEntry(newEntry);

    if (convertingDump) {
      onConvertComplete();
    }

    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedImages([]);
    setExtractedColor('transparent');
    clearPrompt();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    onClearConvertingDump();
  };

  const removeImage = (index: number) => {
    const newList = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newList);
    if (newList.length === 0) {
      setExtractedColor('transparent');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else if (index === 0) {
      extractColorFromImage(newList[0]);
    }
  };

  const filteredEntries = React.useMemo(() => {
    return currentViewEntries.filter((e) => {
      const matchesSearch =
        searchQuery === '' ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.content.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'all') return true;
      return e.mood === activeFilter;
    });
  }, [currentViewEntries, activeFilter, searchQuery]);

  const groupedEntries = React.useMemo(() => {
    const groups: { date: string; entries: JournalEntry[] }[] = [];
    const sorted = [...filteredEntries].sort(
      (a, b) => b.createdAt - a.createdAt
    );
    sorted.forEach((entry) => {
      const d = new Date(entry.createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      let g = groups.find((x) => x.date === d);
      if (!g) {
        g = { date: d, entries: [] };
        groups.push(g);
      }
      g.entries.push(entry);
    });
    return groups;
  }, [filteredEntries]);

  if (viewingEntryId) {
    const entry = entries.find((e) => e.id === viewingEntryId);
    if (entry) {
      return (
        <JournalDetailView
          entry={entry}
          onBack={() => setViewingEntryId(null)}
          onUpdate={(updated) => {
            onUpdateEntry(updated);
            setViewingEntryId(null);
          }}
          onDelete={(id) => {
            onDeleteEntry(id);
            setViewingEntryId(null);
          }}
          onArchive={showArchived ? undefined : onArchiveEntry}
          onUnarchive={showArchived ? onUnarchiveEntry : undefined}
        />
      );
    }
  }

  return (
    <div className="w-full h-full p-4 md:p-8 overflow-y-auto no-scrollbar pb-32 max-w-7xl mx-auto flex flex-col space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Journal Feed
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
              placeholder="Search journals..."
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
            onClick={handleOpenNewEntry}
            variant="primary"
            className="flex items-center gap-2 active:scale-95 whitespace-nowrap"
          >
            <PenLine size={18} />
            <span>Create Log</span>
          </Button>
        </div>
      </div>

      {/* Mood Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar shrink-0">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors border ${
            activeFilter === 'all'
              ? 'bg-white/5 border-white/10 text-white shadow-md'
              : 'border-transparent text-zinc-500 hover:text-white hover:bg-white/5'
          }`}
        >
          All Moods
        </button>
        {MOODS.map((m) => {
          const isSelected = activeFilter === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveFilter(m.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                isSelected
                  ? 'bg-white/5 border-white/10 text-white shadow-md'
                  : 'border-white/5 bg-[#12121a] text-zinc-500 hover:text-white'
              }`}
            >
              <m.icon
                size={14}
                className={isSelected ? 'text-white' : m.color.split(' ')[0]}
              />
              <span className="capitalize">{m.id}</span>
            </button>
          );
        })}
      </div>

      {/* Grouped Logs Timeline */}
      <div className="space-y-12">
        {groupedEntries.length > 0 ? (
          groupedEntries.map((group) => (
            <div key={group.date} className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="bg-white/5 border border-white/5 text-violet-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest font-mono">
                  {group.date}
                </span>
                <div className="h-px bg-white/5 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {group.entries.map((entry) => {
                  const moodConfig = MOODS.find((m) => m.id === entry.mood);
                  const MoodIcon = moodConfig?.icon || Smile;
                  const bgColor = entry.cardColor || 'transparent';

                  const displayImages = entry.images || [];
                  const coverImage = displayImages[0];

                  return (
                    <div key={entry.id} className="group relative h-[320px]">
                      <div
                        onClick={() => setViewingEntryId(entry.id)}
                        className="h-full flex flex-col rounded-2xl border border-white/5 hover:border-violet-500/30 bg-[#12121a] hover:shadow-2xl cursor-pointer transition-all duration-300 overflow-hidden relative"
                        style={{
                          boxShadow: bgColor !== 'transparent' ? `0 0 25px -5px ${bgColor}` : undefined,
                          borderColor: bgColor !== 'transparent' ? bgColor : undefined,
                        }}
                      >
                        {coverImage && (
                          <div className="w-full h-36 overflow-hidden relative border-b border-white/5 shrink-0">
                            <img
                              src={coverImage}
                              alt="Cover"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {displayImages.length > 1 && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">
                                +{displayImages.length - 1} photos
                              </div>
                            )}
                          </div>
                        )}

                        <div className="p-5 flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[10px] text-zinc-500 font-bold font-mono">
                                {new Date(entry.createdAt).toLocaleTimeString([], {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </span>
                              <div className={`p-1 rounded-lg ${moodConfig?.color.split(' ').slice(1).join(' ') || ''}`}>
                                <MoodIcon size={14} className={moodConfig?.color.split(' ')[0]} />
                              </div>
                            </div>

                            <h4 className="text-base font-extrabold text-white leading-snug mb-2 truncate group-hover:text-violet-300 transition-colors">
                              {entry.title}
                            </h4>
                            <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                              {entry.content}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showArchived
                            ? onUnarchiveEntry(entry.id)
                            : onArchiveEntry(entry.id);
                        }}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-white"
                        title={showArchived ? 'Restore' : 'Archive'}
                      >
                        {showArchived ? <RefreshCcw size={14} /> : <Archive size={14} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-[#12121a]/10 text-zinc-500">
            <p className="text-sm">
              {showArchived ? 'No archived logs.' : 'Your journal feed is empty.'}
            </p>
            {!showArchived && (
              <button
                onClick={handleOpenNewEntry}
                className="mt-4 text-violet-400 font-bold hover:underline text-xs uppercase tracking-wider font-mono"
              >
                Write your first reflection
              </button>
            )}
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={convertingDump ? 'Convert Dump to Journal' : 'New Journal Log'}
          className="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono font-bold uppercase tracking-wider">
              <Calendar size={14} className="text-violet-400" />
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="bg-transparent focus:outline-none hover:text-white cursor-pointer font-bold"
              />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Reflective Title..."
              className="w-full bg-transparent text-xl font-bold text-white placeholder-zinc-700 focus:outline-none"
            />

            {selectedImages.length > 0 && (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="relative inline-block shrink-0 group">
                    <img
                      src={img}
                      alt="Preview"
                      className="h-28 w-28 rounded-xl border border-white/5 object-cover"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-full backdrop-blur-sm transition-colors"
                    >
                      <X size={12} />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-violet-600/90 text-white text-[8px] px-1.5 py-0.5 rounded font-mono font-black uppercase tracking-wider">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Deep dive into your thoughts, feelings, and details..."
              className="w-full min-h-[180px] bg-transparent text-sm text-zinc-300 placeholder-zinc-700 focus:outline-none resize-none leading-relaxed"
            />

            {/* Footer Row */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-1.5 items-center">
                {MOODS.map((mood) => {
                  const isSel = selectedMood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => setSelectedMood(mood.id)}
                      className={`p-2 rounded-xl transition-all border ${
                        isSel
                          ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/25'
                          : 'border-white/5 bg-white/5 text-zinc-500 hover:text-white'
                      }`}
                      title={mood.id}
                    >
                      <mood.icon size={18} />
                    </button>
                  );
                })}
                <div className="w-px h-6 bg-white/5 mx-2" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-zinc-400 hover:text-white bg-white/5 border border-white/5 p-2 rounded-xl transition-colors"
                  title="Attach Photos"
                >
                  <ImageIcon size={18} />
                </button>
              </div>

              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Button onClick={closeModal} variant="ghost">
                  Cancel
                </Button>
                <Button
                  onClick={saveNewEntry}
                  disabled={!content.trim() && !title.trim() && selectedImages.length === 0}
                  variant="primary"
                  className="flex items-center gap-1.5"
                >
                  <Save size={16} /> Save Reflection
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const JournalDetailView: React.FC<{
  entry: JournalEntry;
  onBack: () => void;
  onUpdate: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
}> = ({ entry, onBack, onUpdate, onDelete, onArchive, onUnarchive }) => {
  const [isEditing, setIsEditing] = React.useState(false);

  // Edit State
  const [title, setTitle] = React.useState(entry.title);
  const [content, setContent] = React.useState(entry.content);
  const [mood, setMood] = React.useState<Mood>(entry.mood);
  const [images, setImages] = React.useState<string[]>(entry.images || []);

  const [activeSlide, setActiveSlide] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onUpdate({
      ...entry,
      title,
      content,
      mood,
      images,
    });
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const index = Math.round(scrollLeft / width);
      setActiveSlide(index);
    }
  };

  const moodConfig = MOODS.find((m) => m.id === (isEditing ? mood : entry.mood));
  const MoodIcon = moodConfig?.icon || Smile;

  return (
    <div className="w-full bg-[#0a0a0f] min-h-full pb-32 animate-fade-in">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-[#0a0a0f]/90 backdrop-blur-md z-30 px-6 py-4 flex justify-between items-center border-b border-white/5">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white font-bold uppercase tracking-wider text-xs"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider"
              >
                Cancel
              </button>
              <Button onClick={handleSave} variant="primary" className="flex items-center gap-1.5 shadow-lg">
                <Check size={14} strokeWidth={3} /> Save
              </Button>
            </>
          ) : (
            <>
              {onArchive && (
                <button
                  onClick={() => {
                    onArchive(entry.id);
                    onBack();
                  }}
                  className="p-2.5 bg-white/5 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all"
                  title="Archive"
                >
                  <Archive size={16} />
                </button>
              )}
              {onUnarchive && (
                <button
                  onClick={() => {
                    onUnarchive(entry.id);
                    onBack();
                  }}
                  className="p-2.5 bg-white/5 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white rounded-xl transition-all"
                  title="Unarchive"
                >
                  <RefreshCcw size={16} />
                </button>
              )}
              <button
                onClick={() => onDelete(entry.id)}
                className="p-2.5 bg-white/5 border border-white/5 hover:bg-rose-500/10 hover:text-rose-400 text-zinc-500 rounded-xl transition-all"
                title="Delete Entry"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white/5 hover:bg-white/10 border border-white/5 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <Edit2 size={14} /> Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="space-y-3">
          {isEditing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-black text-white bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder-zinc-700"
              placeholder="Reflection Title..."
            />
          ) : (
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
              {title}
            </h1>
          )}

          <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-3 flex-wrap pt-1">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5 text-zinc-300">
              <Calendar size={14} className="text-violet-400" />
              {new Date(entry.createdAt).toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>
              {new Date(entry.createdAt).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
            {!isEditing && (
              <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5 text-zinc-300">
                <MoodIcon size={14} className={moodConfig?.color.split(' ')[0]} />
                <span className="capitalize">{entry.mood}</span>
              </span>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-2 py-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                className={`p-2.5 rounded-xl transition-all border ${
                  mood === m.id
                    ? 'bg-violet-600 border-violet-500 text-white scale-110 shadow-lg'
                    : 'border-white/5 bg-white/5 text-zinc-500 hover:text-white'
                }`}
              >
                <m.icon size={18} />
              </button>
            ))}
          </div>
        )}

        {isEditing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-white/5">
                  <img
                    src={img}
                    alt={`Attached ${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-rose-600 text-white p-1 rounded-full transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                className="aspect-square bg-white/[0.02] border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-zinc-500 hover:text-white hover:border-violet-500/30 transition-colors"
              >
                <Plus size={24} />
                <span className="text-[10px] font-bold uppercase tracking-wider font-mono mt-2">Add Image</span>
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              ref={fileRef}
              onChange={handleImageUpload}
            />
          </div>
        )}

        {!isEditing && images.length > 0 && (
          <div className="relative group rounded-2xl overflow-hidden bg-black/30 border border-white/5">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="w-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
            >
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="w-full flex-shrink-0 snap-center flex justify-center items-center bg-black/20"
                >
                  <img
                    src={img}
                    alt={`Attachment Slide ${idx}`}
                    className="max-h-[60vh] object-contain"
                  />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      activeSlide === idx
                        ? 'bg-violet-500 w-6 shadow-[0_0_8px_#8b5cf6]'
                        : 'bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[40vh] resize-none bg-transparent text-sm leading-relaxed text-zinc-300 focus:outline-none no-scrollbar p-2"
            placeholder="Type your notes here..."
          />
        ) : (
          <div className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap max-w-none prose prose-invert font-medium">
            {content}
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalModule;
