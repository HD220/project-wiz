// Project hook - Custom React hook for project operations
// TODO: This hook needs to be refactored to use TanStack Query properly
// For now, keeping simple interface to avoid breaking changes

import { useParams } from "@tanstack/react-router";

import { useProjectStore } from "./project.store";

export function useProject() {
  const store = useProjectStore();
  const params = useParams({ strict: false }) as { projectId?: string };

  return {
    // Current state from store
    projects: store.projects,
    selectedProject: store.selectedProject,
    isLoading: store.isLoading,
    error: store.error,

    // Computed values
    activeProjects: store.getActiveProjects(),
    archivedProjects: store.getArchivedProjects(),

    // Current project from route params
    currentProject: store.selectedProject,
    currentProjectId: params.projectId,

    // Convenience methods
    isCurrentProject: (projectId: string) => params.projectId === projectId,

    // Project statistics
    projectStats: {
      total: store.projects.length,
      active: store.getActiveProjects().length,
      archived: store.getArchivedProjects().length,
    },

    // Actions
    loadProjects: store.loadProjects,
    getProject: store.getProject,
  };
}
