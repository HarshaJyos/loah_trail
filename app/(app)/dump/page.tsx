import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Brain Dump | LOAH',
  description: 'Unload your messy, raw thoughts and convert them to tasks, notes, or projects later.',
};

const BrainDumpModule = dynamic(
  () => import('../../../components/modules/BrainDumpModule'),
  {
    ssr: false,
  }
);

export default function BrainDumpPage() {
  return <BrainDumpModule />;
}
