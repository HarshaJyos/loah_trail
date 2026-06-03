import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activity Feed | LOAH',
  description: 'View your complete timeline of tasks, habits, and journals.',
};

const ActivityModule = dynamic(
  () => import('../../../components/modules/ActivityModule').then(m => m.ActivityModule),
  {
    ssr: false,
  }
);

export default function ActivityPage() {
  return <ActivityModule />;
}
