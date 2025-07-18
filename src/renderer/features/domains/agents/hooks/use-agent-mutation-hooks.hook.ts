import { useMutation, useQueryClient } from "@tanstack/react-query";

import { agentService } from "../services/agent.service";

import type { AgentDto } from "../../../../shared/types/agents/agent.types";

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
