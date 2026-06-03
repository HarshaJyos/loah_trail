'use client';

import * as React from 'react';
import ClientOnly from '../../components/layout/ClientOnly';
import AppShell from '../../components/layout/AppShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientOnly>
      <AppShell>
        {children}
      </AppShell>
    </ClientOnly>
  );
}
