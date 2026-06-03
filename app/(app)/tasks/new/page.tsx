import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Task | LOAH',
  description: 'Create a new task in your ADHD life organizer.',
};

const TaskEditor = dynamic(
  () => import('../../../../components/editors/TaskEditor'),
  {
    ssr: false,
  }
);

export default function NewTaskPage() {
  return <TaskEditor />;
}
