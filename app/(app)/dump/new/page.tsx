import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Idea | LOAH',
  description: 'Capture a raw idea or thought.',
};

const DumpEditor = dynamic(
  () => import('../../../../components/editors/DumpEditor'),
  {
    ssr: false,
  }
);

export default function NewDumpPage() {
  return <DumpEditor />;
}
