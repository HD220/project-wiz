import { useCallback } from "react";

import { useProjectsQuery } from "./use-projects-query.hook";

import type { ProjectFilterDto } from "../../../../shared/types/domains/projects/project.types";

export function useProjectsRefetch(filter?: ProjectFilterDto) {
  const projectsQuery = useProjectsQuery(filter);

  const refreshProjects = useCallback(
    () => projectsQuery.refetch(),
    [projectsQuery],
  );

  return { refreshProjects };
}
