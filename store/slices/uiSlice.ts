import { StateCreator } from 'zustand';
import { ViewState } from '../../types';
import { AppStoreState } from '../useAppStore';

export interface UISlice {
  uiScale: number;
  currentView: ViewState;
  triggerTaskModal: boolean;
  triggerDumpModal: boolean;
  triggerJournalModal: boolean;
  journalPrompt: string;

  setUiScale: (scale: number) => void;
  setCurrentView: (view: ViewState) => void;
  setTriggerTaskModal: (trigger: boolean) => void;
  setTriggerDumpModal: (trigger: boolean) => void;
  setTriggerJournalModal: (trigger: boolean) => void;
  setJournalPrompt: (prompt: string) => void;
  handleQuickAction: (type: 'task' | 'dump' | 'journal' | 'focus') => void;
  handleSoftDelete: (
    id: string,
    type: 'task' | 'routine' | 'journal' | 'note' | 'dump' | 'project' | 'habit'
  ) => void;
  handleArchive: (
    id: string,
    type: 'task' | 'routine' | 'journal' | 'note' | 'dump' | 'project' | 'habit'
  ) => void;
  handleUnarchive: (
    id: string,
    type: 'task' | 'routine' | 'journal' | 'note' | 'dump' | 'project' | 'habit'
  ) => void;
  handleRestore: (
    id: string,
    type: 'task' | 'routine' | 'journal' | 'note' | 'dump' | 'project' | 'habit'
  ) => void;
  handleHardDelete: (
    id: string,
    type: 'task' | 'routine' | 'journal' | 'note' | 'dump' | 'project' | 'habit'
  ) => void;
  handleExport: () => void;
  importStoreData: (data: any) => boolean;
  handleResetApp: () => void;
}

export const createUISlice: StateCreator<
  AppStoreState,
  [],
  [],
  UISlice
