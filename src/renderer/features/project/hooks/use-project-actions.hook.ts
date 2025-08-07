import { useNavigate } from "@tanstack/react-router";

import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

import type { Project } from "@/shared/types";

export function useProjectActions() {
  const navigate = useNavigate();

  const archiveProjectMutation = useApiMutation(
    (projectId: string) => window.api.project.archive(projectId),
    {
      successMessage: "Project archived successfully",
      errorMessage: "Failed to archive project",
      invalidateRouter: true,
    },
  );

  const handleArchive = (project: Project) => {
    archiveProjectMutation.mutate(project.id);
  };

  const handleEdit = (project: Project) => {
    // TODO: Add edit route when available
    navigate({
      to: "/project/$projectId",
      params: { projectId: project.id },
    });
  };

  return {
    handleArchive,
    handleEdit,
    isArchiving: archiveProjectMutation.isPending,
  };
}
