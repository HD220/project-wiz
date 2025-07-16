import { useProjectQuery } from "./use-project-query.hook";
import { useProjectsMutations } from "./use-projects-mutations.hook";
import { useProjectsQuery } from "./use-projects-query.hook";
import { useProjectsRefetch } from "./use-projects-refetch.hook";
import { useProjectsState } from "./use-projects-state.hook";

import type { ProjectFilterDto } from "../../../../shared/types/domains/projects/project.types";

export function useProjects(filter?: ProjectFilterDto) {
  const projectsQuery = useProjectsQuery(filter);
  const state = useProjectsState();
  const mutations = useProjectsMutations();
  const { refreshProjects } = useProjectsRefetch(filter);

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error?.message || null,
    selectedProject: state.selectedProject,
    createProject: mutations.createProject,
    updateProject: mutations.updateProject,
    deleteProject: mutations.deleteProject,
    archiveProject: mutations.archiveProject,
    setSelectedProject: state.setSelectedProject,
    refreshProjects,
  };
}

export function useProject(id: string) {
  const projectQuery = useProjectQuery(id);

  return {
    project: projectQuery.data || null,
    isLoading: projectQuery.isLoading,
    error: projectQuery.error?.message || null,
  };
}
