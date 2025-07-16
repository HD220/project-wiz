import { useQuery } from "@tanstack/react-query";

import { agentService } from "../services/agent.service";

export function useAgentsQuery() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => agentService.list(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useActiveAgentsQuery() {
  return useQuery({
    queryKey: ["agents", "active"],
    queryFn: () => agentService.listActive(),
    staleTime: 30 * 1000,
  });
}

export function useAgentQuery(id: string) {
  return useQuery({
    queryKey: ["agent", id],
    queryFn: () => agentService.getById(id),
    enabled: !!id,
  });
}

export function useAgentByNameQuery(name: string) {
  return useQuery({
    queryKey: ["agent", "name", name],
    queryFn: () => agentService.getByName(name),
    enabled: !!name,
  });
}
