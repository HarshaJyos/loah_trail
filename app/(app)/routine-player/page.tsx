import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Focus Player | LOAH',
  description: 'Immersive focus routine timer and task progression system.',
};

const RoutinePlayer = dynamic(
  () => import('../../../components/modules/RoutinePlayer'),
  {
    ssr: false,
  }
);

export default function RoutinePlayerPage() {
  return <RoutinePlayer />;
}
