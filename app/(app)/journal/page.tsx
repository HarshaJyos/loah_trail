import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Journal | LOAH',
  description: 'Write logs, trace your moods daily, and search reflective diaries.',
};

const JournalModule = dynamic(
  () => import('../../../components/modules/JournalModule'),
  {
    ssr: false,
  }
);

export default function JournalPage() {
  return <JournalModule />;
}
