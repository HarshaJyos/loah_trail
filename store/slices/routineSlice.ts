import { StateCreator } from 'zustand';
import { Routine, PausedRoutine } from '../../types';
import { AppStoreState } from '../useAppStore';

const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'r1',
    title: 'Morning Protocol',
    color: 'bg-indigo-600',
    type: 'repeatable',
    steps: [
      { id: 's1', title: 'Drink Water', durationSeconds: 60 },
      { id: 's2', title: 'Meditation', durationSeconds: 300 },
      { id: 's3', title: 'Quick Stretch', durationSeconds: 180 },
    ],
  },
];

export interface RoutineSlice {
  routines: Routine[];
  pausedRoutines: PausedRoutine[];
  setRoutines: (routines: Routine[] | ((prev: Routine[]) => Routine[])) => void;
  setPausedRoutines: (
    paused: PausedRoutine[] | ((prev: PausedRoutine[]) => PausedRoutine[])
  ) => void;
  handleAddRoutine: (routine: Routine) => void;
  handleUpdateRoutine: (routine: Routine) => void;
  handleDeleteRoutine: (id: string) => void;
  handleReorderRoutines: (newOrder: Routine[]) => void;
  scheduleRoutine: (templateId: string, startTime: number) => void;
  unscheduleItem: (id: string, type: 'task' | 'routine') => void;
  discardPausedRoutine: (id: string) => void;
}

export const createRoutineSlice: StateCreator<
  AppStoreState,
  [],
  [],
  RoutineSlice
> = (set, get) => ({
  routines: INITIAL_ROUTINES,
  pausedRoutines: [],
  setRoutines: (updater) => {
    set((state) => ({
      routines: typeof updater === 'function' ? updater(state.routines) : updater,
    }));
  },
  setPausedRoutines: (updater) => {
    set((state) => ({
      pausedRoutines:
        typeof updater === 'function' ? updater(state.pausedRoutines) : updater,
    }));
  },
  handleAddRoutine: (routine) => {
    set((state) => ({
      routines: [...state.routines, routine],
    }));
  },
  handleUpdateRoutine: (routine) => {
    set((state) => ({
      routines: state.routines.map((r) => (r.id === routine.id ? routine : r)),
    }));
  },
  handleDeleteRoutine: (id) => {
    get().handleSoftDelete(id, 'routine');
  },
  handleReorderRoutines: (newOrder) => {
    set({ routines: newOrder });
  },
  scheduleRoutine: (templateId, startTime) => {
    const template = get().routines.find((r) => r.id === templateId);
    if (!template) return;
    const newInstance: Routine = {
      ...template,
      id: Date.now().toString(),
      type: 'once',
      startTime: startTime,
      title: template.title,
    };
    set((state) => ({
      routines: [...state.routines, newInstance],
    }));
  },
  unscheduleItem: (id, type) => {
    if (type === 'task') {
      const task = get().tasks.find((t) => t.id === id);
      if (task) get().handleUpdateTask({ ...task, startTime: undefined });
    } else {
      const routine = get().routines.find((r) => r.id === id);
      if (routine) get().handleUpdateRoutine({ ...routine, startTime: undefined });
    }
  },
  discardPausedRoutine: (id) => {
    set((state) => ({
      pausedRoutines: state.pausedRoutines.filter((p) => p.id !== id),
    }));
  },
});
