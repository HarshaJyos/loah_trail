import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Journal Log | LOAH',
  description: 'Modify details of an existing journal entry.',
};

const JournalEditor = dynamic(
  () => import('../../../../components/editors/JournalEditor'),
  {
    ssr: false,
  }
);

export default function EditJournalPage() {
  return <JournalEditor mode="edit" />;
}
