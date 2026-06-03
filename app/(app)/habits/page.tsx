import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Habits | LOAH',
  description: 'Track daily habits, view streaks, and set elastic check-ins.',
};

const HabitModule = dynamic(
  () => import('../../../components/modules/HabitModule'),
  {
    ssr: false,
  }
);

export default function HabitsPage() {
  return <HabitModule />;
}
