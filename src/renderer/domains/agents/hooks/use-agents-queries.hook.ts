import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentService } from "../services/agent.service";
import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

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

export function useCreateAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AgentDto>) => agentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useUpdateAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AgentDto> }) =>
      agentService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent", variables.id] });
    },
  });
}

export function useDeleteAgentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => agentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
