import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Project | LOAH',
  description: 'Create a new project in your ADHD life organizer.',
};

const ProjectEditor = dynamic(
  () => import('../../../../components/editors/ProjectEditor'),
  {
    ssr: false,
  }
);

export default function NewProjectPage() {
  return <ProjectEditor />;
}
