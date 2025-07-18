import { useMutation, useQueryClient } from "@tanstack/react-query";

import { projectService } from "../services/project.service";

import type { CreateProjectDto } from "../../../../shared/types/projects/project.types";

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDto) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
