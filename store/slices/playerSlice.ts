import { StateCreator } from 'zustand';
import { Routine, RoutineStep, StepLog, FocusSession, Task, Habit, PausedRoutine } from '../../types';
import { AppStoreState } from '../useAppStore';

export interface PlayerSlice {
  activeRoutine: Routine | null;
  playerSteps: RoutineStep[];
  currentStepIndex: number;
  timeElapsedInStep: number;
  stepLogs: StepLog[];
  isPlaying: boolean;
  isMinimized: boolean;
  focusSessions: FocusSession[];

  setPlayerState: (
    updater:
      | Partial<Omit<PlayerSlice, 'setPlayerState' | 'startRoutine' | 'resumePausedRoutine' | 'savePausedRoutine' | 'handleStepComplete' | 'handleRoutineFinish' | 'exitPlayer' | 'startTaskFocus' | 'startHabitFocus' | 'handleTimeAdjustment' | 'handleRemoveStep' | 'setFocusSessions'>>
      | ((prev: {
          activeRoutine: Routine | null;
          playerSteps: RoutineStep[];
          currentStepIndex: number;
          timeElapsedInStep: number;
          stepLogs: StepLog[];
          isPlaying: boolean;
          isMinimized: boolean;
        }) => Partial<Omit<PlayerSlice, 'setPlayerState' | 'startRoutine' | 'resumePausedRoutine' | 'savePausedRoutine' | 'handleStepComplete' | 'handleRoutineFinish' | 'exitPlayer' | 'startTaskFocus' | 'startHabitFocus' | 'handleTimeAdjustment' | 'handleRemoveStep' | 'setFocusSessions'>>)
  ) => void;
  setFocusSessions: (
    sessions: FocusSession[] | ((prev: FocusSession[]) => FocusSession[])
  ) => void;
  startRoutine: (routineId: string) => void;
  resumePausedRoutine: (paused: PausedRoutine) => void;
  savePausedRoutine: () => void;
  handleStepComplete: () => void;
  handleRoutineFinish: (routine: Routine, logs: StepLog[]) => void;
  exitPlayer: () => void;
  startTaskFocus: (task: Task) => void;
  startHabitFocus: (habit: Habit) => void;
  handleTimeAdjustment: (seconds: number) => void;
  handleRemoveStep: (index: number) => void;
}

export const createPlayerSlice: StateCreator<
  AppStoreState,
  [],
  [],
  PlayerSlice
