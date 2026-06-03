import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects | LOAH',
  description: 'Manage long term goals, project checklists, and project specific notes.',
};

const ProjectModule = dynamic(
  () => import('../../../components/modules/ProjectModule'),
  {
    ssr: false,
  }
);

export default function ProjectsPage() {
  return <ProjectModule />;
}
