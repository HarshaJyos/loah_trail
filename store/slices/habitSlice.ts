import { StateCreator } from 'zustand';
import { Habit, Routine } from '../../types';
import { AppStoreState } from '../useAppStore';

export interface HabitSlice {
  habits: Habit[];
  setHabits: (habits: Habit[] | ((prev: Habit[]) => Habit[])) => void;
  handleAddHabit: (habit: Habit) => void;
  handleUpdateHabit: (habit: Habit) => void;
  handleDeleteHabit: (id: string) => void;
  handleReorderHabits: (newOrder: Habit[]) => void;
  scheduleHabit: (habitId: string, startTime: number) => void;
  handleUpdateHabitProgress: (
    habitId: string,
    date: string,
    value: number
  ) => void;
  calculateHabitStreak: (
    habit: Habit,
    historyOverride?: Record<string, number>
  ) => number;
}

export const createHabitSlice: StateCreator<
  AppStoreState,
  [],
  [],
  HabitSlice
> = (set, get) => ({
  habits: [],
  setHabits: (updater) => {
    set((state) => ({
      habits: typeof updater === 'function' ? updater(state.habits) : updater,
    }));
  },
  handleAddHabit: (habit) => {
    set((state) => ({
      habits: [...state.habits, habit],
    }));
  },
  handleUpdateHabit: (habit) => {
    set((state) => ({
      habits: state.habits.map((h) => (h.id === habit.id ? habit : h)),
    }));
  },
  handleDeleteHabit: (id) => {
    get().handleSoftDelete(id, 'habit');
  },
  handleReorderHabits: (newOrder) => {
    set({ habits: newOrder });
  },
  scheduleHabit: (habitId, startTime) => {
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return;
    const duration =
      habit.goal.type === 'duration' ? habit.goal.target * 60 : 900;
    const newRoutine: Routine = {
      id: `habit-${habit.id}-${Date.now()}`,
      title: habit.title,
      color: habit.color,
      type: 'once',
      startTime: startTime,
      steps: [
        {
          id: Date.now().toString(),
          title: habit.title,
          durationSeconds: duration,
          linkedHabitId: habit.id,
        },
      ],
    };
    get().setRoutines((prev) => [...prev, newRoutine]);
  },
  handleUpdateHabitProgress: (habitId, date, value) => {
    set((state) => ({
      habits: state.habits.map((h) => {
        if (h.id === habitId) {
          const newHistory = { ...h.history };
          if (value === 0) {
            delete newHistory[date];
          } else {
            newHistory[date] = value;
          }

          const newStreak = get().calculateHabitStreak({
            ...h,
            history: newHistory,
          });
          return { ...h, history: newHistory, streak: newStreak };
        }
        return h;
      }),
    }));
  },
  calculateHabitStreak: (habit, historyOverride) => {
    const history = historyOverride || habit.history;
    const { frequency, goal, type } = habit;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const getVal = (d: Date) => history[d.toISOString().split('T')[0]] || 0;
    const isCompleted = (val: number) => {
      if (val === -1) return false;
      if (type === 'elastic') return val >= 1;
      return val >= goal.target;
    };

    const todayVal = getVal(today);
    const yesterdayVal = getVal(yesterday);
    let streak = 0;
    let checkDate: Date;

    if (isCompleted(todayVal)) {
      streak = 1;
      checkDate = yesterday;
    } else if (isCompleted(yesterdayVal)) {
      streak = 1;
      checkDate = new Date(yesterday);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      return 0;
    }

    for (let i = 0; i < 365; i++) {
      const val = getVal(checkDate);
      let isScheduled = true;
      if (frequency.type === 'specific_days' && frequency.daysOfWeek) {
        if (!frequency.daysOfWeek.includes(checkDate.getDay())) {
          isScheduled = false;
        }
      }
      if (val === -1) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      if (isScheduled) {
        if (isCompleted(val)) {
          streak++;
        } else {
          break;
        }
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  },
});
