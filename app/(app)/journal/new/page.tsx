import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Journal Log | LOAH',
  description: 'Log your mood and daily reflections.',
};

const JournalEditor = dynamic(
  () => import('../../../../components/editors/JournalEditor'),
  {
    ssr: false,
  }
);

export default function NewJournalPage() {
  return <JournalEditor mode="new" />;
}
