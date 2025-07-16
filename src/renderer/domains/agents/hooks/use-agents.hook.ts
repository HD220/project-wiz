import { useAgentsMutations } from "./use-agents-mutations.hook";
import {
  useAgentsQuery,
  useActiveAgentsQuery,
  useAgentQuery,
  useAgentByNameQuery,
} from "./use-agents-queries.hook";
import { useAgentsRefetch } from "./use-agents-refetch.hook";
import { useAgentsState } from "./use-agents-state.hook";

export function useAgents() {
  const agentsQuery = useAgentsQuery();
  const activeAgentsQuery = useActiveAgentsQuery();
  const mutations = useAgentsMutations();
  const state = useAgentsState();
  const { refetch } = useAgentsRefetch();

  return {
    agents: agentsQuery.data || [],
    activeAgents: activeAgentsQuery.data || [],
    isLoading: agentsQuery.isLoading || activeAgentsQuery.isLoading,
    error:
      agentsQuery.error?.message || activeAgentsQuery.error?.message || null,
    selectedAgent: state.selectedAgent,
    createAgent: mutations.createAgent,
    updateAgent: mutations.updateAgent,
    deleteAgent: mutations.deleteAgent,
    setSelectedAgent: state.setSelectedAgent,
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
