import { StateCreator } from 'zustand';
import { Task } from '../../types';
import { AppStoreState } from '../useAppStore';

export interface TaskSlice {
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  handleAddTask: (task: Task) => void;
  handleUpdateTask: (task: Task) => void;
  handleDeleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  toggleTaskSubtask: (routineId: string, subtaskId: string) => void;
  generateRecurringTasks: (baseTask: Task) => Task[];
}

export const createTaskSlice: StateCreator<
  AppStoreState,
  [],
  [],
  TaskSlice
> = (set, get) => ({
  tasks: [],
  setTasks: (updater) => {
    set((state) => ({
      tasks: typeof updater === 'function' ? updater(state.tasks) : updater,
    }));
  },
  handleAddTask: (task) => {
    if (task.recurrence && task.recurrence.instancesToGenerate > 1) {
      const generated = get().generateRecurringTasks(task);
      set((state) => ({
        tasks: [...generated.reverse(), ...state.tasks],
      }));
    } else {
      set((state) => ({
        tasks: [task, ...state.tasks],
      }));
    }
  },
  handleUpdateTask: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    }));
  },
  handleDeleteTask: (id) => {
    get().handleSoftDelete(id, 'task');
  },
  toggleTask: (taskId) => {
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return {};
      const newStatus = !task.isCompleted;
      const updatedTask = {
        ...task,
        isCompleted: newStatus,
        completedAt: newStatus ? Date.now() : undefined,
      };
      return {
        tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
      };
    });
  },
  toggleTaskSubtask: (routineId, subtaskId) => {
    let taskId = '';
    if (routineId.startsWith('task-')) {
      taskId = routineId.replace('task-', '');
    } else {
      const task = get().tasks.find((t) =>
        t.subtasks?.some((s) => s.id === subtaskId)
      );
      if (task) taskId = task.id;
    }

    if (taskId) {
      set((state) => {
        const updatedTasks = state.tasks.map((t) => {
          if (t.id === taskId && t.subtasks) {
            const updatedSubtasks = t.subtasks.map((s) =>
              s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
            );
            return { ...t, subtasks: updatedSubtasks };
          }
          return t;
        });

        // Also update activeRoutine if it's currently selected in player
        const activeRoutine = state.activeRoutine;
        let newActiveRoutine = activeRoutine;
        if (activeRoutine && activeRoutine.id === `task-${taskId}`) {
          const targetTask = updatedTasks.find((t) => t.id === taskId);
          if (targetTask && targetTask.subtasks) {
            newActiveRoutine = {
              ...activeRoutine,
              subtasks: targetTask.subtasks,
            };
          }
        }

        return {
          tasks: updatedTasks,
          activeRoutine: newActiveRoutine,
        };
      });
    }
  },
  generateRecurringTasks: (baseTask) => {
    if (!baseTask.recurrence || !baseTask.startTime) return [baseTask];

    const config = baseTask.recurrence;
    const generatedTasks: Task[] = [baseTask];
    const seriesId = baseTask.seriesId || Date.now().toString();

    if (!baseTask.seriesId) baseTask.seriesId = seriesId;

    let lastDate = new Date(baseTask.startTime);

    for (let i = 1; i < config.instancesToGenerate; i++) {
      const nextDate = new Date(lastDate);

      if (config.type === 'daily') {
        nextDate.setDate(nextDate.getDate() + config.interval);
      } else if (config.type === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7 * config.interval);
      } else if (config.type === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + config.interval);
      } else if (config.type === 'specific_days' && config.daysOfWeek) {
        let found = false;
        for (let d = 1; d <= 365; d++) {
          nextDate.setDate(nextDate.getDate() + 1);
          if (config.daysOfWeek.includes(nextDate.getDay())) {
            found = true;
            break;
          }
        }
        if (!found) break;
      }

      const newTask: Task = {
        ...baseTask,
        id: `${seriesId}-${i}-${Date.now()}`,
        startTime: nextDate.getTime(),
        isCompleted: false,
        seriesId: seriesId,
        recurrence: { ...config, instancesToGenerate: 0 },
      };
      generatedTasks.push(newTask);
      lastDate = nextDate;
    }
    return generatedTasks;
  },
});
