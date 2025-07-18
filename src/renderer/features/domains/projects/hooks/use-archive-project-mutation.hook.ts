import { useMutation, useQueryClient } from "@tanstack/react-query";

import { projectService } from "../services/project.service";

export function useArchiveProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
