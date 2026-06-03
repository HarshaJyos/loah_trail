import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar Scheduler | LOAH',
  description: 'Plan your repeatable flows, habit locks, and focus sessions on a dynamic hourly calendar.',
};

const CalendarModule = dynamic(
  () => import('../../../components/modules/CalendarModule'),
  {
    ssr: false,
  }
);

export default function CalendarPage() {
  return <CalendarModule />;
}
