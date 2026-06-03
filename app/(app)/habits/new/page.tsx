import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Habit | LOAH',
  description: 'Track consistency and elastic goals.',
};

const HabitEditor = dynamic(
  () => import('../../../../components/editors/HabitEditor'),
  {
    ssr: false,
  }
);

export default function NewHabitPage() {
  return <HabitEditor mode="new" />;
}
