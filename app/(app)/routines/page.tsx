import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Routines | LOAH',
  description: 'Design and build your daily repeatable or single-run routine flows.',
};

const RoutineModule = dynamic(
  () => import('../../../components/modules/RoutineModule'),
  {
    ssr: false,
  }
);

export default function RoutinesPage() {
  return <RoutineModule />;
}
