import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TaskSlice, createTaskSlice } from './slices/taskSlice';
import { RoutineSlice, createRoutineSlice } from './slices/routineSlice';
import { HabitSlice, createHabitSlice } from './slices/habitSlice';
import { ProjectSlice, createProjectSlice } from './slices/projectSlice';
import { NoteSlice, createNoteSlice } from './slices/noteSlice';
import { JournalSlice, createJournalSlice } from './slices/journalSlice';
import { DumpSlice, createDumpSlice } from './slices/dumpSlice';
import { PlayerSlice, createPlayerSlice } from './slices/playerSlice';
import { UISlice, createUISlice } from './slices/uiSlice';

export type AppStoreState = TaskSlice &
  RoutineSlice &
  HabitSlice &
  ProjectSlice &
  NoteSlice &
  JournalSlice &
  DumpSlice &
  PlayerSlice &
  UISlice;

export const useAppStore = create<AppStoreState>()(
  persist(
    (...a) => ({
      ...createTaskSlice(...a),
      ...createRoutineSlice(...a),
      ...createHabitSlice(...a),
      ...createProjectSlice(...a),
      ...createNoteSlice(...a),
      ...createJournalSlice(...a),
      ...createDumpSlice(...a),
      ...createPlayerSlice(...a),
      ...createUISlice(...a),
    }),
    {
      name: 'lifeflow_store',
      partialize: (state) => ({
        tasks: state.tasks,
        routines: state.routines,
        journalEntries: state.journalEntries,
        notes: state.notes,
        focusSessions: state.focusSessions,
        dumps: state.dumps,
        projects: state.projects,
        habits: state.habits,
        pausedRoutines: state.pausedRoutines,
        uiScale: state.uiScale,
        currentView: state.currentView,
      }),
    }
  )
);
export default useAppStore;
