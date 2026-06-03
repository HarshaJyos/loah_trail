import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Habit | LOAH',
  description: 'Create a new habit in your ADHD life organizer.',
};

const HabitEditor = dynamic(
  () => import('../../../../components/editors/HabitEditor'),
  {
    ssr: false,
  }
);

export default function NewHabitPage() {
  return <HabitEditor />;
}
