import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tasks | LOAH',
  description: 'Create and organize tasks, log subtask checklists, and run time-blocked focus sessions.',
};

const TaskModule = dynamic(
  () => import('../../../components/modules/TaskModule'),
  {
    ssr: false,
  }
);

export default function TasksPage() {
  return <TaskModule />;
}
