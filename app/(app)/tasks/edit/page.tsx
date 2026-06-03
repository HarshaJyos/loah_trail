import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Task | LOAH',
  description: 'Modify details of an existing task.',
};

const TaskEditor = dynamic(
  () => import('../../../../components/editors/TaskEditor'),
  {
    ssr: false,
  }
);

export default function EditTaskPage() {
  return <TaskEditor mode="edit" />;
}