> = (set, get) => ({
  uiScale: 1,
  currentView: 'home',
  triggerTaskModal: false,
  triggerDumpModal: false,
  triggerJournalModal: false,
  journalPrompt: '',

  setUiScale: (scale) => set({ uiScale: scale }),
  setCurrentView: (view) => set({ currentView: view }),
  setTriggerTaskModal: (trigger) => set({ triggerTaskModal: trigger }),
  setTriggerDumpModal: (trigger) => set({ triggerDumpModal: trigger }),
  setTriggerJournalModal: (trigger) => set({ triggerJournalModal: trigger }),
  setJournalPrompt: (prompt) => set({ journalPrompt: prompt }),

  handleQuickAction: (type) => {
    if (type === 'task') {
      set({ triggerTaskModal: true, currentView: 'tasks' });
    } else if (type === 'dump') {
      set({ triggerDumpModal: true, currentView: 'dump' });
    } else if (type === 'journal') {
      set({ triggerJournalModal: true, currentView: 'journal' });
    } else if (type === 'focus') {
      set({ currentView: 'routines' });
    }
  },

  handleSoftDelete: (id, type) => {
    const deletedAt = Date.now();
    if (type === 'task') {
      get().setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, deletedAt } : t))
      );
    } else if (type === 'routine') {
      get().setRoutines((prev) =>
        prev.map((r) => (r.id === id ? { ...r, deletedAt } : r))
      );
    } else if (type === 'journal') {
      get().setJournalEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, deletedAt } : e))
      );
    } else if (type === 'note') {
      get().setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, deletedAt } : n))
      );
    } else if (type === 'dump') {
      get().setDumps((prev) =>
        prev.map((d) => (d.id === id ? { ...d, deletedAt } : d))
      );
    } else if (type === 'project') {
      get().setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, deletedAt } : p))
      );
    } else if (type === 'habit') {
      get().setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, deletedAt } : h))
      );
    }
  },

  handleArchive: (id, type) => {
    const archivedAt = Date.now();
    if (type === 'task') {
      get().setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, archivedAt } : t))
      );
    } else if (type === 'routine') {
      get().setRoutines((prev) =>
        prev.map((r) => (r.id === id ? { ...r, archivedAt } : r))
      );
    } else if (type === 'journal') {
      get().setJournalEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, archivedAt } : e))
      );
    } else if (type === 'note') {
      get().setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, archivedAt } : n))
      );
    } else if (type === 'dump') {
      get().setDumps((prev) =>
        prev.map((d) => (d.id === id ? { ...d, archivedAt } : d))
      );
    } else if (type === 'project') {
      get().setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, archivedAt } : p))
      );
    } else if (type === 'habit') {
      get().setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, archivedAt } : h))
      );
    }
  },

  handleUnarchive: (id, type) => {
    if (type === 'task') {
      get().setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, archivedAt: undefined } : t))
      );
    } else if (type === 'routine') {
      get().setRoutines((prev) =>
        prev.map((r) => (r.id === id ? { ...r, archivedAt: undefined } : r))
      );
    } else if (type === 'journal') {
      get().setJournalEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, archivedAt: undefined } : e))
      );
    } else if (type === 'note') {
      get().setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, archivedAt: undefined } : n))
      );
    } else if (type === 'dump') {
      get().setDumps((prev) =>
        prev.map((d) => (d.id === id ? { ...d, archivedAt: undefined } : d))
      );
    } else if (type === 'project') {
      get().setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, archivedAt: undefined } : p))
      );
    } else if (type === 'habit') {
      get().setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, archivedAt: undefined } : h))
      );
    }
  },

  handleRestore: (id, type) => {
    if (type === 'task') {
      get().setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, deletedAt: undefined, archivedAt: undefined } : t
        )
      );
    } else if (type === 'routine') {
      get().setRoutines((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, deletedAt: undefined, archivedAt: undefined } : r
        )
      );
    } else if (type === 'journal') {
      get().setJournalEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, deletedAt: undefined, archivedAt: undefined } : e
        )
      );
    } else if (type === 'note') {
      get().setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, deletedAt: undefined, archivedAt: undefined } : n
        )
      );
    } else if (type === 'dump') {
      get().setDumps((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, deletedAt: undefined, archivedAt: undefined } : d
        )
      );
    } else if (type === 'project') {
      get().setProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, deletedAt: undefined, archivedAt: undefined } : p
        )
      );
    } else if (type === 'habit') {
      get().setHabits((prev) =>
        prev.map((h) =>
          h.id === id ? { ...h, deletedAt: undefined, archivedAt: undefined } : h
        )
      );
    }
  },

  handleHardDelete: (id, type) => {
    if (type === 'task') {
      get().setTasks((prev) => prev.filter((t) => t.id !== id));
    } else if (type === 'routine') {
      get().setRoutines((prev) => prev.filter((r) => r.id !== id));
    } else if (type === 'journal') {
      get().setJournalEntries((prev) => prev.filter((e) => e.id !== id));
    } else if (type === 'note') {
      get().setNotes((prev) => prev.filter((n) => n.id !== id));
    } else if (type === 'dump') {
      get().setDumps((prev) => prev.filter((d) => d.id !== id));
    } else if (type === 'project') {
      get().setProjects((prev) => prev.filter((p) => p.id !== id));
      get().setTasks((prev) =>
        prev.map((t) =>
          t.projectId === id ? { ...t, projectId: undefined } : t
        )
      );
    } else if (type === 'habit') {
      get().setHabits((prev) => prev.filter((h) => h.id !== id));
    }
  },

  handleExport: () => {
    const data = {
      tasks: get().tasks,
      routines: get().routines,
      journalEntries: get().journalEntries,
      notes: get().notes,
      focusSessions: get().focusSessions,
      dumps: get().dumps,
      projects: get().projects,
      habits: get().habits,
      pausedRoutines: get().pausedRoutines,
      exportedAt: new Date().toISOString(),
      version: '1.4',
      uiScale: get().uiScale,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifeflow_backup_${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  importStoreData: (data) => {
    try {
      if (Array.isArray(data.tasks)) get().setTasks(data.tasks);
      if (Array.isArray(data.routines)) get().setRoutines(data.routines);
      if (Array.isArray(data.journalEntries)) get().setJournalEntries(data.journalEntries);
      if (Array.isArray(data.notes)) get().setNotes(data.notes);
      if (Array.isArray(data.focusSessions)) get().setFocusSessions(data.focusSessions);
      if (Array.isArray(data.dumps)) get().setDumps(data.dumps);
      if (Array.isArray(data.projects)) get().setProjects(data.projects);
      if (Array.isArray(data.habits)) get().setHabits(data.habits);
      if (Array.isArray(data.pausedRoutines)) get().setPausedRoutines(data.pausedRoutines);
      if (typeof data.uiScale === 'number') get().setUiScale(data.uiScale);
      return true;
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  },

  handleResetApp: () => {
    localStorage.clear();
    window.location.reload();
  },
});
