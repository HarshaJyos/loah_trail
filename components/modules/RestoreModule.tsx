'use client';

import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Trash2,
  RotateCcw,
  CheckSquare,
  PlayCircle,
  BookOpen,
  StickyNote,
  Brain,
  Briefcase,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

type TabType =
  | 'all'
  | 'task'
  | 'routine'
  | 'habit'
  | 'journal'
  | 'note'
  | 'dump'
  | 'project';

export const RestoreModule: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabType>('all');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Zustand state and actions
  const tasks = useAppStore((state) => state.tasks);
  const routines = useAppStore((state) => state.routines);
  const journalEntries = useAppStore((state) => state.journalEntries);
  const notes = useAppStore((state) => state.notes);
  const storeDumps = useAppStore((state) => state.dumps);
  const storeProjects = useAppStore((state) => state.projects);
  const storeHabits = useAppStore((state) => state.habits);

  const handleRestore = useAppStore((state) => state.handleRestore);
  const handleHardDelete = useAppStore((state) => state.handleHardDelete);
  const handleExport = useAppStore((state) => state.handleExport);
  const importStoreData = useAppStore((state) => state.importStoreData);
  const handleResetApp = useAppStore((state) => state.handleResetApp);

  // Filter out deleted items
  const deletedTasks = React.useMemo(() => tasks.filter((t) => t.deletedAt), [tasks]);
  const deletedRoutines = React.useMemo(() => routines.filter((r) => r.deletedAt), [routines]);
  const deletedJournal = React.useMemo(() => journalEntries.filter((j) => j.deletedAt), [journalEntries]);
  const deletedNotes = React.useMemo(() => notes.filter((n) => n.deletedAt), [notes]);
  const deletedDumps = React.useMemo(() => (storeDumps || []).filter((d) => d.deletedAt), [storeDumps]);
  const deletedProjects = React.useMemo(() => (storeProjects || []).filter((p) => p.deletedAt), [storeProjects]);
  const deletedHabits = React.useMemo(() => (storeHabits || []).filter((h) => h.deletedAt), [storeHabits]);

  // Combine and sort deleted items
  const items = React.useMemo(() => {
    const allItems = [
      ...deletedTasks.map((i) => ({
        ...i,
        content: i.description || '',
        type: 'task' as const,
      })),
      ...deletedRoutines.map((i) => ({
        ...i,
        content: `${i.steps?.length || 0} steps`,
        type: 'routine' as const,
      })),
      ...deletedJournal.map((i) => ({
        ...i,
        content: i.content,
        type: 'journal' as const,
      })),
      ...deletedNotes.map((i) => ({
        ...i,
        content: i.content || (i.items ? `${i.items.length} items` : ''),
        type: 'note' as const,
      })),
      ...deletedDumps.map((i) => ({
        ...i,
        content: i.description,
        type: 'dump' as const,
      })),
      ...deletedProjects.map((i) => ({
        ...i,
        content: i.description,
        type: 'project' as const,
      })),
      ...deletedHabits.map((i) => ({
        ...i,
        content: i.description || `${i.frequency?.type || 'daily'} goal`,
        type: 'habit' as const,
      })),
    ];

    const sorted = allItems.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));

    if (activeTab === 'all') return sorted;
    return sorted.filter((i) => i.type === activeTab);
  }, [
    deletedTasks,
    deletedRoutines,
    deletedJournal,
    deletedNotes,
    deletedDumps,
    deletedProjects,
    deletedHabits,
    activeTab,
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckSquare size={16} />;
      case 'routine':
        return <PlayCircle size={16} />;
      case 'journal':
        return <BookOpen size={16} />;
      case 'note':
        return <StickyNote size={16} />;
      case 'dump':
        return <Brain size={16} />;
      case 'project':
        return <Briefcase size={16} />;
      case 'habit':
        return <CheckCircle size={16} />;
      default:
        return <Trash2 size={16} />;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'task':
        return 'Task';
      case 'routine':
        return 'Routine';
      case 'journal':
        return 'Log';
      case 'note':
        return 'Note';
      case 'dump':
        return 'Idea';
      case 'project':
        return 'Project';
      case 'habit':
        return 'Habit';
      default:
        return 'Item';
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        if (confirm('Import backup data? This will permanently replace all your current data.')) {
          const success = importStoreData(data);
          if (success) {
            alert('Data imported successfully!');
          } else {
            alert('Failed to import. Invalid backup data format.');
          }
        }
      } catch {
        alert('Failed to import. Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const triggerReset = () => {
    if (confirm('Are you absolutely sure you want to reset the app? All tasks, notes, habits, routines, and settings will be permanently lost.')) {
      handleResetApp();
    }
  };

  const triggerHardDelete = (id: string, type: 'task' | 'routine' | 'journal' | 'note' | 'dump' | 'project' | 'habit') => {
    if (confirm(`Are you sure you want to permanently delete this ${getLabel(type).toLowerCase()}? This action cannot be undone.`)) {
      handleHardDelete(id, type);
    }
  };

  return (
    <div className="w-full h-full p-4 md:p-8 space-y-6 pb-32 max-w-7xl mx-auto overflow-y-auto no-scrollbar animate-fade-in">
      {/* Header & Data Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Trash2 className="text-violet-400" size={28} /> Trash & Data
          </h2>
          <p className="text-[var(--text-secondary)] mt-1 text-sm font-medium">
            Restore deleted items, export your records, or import backups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExport}
            variant="glass"
            className="flex items-center gap-2 active:scale-95 text-zinc-300"
            title="Export Backup"
          >
            <Download size={16} />
            <span>Export</span>
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="glass"
            className="flex items-center gap-2 active:scale-95 text-zinc-300"
            title="Import Backup"
          >
            <Upload size={16} />
            <span>Import</span>
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />

          <Button
            onClick={triggerReset}
            variant="danger"
            className="flex items-center gap-2 active:scale-95"
            title="Reset App"
          >
            <AlertTriangle size={16} />
            <span>Reset App</span>
          </Button>
        </div>
      </div>

      {/* Tabs with counters */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar shrink-0">
        {([
          { id: 'all', label: 'All', count: deletedTasks.length + deletedRoutines.length + deletedJournal.length + deletedNotes.length + deletedDumps.length + deletedProjects.length + deletedHabits.length },
          { id: 'task', label: 'Tasks', count: deletedTasks.length },
          { id: 'routine', label: 'Routines', count: deletedRoutines.length },
          { id: 'habit', label: 'Habits', count: deletedHabits.length },
          { id: 'project', label: 'Projects', count: deletedProjects.length },
          { id: 'note', label: 'Notes', count: deletedNotes.length },
          { id: 'journal', label: 'Logs', count: deletedJournal.length },
          { id: 'dump', label: 'Ideas', count: deletedDumps.length },
        ] as { id: TabType; label: string; count: number }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 border
              ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 to-pink-600 border-transparent text-white shadow-lg shadow-violet-500/25'
                  : 'bg-[#12121a] border-white/5 text-[var(--text-secondary)] hover:text-white hover:border-white/15'
              }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold
                ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Deleted Items List */}
      <div className="space-y-3">
        {items.map((item) => (
          <Card
            key={`${item.type}-${item.id}`}
            variant="glass"
            className="p-4 flex items-center justify-between gap-4 border border-white/5 hover:border-violet-500/30 transition-all duration-300 group"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-3 rounded-2xl bg-white/5 text-zinc-400 group-hover:bg-violet-500/10 group-hover:text-violet-400 transition-colors border border-white/5">
                {getIcon(item.type)}
              </div>

              <div className="min-w-0">
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <span className="text-[9px] font-bold font-mono uppercase tracking-wider bg-violet-500/10 text-violet-400 border border-violet-500/25 px-2 py-0.5 rounded-md">
                    {getLabel(item.type)}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    Deleted {new Date(item.deletedAt!).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-extrabold text-white truncate max-w-md md:max-w-xl">
                  {item.title || 'Untitled'}
                </h3>
                {item.content && (
                  <p className="text-xs text-zinc-500 truncate max-w-md md:max-w-xl mt-0.5">
                    {item.content}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="glass"
                onClick={() => handleRestore(item.id, item.type)}
                className="flex items-center gap-1.5 hover:border-emerald-500/30 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400"
                title="Restore Item"
              >
                <RotateCcw size={14} />
                <span className="hidden md:inline text-xs">Restore</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => triggerHardDelete(item.id, item.type)}
                className="flex items-center gap-1.5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400"
                title="Delete Forever"
              >
                <Trash2 size={14} />
                <span className="hidden md:inline text-xs">Delete Forever</span>
              </Button>
            </div>
          </Card>
        ))}

        {items.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-3xl bg-[#12121a]/10 text-zinc-500">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center shadow-lg border border-white/5 mb-6 text-zinc-400">
              <Trash2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Trash is empty</h3>
            <p className="text-zinc-500 text-xs max-w-sm px-4 leading-relaxed">
              Items you delete from other modules will show up here, allowing you to restore them or delete them permanently.
            </p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 justify-center pt-6 border-t border-white/5">
        <Info size={14} className="text-violet-400" />
        <span>Deleted items are stored in your browser&apos;s local storage and won&apos;t be cleared until deleted permanently.</span>
      </div>
    </div>
  );
};

export default RestoreModule;
