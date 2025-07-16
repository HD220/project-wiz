import { useQuery } from "@tanstack/react-query";

import { projectService } from "../services/project.service";

import type { ProjectFilterDto } from "../../../../shared/types/domains/projects/project.types";

export function useProjectsQuery(filter?: ProjectFilterDto) {
  return useQuery({
    queryKey: ["projects", filter],
    queryFn: () => projectService.list(filter),
    staleTime: 5 * 60 * 1000,
  });
}
