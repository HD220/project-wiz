import type { AgentDto } from "../../../../shared/types/agents/agent.types";

export interface AgentsSidebarContentProps {
  projectId?: string;
  agents: {
    activeAgents: AgentDto[];
    filteredAgents: AgentDto[];
    isLoading: boolean;
    error: string | null;
  };
  search: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  };
  modal: {
    isAddModalOpen: boolean;
    setIsAddModalOpen: (open: boolean) => void;
  };
  actions: {
    handleRemoveAgent: (agentId: string) => void;
    handleAgentAdded: (agent: AgentDto) => void;
  };
  onAgentSelect?: (agent: AgentDto) => void;
}
