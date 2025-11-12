import { create } from 'zustand';
import { api } from '@/lib/tauri-api';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from '@/lib/types';

type ProjectsState = {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
};

type ProjectsActions = {
  fetchProjects: (token: string) => Promise<void>;
  createProject: (input: CreateProjectInput, token: string) => Promise<Project>;
  updateProject: (input: UpdateProjectInput, token: string) => Promise<Project>;
  archiveProject: (id: string, token: string) => Promise<void>;
  unarchiveProject: (id: string, token: string) => Promise<void>;
  deleteProject: (id: string, token: string) => Promise<void>;
  clearError: () => void;
};

type ProjectsStore = ProjectsState & ProjectsActions;

export const useProjectsStore = create<ProjectsStore>((set) => ({
  // State
  projects: [],
  isLoading: false,
  error: null,

  // Actions
  fetchProjects: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const projects = await api.projects.list(token);
      set({ projects, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch projects',
        isLoading: false,
      });
      throw error;
    }
  },

  createProject: async (input: CreateProjectInput, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await api.projects.create(input, token);
      set((state) => ({
        projects: [...state.projects, project],
        isLoading: false,
      }));
      return project;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create project',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProject: async (input: UpdateProjectInput, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProject = await api.projects.update(input, token);
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === input.id ? updatedProject : project
        ),
        isLoading: false,
      }));
      return updatedProject;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update project',
        isLoading: false,
      });
      throw error;
    }
  },

  archiveProject: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.projects.archive(id, token);
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id
            ? { ...project, archived_at: Date.now() }
            : project
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to archive project',
        isLoading: false,
      });
      throw error;
    }
  },

  unarchiveProject: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.projects.unarchive(id, token);
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? { ...project, archived_at: null } : project
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to unarchive project',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProject: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.projects.delete(id, token);
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete project',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
