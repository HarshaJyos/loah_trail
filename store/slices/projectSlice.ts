import { StateCreator } from 'zustand';
import { Project } from '../../types';
import { AppStoreState } from '../useAppStore';

export interface ProjectSlice {
  projects: Project[];
  setProjects: (
    projects: Project[] | ((prev: Project[]) => Project[])
  ) => void;
  handleAddProject: (project: Project) => void;
  handleUpdateProject: (project: Project) => void;
  handleDeleteProject: (id: string) => void;
  handleReorderProjects: (newOrder: Project[]) => void;
}

export const createProjectSlice: StateCreator<
  AppStoreState,
  [],
  [],
  ProjectSlice
> = (set, get) => ({
  projects: [],
  setProjects: (updater) => {
    set((state) => ({
      projects: typeof updater === 'function' ? updater(state.projects) : updater,
    }));
  },
  handleAddProject: (project) => {
    set((state) => ({
      projects: [project, ...state.projects],
    }));
  },
  handleUpdateProject: (project) => {
    set((state) => ({
      projects: state.projects.map((p) => (p.id === project.id ? project : p)),
    }));
  },
  handleDeleteProject: (id) => {
    get().handleSoftDelete(id, 'project');
  },
  handleReorderProjects: (newOrder) => {
    set({ projects: newOrder });
  },
});
