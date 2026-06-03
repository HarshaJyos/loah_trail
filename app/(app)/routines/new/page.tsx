import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Routine | LOAH',
  description: 'Create a new routine in your ADHD life organizer.',
};

const RoutineEditor = dynamic(
  () => import('../../../../components/editors/RoutineEditor'),
  {
    ssr: false,
  }
);

export default function NewRoutinePage() {
  return <RoutineEditor />;
}
