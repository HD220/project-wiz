import { create } from "zustand";

import type {
  SelectProject,
  InsertProject,
  UpdateProject,
  ProjectFilters,
} from "@/main/features/project/project.types";

import { projectApi } from "./project.api";

interface ProjectState {
  // State
  projects: SelectProject[];
  selectedProject: SelectProject | null;
  filters: ProjectFilters;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadProjects: () => Promise<void>;
  getProject: (id: string) => Promise<void>;
  createProject: (input: InsertProject) => Promise<SelectProject>;
  updateProject: (input: UpdateProject) => Promise<SelectProject>;
  archiveProject: (id: string) => Promise<void>;
  setSelectedProject: (project: SelectProject | null) => void;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  clearError: () => void;

  // Computed selectors
  getFilteredProjects: () => SelectProject[];
  getActiveProjects: () => SelectProject[];
  getArchivedProjects: () => SelectProject[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // Initial state
  projects: [],
  selectedProject: null,
  filters: {},
  isLoading: false,
  error: null,

  // Load all projects
  loadProjects: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await projectApi.listAll();

      if (response.success && response.data) {
        set({
          projects: response.data as SelectProject[],
          isLoading: false,
        });
      } else {
        throw new Error(response.error || "Failed to load projects");
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load projects",
      });
      throw error;
    }
  },

  // Get single project by ID
  getProject: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await projectApi.findById(id);

      if (response.success && response.data) {
        const project = response.data as SelectProject;
        
        // Update projects array if project exists
        set(state => ({
          projects: state.projects.map(p => p.id === id ? project : p),
          selectedProject: project,
          isLoading: false,
        }));
      } else {
        throw new Error(response.error || "Project not found");
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to get project",
      });
      throw error;
    }
  },

  // Create new project
  createProject: async (input: InsertProject) => {
    set({ isLoading: true, error: null });

    try {
      const response = await projectApi.create(input);

      if (response.success && response.data) {
        const newProject = response.data as SelectProject;
        
        set(state => ({
          projects: [...state.projects, newProject],
          isLoading: false,
        }));

        return newProject;
      } else {
        throw new Error(response.error || "Failed to create project");
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to create project",
      });
      throw error;
    }
  },

  // Update existing project
  updateProject: async (input: UpdateProject) => {
    set({ isLoading: true, error: null });

    try {
      const response = await projectApi.update(input);

      if (response.success && response.data) {
        const updatedProject = response.data as SelectProject;
        
        set(state => ({
          projects: state.projects.map(p => p.id === input.id ? updatedProject : p),
          selectedProject: state.selectedProject?.id === input.id ? updatedProject : state.selectedProject,
          isLoading: false,
        }));

        return updatedProject;
      } else {
        throw new Error(response.error || "Failed to update project");
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to update project",
      });
      throw error;
    }
  },

  // Archive project
  archiveProject: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await projectApi.archive(id);

      if (response.success) {
        set(state => ({
          projects: state.projects.map(p => 
            p.id === id ? { ...p, status: "archived" } : p
          ),
          selectedProject: state.selectedProject?.id === id 
            ? { ...state.selectedProject, status: "archived" } 
            : state.selectedProject,
          isLoading: false,
        }));
      } else {
        throw new Error(response.error || "Failed to archive project");
      }
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to archive project",
      });
      throw error;
    }
  },

  // Set selected project
  setSelectedProject: (project: SelectProject | null) => {
    set({ selectedProject: project });
  },

  // Set filters
  setFilters: (filters: Partial<ProjectFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...filters }
    }));
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Get filtered projects based on current filters
  getFilteredProjects: () => {
    const { projects, filters } = get();
    
    return projects.filter(project => {
      if (filters.status && project.status !== filters.status) {
        return false;
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!project.name.toLowerCase().includes(searchLower) &&
            !project.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      if (filters.hasGitUrl !== undefined) {
        const hasGit = !!project.gitUrl;
        if (filters.hasGitUrl !== hasGit) {
          return false;
        }
      }
      
      if (filters.hasLocalPath !== undefined) {
        const hasLocal = !!project.localPath;
        if (filters.hasLocalPath !== hasLocal) {
          return false;
        }
      }
      
      return true;
    });
  },

  // Get only active projects
  getActiveProjects: () => {
    const { projects } = get();
    return projects.filter(project => project.status === "active");
  },

  // Get only archived projects
  getArchivedProjects: () => {
    const { projects } = get();
    return projects.filter(project => project.status === "archived");
  },
}));