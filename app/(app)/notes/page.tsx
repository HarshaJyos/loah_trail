import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notes | LOAH',
  description: 'Organize your mind with masonry boards, checklists, and text cards.',
};

const NotesModule = dynamic(
  () => import('../../../components/modules/NotesModule'),
  {
    ssr: false,
  }
);

export default function NotesPage() {
  return <NotesModule />;
}
