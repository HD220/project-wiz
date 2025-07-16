import { useQuery } from "@tanstack/react-query";

import { projectService } from "../services/project.service";

export function useProjectQuery(id: string) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => projectService.getById(id),
    enabled: !!id,
  });
}
