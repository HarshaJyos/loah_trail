import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Routine | LOAH',
  description: 'Modify details of an existing focus routine.',
};

const RoutineEditor = dynamic(
  () => import('../../../../components/editors/RoutineEditor'),
  {
    ssr: false,
  }
);

export default function EditRoutinePage() {
  return <RoutineEditor mode="edit" />;
}
