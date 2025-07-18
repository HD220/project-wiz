import { create } from "zustand";
import type {
  Project,
  CreateProjectInput,
  Agent,
} from "../../shared/types/common";
import { ApiClient } from "../utils/api-client";

interface ProjectState {
  // State
  projects: Project[];
  currentProject: Project | null;
  projectAgents: Agent[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUserProjects: (userId: string) => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (
    projectId: string,
    input: Partial<CreateProjectInput>,
    userId: string,
  ) => Promise<void>;
  archiveProject: (projectId: string, userId: string) => Promise<void>;
  deleteProject: (projectId: string, userId: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  loadCurrentProject: (projectId: string) => Promise<void>;
  loadProjectAgents: (projectId: string) => Promise<void>;
  addAgentToProject: (
    projectId: string,
    agentId: string,
    role: string,
    userId: string,
  ) => Promise<void>;
  removeAgentFromProject: (
    projectId: string,
    agentId: string,
    userId: string,
  ) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  currentProject: null,
  projectAgents: [],
  isLoading: false,
  error: null,

  // Actions
  loadUserProjects: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const projects = await ApiClient.findUserProjects(userId);
      set({ projects, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to load projects",
      });
    }
  },

  createProject: async (input: CreateProjectInput): Promise<Project> => {
    set({ isLoading: true, error: null });

    try {
      const newProject = await ApiClient.createProject(input);

      set((state) => ({
        projects: [newProject, ...state.projects],
        isLoading: false,
      }));

      return newProject;
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to create project",
      });
      throw error;
    }
  },

  updateProject: async (
    projectId: string,
    input: Partial<CreateProjectInput>,
    userId: string,
  ) => {
    set({ isLoading: true, error: null });

    try {
      const updatedProject = await ApiClient.updateProject({
        projectId,
        input,
        userId,
      });

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? updatedProject : p,
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to update project",
      });
      throw error;
    }
  },

  archiveProject: async (projectId: string, userId: string) => {
    set({ isLoading: true, error: null });

    try {
      await ApiClient.archiveProject({ projectId, userId });

      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject:
          state.currentProject?.id === projectId ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to archive project",
      });
      throw error;
    }
  },

  deleteProject: async (projectId: string, userId: string) => {
    set({ isLoading: true, error: null });

    try {
      await ApiClient.deleteProject({ projectId, userId });

      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject:
          state.currentProject?.id === projectId ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      });
      throw error;
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },

  loadCurrentProject: async (projectId: string) => {
    set({ isLoading: true, error: null });

    try {
      const project = await ApiClient.findProjectById(projectId);

      if (project) {
        set({ currentProject: project, isLoading: false });
      } else {
        set({
          currentProject: null,
          isLoading: false,
          error: "Project not found",
        });
      }
    } catch (error) {
      set({
        currentProject: null,
        isLoading: false,
        error:
          error instanceof Error ? error.message : "Failed to load project",
      });
    }
  },

  loadProjectAgents: async (projectId: string) => {
    try {
      const agents = await ApiClient.findProjectAgents(projectId);
      set({ projectAgents: agents });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load project agents",
      });
    }
  },

  addAgentToProject: async (
    projectId: string,
    agentId: string,
    role: string,
    userId: string,
  ) => {
    set({ isLoading: true, error: null });

    try {
      await window.electronAPI.addAgentToProject({
        projectId,
        agentId,
        role,
        userId,
      });

      // Reload project agents
      await get().loadProjectAgents(projectId);

      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to add agent to project",
      });
      throw error;
    }
  },

  removeAgentFromProject: async (
    projectId: string,
    agentId: string,
    userId: string,
  ) => {
    set({ isLoading: true, error: null });

    try {
      await window.electronAPI.removeAgentFromProject({
        projectId,
        agentId,
        userId,
      });

      // Reload project agents
      await get().loadProjectAgents(projectId);

      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove agent from project",
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
