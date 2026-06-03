import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Note | LOAH',
  description: 'Modify details of an existing rich text note.',
};

const NoteEditor = dynamic(
  () => import('../../../../components/editors/NoteEditor'),
  {
    ssr: false,
  }
);

export default function EditNotePage() {
  return <NoteEditor mode="edit" />;
}
