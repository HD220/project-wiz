import { useMutation, useQueryClient } from "@tanstack/react-query";

import { projectService } from "../services/project.service";

import type { UpdateProjectDto } from "../../../../shared/types/domains/projects/project.types";

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectDto) => projectService.update(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] });
    },
  });
}
