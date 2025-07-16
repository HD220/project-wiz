import { useCallback } from "react";

import {
  useAgentsQuery,
  useActiveAgentsQuery,
} from "./use-agents-queries.hook";

export function useAgentsRefetch() {
  const agentsQuery = useAgentsQuery();
  const activeAgentsQuery = useActiveAgentsQuery();

  const refetch = useCallback(() => {
    agentsQuery.refetch();
    activeAgentsQuery.refetch();
  }, [agentsQuery, activeAgentsQuery]);

  return { refetch };
}
