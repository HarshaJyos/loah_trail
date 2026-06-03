import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | LOAH',
  description: 'Review your life flow dashboard, moods trends, and focus statistics.',
};

const DashboardModule = dynamic(
  () => import('../../../components/modules/DashboardModule'),
  {
    ssr: false,
  }
);

export default function DashboardPage() {
  return <DashboardModule />;
}
