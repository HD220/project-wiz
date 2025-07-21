// Project hook - Custom React hook for project operations

import { useEffect } from "react";
import { useParams } from "@tanstack/react-router";

import { useProjectStore } from "./project.store";

export function useProject() {
  const store = useProjectStore();
  const params = useParams({ strict: false }) as { projectId?: string };

  // Load projects on mount if not already loaded
  useEffect(() => {
    if (store.projects.length === 0 && !store.isLoading) {
      store.loadProjects();
    }
  }, []);

  // Load specific project if projectId is in route params
  useEffect(() => {
    if (params.projectId && params.projectId !== store.selectedProject?.id) {
      store.getProject(params.projectId);
    }
  }, [params.projectId]);

  return {
    // Current state
    projects: store.projects,
    selectedProject: store.selectedProject,
    filters: store.filters,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    loadProjects: store.loadProjects,
    getProject: store.getProject,
    createProject: store.createProject,
    updateProject: store.updateProject,
    archiveProject: store.archiveProject,
    setSelectedProject: store.setSelectedProject,
    setFilters: store.setFilters,
    clearError: store.clearError,

    // Computed values
    filteredProjects: store.getFilteredProjects(),
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
  };
}

// Hook specifically for project selection/navigation
export function useProjectSelection() {
  const { setSelectedProject, selectedProject, projects } = useProjectStore();

  const selectProject = (projectId: string | null) => {
    if (!projectId) {
      setSelectedProject(null);
      return;
    }

    const project = projects.find(p => p.id === projectId);
    if (project) {
      setSelectedProject(project);
    }
  };

  return {
    selectedProject,
    selectProject,
    clearSelection: () => setSelectedProject(null),
  };
}

// Hook for project filters
export function useProjectFilters() {
  const { filters, setFilters, getFilteredProjects } = useProjectStore();

  return {
    filters,
    setFilters,
    filteredProjects: getFilteredProjects(),
    
    // Convenience filter methods
    filterByStatus: (status: "active" | "archived" | undefined) => 
      setFilters({ status }),
    
    filterBySearch: (search: string) => 
      setFilters({ search: search.trim() || undefined }),
    
    clearFilters: () => setFilters({}),
  };
}