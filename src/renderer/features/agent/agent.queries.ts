import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AgentAPI } from "@/renderer/features/agent/agent.api";
import type {
  SelectAgent,
  CreateAgentInput,
  AgentStatus,
} from "@/renderer/features/agent/agent.types";

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => AgentAPI.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAgent(id: string | undefined) {
  return useQuery({
    queryKey: ["agent", id],
    queryFn: () => AgentAPI.getById(id!),
    enabled: !!id,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAgentInput) => AgentAPI.create(input),
    onSuccess: (newAgent) => {
      queryClient.setQueryData(["agents"], (old: SelectAgent[] = []) => [
        newAgent,
        ...old,
      ]);
      queryClient.setQueryData(["agent", newAgent.id], newAgent);
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CreateAgentInput>;
    }) => AgentAPI.update(id, updates),
    onSuccess: (updatedAgent, variables) => {
      queryClient.setQueryData(["agents"], (old: SelectAgent[] = []) =>
        old.map((agent) => (agent.id === variables.id ? updatedAgent : agent)),
      );
      queryClient.setQueryData(["agent", variables.id], updatedAgent);
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AgentAPI.delete(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(["agents"], (old: SelectAgent[] = []) =>
        old.filter((agent) => agent.id !== deletedId),
      );
      queryClient.removeQueries({ queryKey: ["agent", deletedId] });
    },
  });
}

export function useUpdateAgentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AgentStatus }) =>
      AgentAPI.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["agents"], (old: SelectAgent[] = []) =>
        old.map((agent) =>
          agent.id === variables.id
            ? { ...agent, status: variables.status }
            : agent,
        ),
      );
      queryClient.setQueryData(["agent", variables.id], (old: SelectAgent) =>
        old ? { ...old, status: variables.status } : old,
      );
    },
  });
}
