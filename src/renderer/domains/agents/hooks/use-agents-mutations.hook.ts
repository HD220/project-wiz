import { useCallback } from "react";
import {
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
} from "./use-agents-queries.hook";
import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

export function useAgentsMutations() {
  const createMutation = useCreateAgentMutation();
  const updateMutation = useUpdateAgentMutation();
  const deleteMutation = useDeleteAgentMutation();

  const createAgent = useCallback(
    (data: Partial<AgentDto>) => createMutation.mutateAsync(data),
    [createMutation],
  );

  const updateAgent = useCallback(
    (id: string, data: Partial<AgentDto>) =>
      updateMutation.mutateAsync({ id, data }),
    [updateMutation],
  );

  const deleteAgent = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  );

  return {
    createAgent,
    updateAgent,
    deleteAgent,
  };
}