> = (set, get) => ({
  activeRoutine: null,
  playerSteps: [],
  currentStepIndex: 0,
  timeElapsedInStep: 0,
  stepLogs: [],
  isPlaying: false,
  isMinimized: false,
  focusSessions: [],

  setPlayerState: (updater) => {
    set((state) => {
      const current = {
        activeRoutine: state.activeRoutine,
        playerSteps: state.playerSteps,
        currentStepIndex: state.currentStepIndex,
        timeElapsedInStep: state.timeElapsedInStep,
        stepLogs: state.stepLogs,
        isPlaying: state.isPlaying,
        isMinimized: state.isMinimized,
      };
      const partial = typeof updater === 'function' ? updater(current) : updater;
      return partial;
    });
  },
  setFocusSessions: (updater) => {
    set((state) => ({
      focusSessions:
        typeof updater === 'function' ? updater(state.focusSessions) : updater,
    }));
  },
  startRoutine: (routineId) => {
    const routine = get().routines.find((r) => r.id === routineId);
    if (routine) {
      set({
        activeRoutine: routine,
        playerSteps: [...routine.steps],
        currentStepIndex: 0,
        timeElapsedInStep: 0,
        stepLogs: [],
        isPlaying: true,
        isMinimized: false,
      });
      get().setCurrentView('routine-player');
    }
  },
  resumePausedRoutine: (paused) => {
    set({
      activeRoutine: paused.routine,
      playerSteps: paused.steps ? paused.steps : paused.routine.steps,
      currentStepIndex: paused.currentStepIndex,
      timeElapsedInStep: paused.timeElapsedInStep,
      stepLogs: paused.stepLogs,
      isPlaying: true,
      isMinimized: false,
    });
    get().setPausedRoutines((prev) => prev.filter((p) => p.id !== paused.id));
    get().setCurrentView('routine-player');
  },
  savePausedRoutine: () => {
    const active = get().activeRoutine;
    if (!active) return;
    const paused: PausedRoutine = {
      id: Date.now().toString(),
      routine: active,
      currentStepIndex: get().currentStepIndex,
      timeElapsedInStep: get().timeElapsedInStep,
      stepLogs: get().stepLogs,
      steps: get().playerSteps,
      pausedAt: Date.now(),
    };
    get().setPausedRoutines((prev) => [paused, ...prev]);
    set({ activeRoutine: null });
    get().setCurrentView('routines');
  },
  handleStepComplete: () => {
    const active = get().activeRoutine;
    if (!active) return;
    const steps = get().playerSteps;
    const currentIndex = get().currentStepIndex;
    const currentStep = steps[currentIndex];

    const log: StepLog = {
      stepId: currentStep.id,
      title: currentStep.title,
      expectedDuration: currentStep.durationSeconds,
      actualDuration: get().timeElapsedInStep,
    };
    const newLogs = [...get().stepLogs, log];

    if (currentIndex < steps.length - 1) {
      set({
        currentStepIndex: currentIndex + 1,
        timeElapsedInStep: 0,
        stepLogs: newLogs,
        isPlaying: true,
      });
    } else {
      get().handleRoutineFinish(active, newLogs);
    }
  },
  handleRoutineFinish: (routine, logs) => {
    const actualDuration = logs.reduce((acc, l) => acc + l.actualDuration, 0);
    set({ activeRoutine: null });

    const newSession: FocusSession = {
      id: Date.now().toString(),
      routineId: routine.id,
      routineTitle: routine.title,
      startTime: Date.now() - actualDuration * 1000,
      endTime: Date.now(),
      durationSeconds: actualDuration,
      completedSteps: logs.length,
      totalSteps: routine.steps.length,
      logs: logs,
    };
    get().setFocusSessions((prev) => [newSession, ...prev]);

    if (routine.type === 'once') {
      if (routine.id.startsWith('task-')) {
        const taskId = routine.steps[0].id;
        get().setTasks((prev) =>
          prev.map((t) =>
            t.id === taskId
              ? { ...t, isCompleted: true, completedAt: Date.now() }
              : t
          )
        );
      } else {
        get().setRoutines((prev) =>
          prev.map((r) =>
            r.id === routine.id ? { ...r, completedAt: Date.now() } : r
          )
        );
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const habitUpdates: Record<string, number> = {};

    logs.forEach((log) => {
      const originalStep =
        routine.steps.find((s) => s.id === log.stepId) ||
        get().playerSteps.find((s) => s.id === log.stepId);
      if (originalStep && originalStep.linkedHabitId) {
        habitUpdates[originalStep.linkedHabitId] =
          (habitUpdates[originalStep.linkedHabitId] || 0) + log.actualDuration;
      }
    });

    if (Object.keys(habitUpdates).length > 0) {
      get().setHabits((prev) =>
        prev.map((habit) => {
          if (habitUpdates[habit.id]) {
            const currentVal = habit.history[todayStr] || 0;
            const safeCurrentVal = currentVal === -1 ? 0 : currentVal;
            let newValue = safeCurrentVal;
            const durationIncrement = habitUpdates[habit.id] / 60;
            if (habit.type === 'elastic') {
              newValue = safeCurrentVal + durationIncrement;
            } else {
              if (habit.goal.type === 'duration') {
                newValue = safeCurrentVal + durationIncrement;
              } else {
                newValue = safeCurrentVal + 1;
              }
            }
            const newHistory = {
              ...habit.history,
              [todayStr]: parseFloat(newValue.toFixed(2)),
            };
            const newStreak = get().calculateHabitStreak({
              ...habit,
              history: newHistory,
            });
            return { ...habit, history: newHistory, streak: newStreak };
          }
          return habit;
        })
      );
    }

    get().setCurrentView('dashboard');
  },
  exitPlayer: () => {
    set({ activeRoutine: null });
    get().setCurrentView('dashboard');
  },
  startTaskFocus: (task) => {
    const tempRoutine: Routine = {
      id: `task-${task.id}`,
      title: 'Task Focus',
      color: 'bg-black',
      type: 'once',
      steps: [
        {
          id: task.id,
          title: task.title,
          durationSeconds: (task.duration || 30) * 60,
          linkedTaskId: task.id,
        },
      ],
      subtasks: task.subtasks,
    };
    set({
      activeRoutine: tempRoutine,
      playerSteps: [...tempRoutine.steps],
      currentStepIndex: 0,
      timeElapsedInStep: 0,
      stepLogs: [],
      isPlaying: true,
      isMinimized: false,
    });
    get().setCurrentView('routine-player');
  },
  startHabitFocus: (habit) => {
    let durationSeconds = 30 * 60;
    if (habit.goal.type === 'duration') {
      durationSeconds = habit.goal.target * 60;
    } else if (habit.type === 'elastic' && habit.elasticConfig) {
      durationSeconds = habit.elasticConfig.elite.target * 60;
    }

    const tempRoutine: Routine = {
      id: `habit-focus-${habit.id}`,
      title: `${habit.title} Session`,
      color: habit.color,
      type: 'once',
      steps: [
        {
          id: habit.id,
          title: habit.title,
          durationSeconds: durationSeconds,
          linkedHabitId: habit.id,
        },
      ],
    };
    set({
      activeRoutine: tempRoutine,
      playerSteps: [...tempRoutine.steps],
      currentStepIndex: 0,
      timeElapsedInStep: 0,
      stepLogs: [],
      isPlaying: true,
      isMinimized: false,
    });
    get().setCurrentView('routine-player');
  },
  handleTimeAdjustment: (seconds) => {
    set((state) => {
      let newElapsed = state.timeElapsedInStep - seconds;
      if (newElapsed < 0) newElapsed = 0;
      return { timeElapsedInStep: newElapsed };
    });
  },
  handleRemoveStep: (index) => {
    const steps = get().playerSteps;
    if (steps.length <= 1) {
      set({ activeRoutine: null });
      get().setCurrentView('dashboard');
      return;
    }

    set((state) => {
      const newSteps = [...state.playerSteps];
      newSteps.splice(index, 1);
      let newIndex = state.currentStepIndex;
      let newElapsed = state.timeElapsedInStep;

      if (index < state.currentStepIndex) {
        newIndex = state.currentStepIndex - 1;
      } else if (index === state.currentStepIndex) {
        newElapsed = 0;
      }

      if (newIndex >= newSteps.length) {
        newIndex = newSteps.length - 1;
      }

      return {
        playerSteps: newSteps,
        currentStepIndex: newIndex,
        timeElapsedInStep: newElapsed,
      };
    });
  },
});
