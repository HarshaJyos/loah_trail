import { StateCreator } from 'zustand';
import { JournalEntry } from '../../types';
import { AppStoreState } from '../useAppStore';

export interface JournalSlice {
  journalEntries: JournalEntry[];
  setJournalEntries: (
    entries: JournalEntry[] | ((prev: JournalEntry[]) => JournalEntry[])
  ) => void;
  handleAddJournalEntry: (entry: JournalEntry) => void;
  handleUpdateJournalEntry: (entry: JournalEntry) => void;
  handleDeleteJournalEntry: (id: string) => void;
}

export const createJournalSlice: StateCreator<
  AppStoreState,
  [],
  [],
  JournalSlice
> = (set, get) => ({
  journalEntries: [],
  setJournalEntries: (updater) => {
    set((state) => ({
      journalEntries:
        typeof updater === 'function' ? updater(state.journalEntries) : updater,
    }));
  },
  handleAddJournalEntry: (entry) => {
    set((state) => ({
      journalEntries: [entry, ...state.journalEntries],
    }));
  },
  handleUpdateJournalEntry: (entry) => {
    set((state) => ({
      journalEntries: state.journalEntries.map((e) =>
        e.id === entry.id ? entry : e
      ),
    }));
  },
  handleDeleteJournalEntry: (id) => {
    get().handleSoftDelete(id, 'journal');
  },
});
