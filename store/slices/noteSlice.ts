import { StateCreator } from 'zustand';
import { Note } from '../../types';
import { AppStoreState } from '../useAppStore';

export interface NoteSlice {
  notes: Note[];
  setNotes: (notes: Note[] | ((prev: Note[]) => Note[])) => void;
  handleAddNote: (note: Note) => void;
  handleUpdateNote: (note: Note) => void;
  handleDeleteNote: (id: string) => void;
  handleReorderNotes: (newOrder: Note[]) => void;
}

export const createNoteSlice: StateCreator<
  AppStoreState,
  [],
  [],
  NoteSlice
> = (set, get) => ({
  notes: [],
  setNotes: (updater) => {
    set((state) => ({
      notes: typeof updater === 'function' ? updater(state.notes) : updater,
    }));
  },
  handleAddNote: (note) => {
    set((state) => ({
      notes: [note, ...state.notes],
    }));
  },
  handleUpdateNote: (note) => {
    set((state) => ({
      notes: state.notes.map((n) => (n.id === note.id ? note : n)),
    }));
  },
  handleDeleteNote: (id) => {
    get().handleSoftDelete(id, 'note');
  },
  handleReorderNotes: (newOrder) => {
    set({ notes: newOrder });
  },
});
