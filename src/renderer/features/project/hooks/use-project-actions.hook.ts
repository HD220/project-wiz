import { useNavigate } from "@tanstack/react-router";

import type { SelectProject } from "@/main/features/project/project.types";
import { useApiMutation } from "@/renderer/hooks/use-api-mutation.hook";

export function useProjectActions() {
  const navigate = useNavigate();

  const archiveProjectMutation = useApiMutation(
    (projectId: string) => window.api.projects.archive(projectId),
    {
      successMessage: "Project archived successfully",
      errorMessage: "Failed to archive project",
      invalidateRouter: true,
    },
  );

  const handleArchive = (project: SelectProject) => {
    archiveProjectMutation.mutate(project.id);
  };

  const handleEdit = (project: SelectProject) => {
    navigate({
      to: "/project/$projectId/edit",
      params: { projectId: project.id },
    });
  };

  return {
    handleArchive,
    handleEdit,
    isArchiving: archiveProjectMutation.isPending,
  };
}
