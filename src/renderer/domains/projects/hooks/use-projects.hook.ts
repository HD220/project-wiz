import { useCallback } from "react";
import { useProjectStore } from "../stores/project.store";
import {
  useProjectsQuery,
  useProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useArchiveProjectMutation,
} from "./use-projects-queries.hook";
import type {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterDto,
} from "../../../../shared/types/domains/projects/project.types";

export function useProjects(filter?: ProjectFilterDto) {
  const selectedProject = useProjectStore(
    (state: any) => state.selectedProject,
  );
  const setSelectedProject = useProjectStore(
    (state: any) => state.setSelectedProject,
  );

  const projectsQuery = useProjectsQuery(filter);
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();
  const archiveMutation = useArchiveProjectMutation();

  const createProject = useCallback(
    (data: CreateProjectDto) => createMutation.mutateAsync(data),
    [createMutation],
  );

  const updateProject = useCallback(
    (data: UpdateProjectDto) => updateMutation.mutateAsync(data),
    [updateMutation],
  );

  const deleteProject = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  );

  const archiveProject = useCallback(
    (id: string) => archiveMutation.mutateAsync(id),
    [archiveMutation],
  );

  const refreshProjects = useCallback(
    () => projectsQuery.refetch(),
    [projectsQuery],
  );

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error?.message || null,
    selectedProject,

    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    setSelectedProject,
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
