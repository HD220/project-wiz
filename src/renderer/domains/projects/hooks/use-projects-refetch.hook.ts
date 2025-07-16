import { useCallback } from "react";

import type { ProjectFilterDto } from "../../../../shared/types/domains/projects/project.types";

import { useProjectsQuery } from "@/domains/projects/hooks/use-projects-queries.hook";

export function useProjectsRefetch(filter?: ProjectFilterDto) {
  const projectsQuery = useProjectsQuery(filter);

  const refreshProjects = useCallback(
    () => projectsQuery.refetch(),
    [projectsQuery],
  );

  return { refreshProjects };
}
