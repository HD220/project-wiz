import { useCallback } from "react";

import type {
  CreateProjectDto,
  UpdateProjectDto,
} from "../../../../shared/types/domains/projects/project.types";

import { useProjectsQueries } from "@/domains/projects/hooks/use-projects-queries.hook";

export function useProjectsMutations() {
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

  return {
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
  };
}
