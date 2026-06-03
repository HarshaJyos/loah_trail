import { StateCreator } from 'zustand';
import { Dump } from '../../types';
import { AppStoreState } from '../useAppStore';

export interface DumpSlice {
  dumps: Dump[];
  convertingDump: Dump | null;
  setDumps: (dumps: Dump[] | ((prev: Dump[]) => Dump[])) => void;
  setConvertingDump: (dump: Dump | null) => void;
  handleAddDump: (dump: Dump) => void;
  handleDeleteDump: (id: string) => void;
  convertDumpToTask: (dump: Dump) => void;
  convertDumpToNote: (dump: Dump) => void;
  convertDumpToJournal: (dump: Dump) => void;
  convertDumpToProject: (dump: Dump) => void;
  handleConvertComplete: () => void;
}

export const createDumpSlice: StateCreator<
  AppStoreState,
  [],
  [],
  DumpSlice
> = (set, get) => ({
  dumps: [],
  convertingDump: null,
  setDumps: (updater) => {
    set((state) => ({
      dumps: typeof updater === 'function' ? updater(state.dumps) : updater,
    }));
  },
  setConvertingDump: (dump) => {
    set({ convertingDump: dump });
  },
  handleAddDump: (dump) => {
    set((state) => ({
      dumps: [dump, ...state.dumps],
    }));
  },
  handleDeleteDump: (id) => {
    get().handleSoftDelete(id, 'dump');
  },
  convertDumpToTask: (dump) => {
    set({ convertingDump: dump });
    get().setCurrentView('tasks');
  },
  convertDumpToNote: (dump) => {
    set({ convertingDump: dump });
    get().setCurrentView('notes');
  },
  convertDumpToJournal: (dump) => {
    set({ convertingDump: dump });
    get().setCurrentView('journal');
  },
  convertDumpToProject: (dump) => {
    set({ convertingDump: dump });
    get().setCurrentView('projects');
  },
  handleConvertComplete: () => {
    const dump = get().convertingDump;
    if (dump) {
      get().handleSoftDelete(dump.id, 'dump');
      set({ convertingDump: null });
    }
  },
});
