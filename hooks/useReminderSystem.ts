'use client';

import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { playSound } from '../utils/sounds';
import { Reminder } from '../types';

export const useReminderSystem = () => {
  const tasks = useAppStore((state) => state.tasks);
  const routines = useAppStore((state) => state.routines);
  const projects = useAppStore((state) => state.projects);

  useEffect(() => {
    const checkReminders = () => {
      const now = Date.now();
      const checkItemReminders = (
        id: string,
        title: string,
        startTime: number,
        reminders?: Reminder[]
      ) => {
        if (reminders) {
          reminders.forEach((r) => {
            const reminderTime = startTime - r.timeOffset * 60000;
            const rDiffMs = reminderTime - now;
            if (rDiffMs <= 0 && rDiffMs > -60000) {
              playSound('REMINDER');
              if (typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                  new Notification(`Reminder: ${title}`, {
                    body:
                      r.timeOffset === 0
                        ? 'Starting now!'
                        : `Starting in ${r.timeOffset} minutes.`,
                  });
                } else if (Notification.permission !== 'denied') {
                  Notification.requestPermission();
                }
              }
            }
          });
        }
      };

      tasks
        .filter((t) => !t.isCompleted && !t.deletedAt && t.startTime)
        .forEach((t) =>
          checkItemReminders(t.id, t.title, t.startTime!, t.reminders)
        );
      routines
        .filter((r) => !r.completedAt && !r.deletedAt && r.startTime)
        .forEach((r) =>
          checkItemReminders(r.id, r.title, r.startTime!, r.reminders)
        );
      projects
        .filter((p) => p.status === 'active' && !p.deletedAt)
        .forEach((p) =>
          checkItemReminders(p.id, p.title, p.dueDate, p.reminders)
        );
    };

    const reminderInterval = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(reminderInterval);
  }, [tasks, routines, projects]);
};
export default useReminderSystem;
