import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Habit | LOAH',
  description: 'Modify details of an existing habit.',
};

const HabitEditor = dynamic(
  () => import('../../../../components/editors/HabitEditor'),
  {
    ssr: false,
  }
);

export default function EditHabitPage() {
  return <HabitEditor mode="edit" />;
}
