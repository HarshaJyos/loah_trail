import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Note | LOAH',
  description: 'Write rich text notes and checklist boards.',
};

const NoteEditor = dynamic(
  () => import('../../../../components/editors/NoteEditor'),
  {
    ssr: false,
  }
);

export default function NewNotePage() {
  return <NoteEditor mode="new" />;
}
