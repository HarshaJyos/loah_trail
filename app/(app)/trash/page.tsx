import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trash & Data | LOAH',
  description: 'Restore deleted tasks, routines, notes, projects, habits, logs, and dumps, or manage app backups.',
};

const RestoreModule = dynamic(
  () => import('../../../components/modules/RestoreModule'),
  {
    ssr: false,
  }
);

export default function TrashPage() {
  return <RestoreModule />;
}
