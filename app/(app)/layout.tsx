'use client';

import * as React from 'react';
import ClientOnly from '../../components/layout/ClientOnly';
import AppShell from '../../components/layout/AppShell';
import MiniPlayer from '../../components/layout/MiniPlayer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly>
      <AppShell miniPlayer={<MiniPlayer />}>
        {children}
      </AppShell>
    </ClientOnly>
  );
}
