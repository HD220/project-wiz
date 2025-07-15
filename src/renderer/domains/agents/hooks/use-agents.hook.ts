import { useCallback } from 'react';
import { useAgentStore } from '../stores/agent.store';
import {
  useAgentsQuery,
  useActiveAgentsQuery,
  useAgentQuery,
  useAgentByNameQuery,
  useCreateAgentMutation,
  useUpdateAgentMutation,
  useDeleteAgentMutation,
} from './use-agents-queries.hook';
import type { AgentDto } from '../../../../shared/types/domains/agents/agent.types';

export function useAgents() {
  const selectedAgent = useAgentStore((state: any) => state.selectedAgent);
  const setSelectedAgent = useAgentStore((state: any) => state.setSelectedAgent);

  const agentsQuery = useAgentsQuery();
  const activeAgentsQuery = useActiveAgentsQuery();
  const createMutation = useCreateAgentMutation();
  const updateMutation = useUpdateAgentMutation();
  const deleteMutation = useDeleteAgentMutation();

  const createAgent = useCallback(
    (data: Partial<AgentDto>) => createMutation.mutateAsync(data),
    [createMutation]
  );

  const updateAgent = useCallback(
    (id: string, data: Partial<AgentDto>) => updateMutation.mutateAsync({ id, data }),
    [updateMutation]
  );

  const deleteAgent = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(() => {
    agentsQuery.refetch();
    activeAgentsQuery.refetch();
  }, [agentsQuery, activeAgentsQuery]);

  return {
    agents: agentsQuery.data || [],
    activeAgents: activeAgentsQuery.data || [],
    isLoading: agentsQuery.isLoading || activeAgentsQuery.isLoading,
    error: agentsQuery.error?.message || activeAgentsQuery.error?.message || null,
    selectedAgent,

    createAgent,
    updateAgent,
    deleteAgent,
    setSelectedAgent,
    refetch,
  };
}

export function useAgent(id: string) {
  const agentQuery = useAgentQuery(id);

  return {
    agent: agentQuery.data || null,
    isLoading: agentQuery.isLoading,
    error: agentQuery.error?.message || null,
  };
}

export function useAgentByName(name: string) {
  const agentQuery = useAgentByNameQuery(name);

  return {
    agent: agentQuery.data || null,
    isLoading: agentQuery.isLoading,
    error: agentQuery.error?.message || null,
  };
}