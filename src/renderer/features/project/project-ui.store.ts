import { create } from "zustand";

import type {
  SelectProject,
  ProjectFilters,
} from "@/main/features/project/project.types";

interface ProjectUIState {
  // Pure UI state only - no server state
  selectedProject: SelectProject | null;
  filters: ProjectFilters;

  // UI actions only
  setSelectedProject: (project: SelectProject | null) => void;
  setFilters: (filters: Partial<ProjectFilters>) => void;
  clearFilters: () => void;
}

export const useProjectUIStore = create<ProjectUIState>((set) => ({
  // Initial UI state
  selectedProject: null,
  filters: {},

  // Set selected project (UI state)
  setSelectedProject: (project: SelectProject | null) => {
    set({ selectedProject: project });
  },

  // Set filters (UI state)
  setFilters: (filters: Partial<ProjectFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  // Clear all filters
  clearFilters: () => {
    set({ filters: {} });
  },
}));
