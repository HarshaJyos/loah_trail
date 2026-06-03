import * as React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Project | LOAH',
  description: 'Modify details of an existing project.',
};

const ProjectEditor = dynamic(
  () => import('../../../../components/editors/ProjectEditor'),
  {
    ssr: false,
  }
);

export default function EditProjectPage() {
  return <ProjectEditor />;
}
