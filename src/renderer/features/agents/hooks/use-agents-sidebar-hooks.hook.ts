import { useAgentsFilter } from "./use-agents-filter.hook";
import { useAgentsSidebarActions } from "./use-agents-sidebar-actions.hook";
import { useAgentsSidebarState } from "./use-agents-sidebar-state.hook";
import { useAgents } from "./use-agents.hook";

import type { AgentDto } from "../../../../shared/types/agents/agent.types";

interface UseAgentsSidebarHooksProps {
  onAgentSelect?: (agent: AgentDto) => void;
}

export function useAgentsSidebarHooks({
  onAgentSelect,
}: UseAgentsSidebarHooksProps) {
  const { activeAgents, isLoading, error, deleteAgent } = useAgents();
  const { searchQuery, setSearchQuery, isAddModalOpen, setIsAddModalOpen } =
    useAgentsSidebarState();
  const { filteredAgents } = useAgentsFilter({
    agents: activeAgents,
    searchQuery,
  });
  const { handleRemoveAgent, handleAgentAdded } = useAgentsSidebarActions({
    deleteAgent,
    onAgentSelect,
  });

  return {
    agents: {
      activeAgents,
      filteredAgents,
      isLoading,
      error,
    },
    search: {
      searchQuery,
      setSearchQuery,
    },
    modal: {
      isAddModalOpen,
      setIsAddModalOpen,
    },
    actions: {
      handleRemoveAgent,
      handleAgentAdded,
    },
  };
}
