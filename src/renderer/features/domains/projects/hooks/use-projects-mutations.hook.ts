import { useCallback } from "react";

import { useArchiveProjectMutation } from "./use-archive-project-mutation.hook";
import { useCreateProjectMutation } from "./use-create-project-mutation.hook";
import { useDeleteProjectMutation } from "./use-delete-project-mutation.hook";
import { useUpdateProjectMutation } from "./use-update-project-mutation.hook";

import type {
  CreateProjectDto,
  UpdateProjectDto,
} from "../../../../shared/types/domains/projects/project.types";

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
