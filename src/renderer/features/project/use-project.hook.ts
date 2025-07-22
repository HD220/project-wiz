import { useParams } from "@tanstack/react-router";

import { useProjectUIStore } from "@/renderer/features/project/project-ui.store";
import {
  useFilteredProjects,
  useProject as useProjectQuery,
  useProjects,
} from "@/renderer/features/project/project.queries";

export function useProject() {
  const uiStore = useProjectUIStore();
  const params = useParams({ strict: false }) as { projectId?: string };

  // TanStack Query for server state
  const {
    data: projects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();
  const {
    data: currentProjectData,
    isLoading: currentProjectLoading,
    error: currentProjectError,
  } = useProjectQuery(params.projectId);

  // Filtered projects using TanStack Query data
  const { filteredProjects, activeProjects, archivedProjects } =
    useFilteredProjects(uiStore.filters);

  return {
    // Server state from TanStack Query
    projects,
    isLoading: projectsLoading || currentProjectLoading,
    error: projectsError || currentProjectError,

    // UI state from Zustand
    selectedProject: uiStore.selectedProject,
    filters: uiStore.filters,

    // Computed values
    filteredProjects,
    activeProjects,
    archivedProjects,

    // Current project from route and query
    currentProject: currentProjectData || uiStore.selectedProject,
    currentProjectId: params.projectId,

    // Convenience methods
    isCurrentProject: (projectId: string) => params.projectId === projectId,

    // Project statistics
    projectStats: {
      total: projects.length,
      active: activeProjects.length,
      archived: archivedProjects.length,
    },

    // UI actions
    setSelectedProject: uiStore.setSelectedProject,
    setFilters: uiStore.setFilters,
    clearFilters: uiStore.clearFilters,
  };
}
