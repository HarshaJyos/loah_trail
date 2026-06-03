import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activity History | LOAH',
  description: 'Track and audit completed tasks, routine player focus sessions, and logged moods.',
};

const ActivityModule = dynamic(
  () => import('../../../components/modules/ActivityModule'),
  {
    ssr: false,
  }
);

export default function ActivityPage() {
  return <ActivityModule />;
}
