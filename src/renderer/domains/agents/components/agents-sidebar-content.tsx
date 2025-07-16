import { AddAgentModal } from "./add-agent-modal";
import { AgentsSidebarTopSection } from "./agents-sidebar-top-section";
import { AgentsSidebarMainSection } from "./agents-sidebar-main-section";
import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentsSidebarContentProps {
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

export function AgentsSidebarContent({
  projectId,
  agents,
  search,
  modal,
  actions,
  onAgentSelect,
}: AgentsSidebarContentProps) {
  return (
    <>
      <AgentsSidebarTopSection
        projectId={projectId}
        agents={agents}
        search={search}
        onAddClick={() => modal.setIsAddModalOpen(true)}
      />

      <AgentsSidebarMainSection
        projectId={projectId}
        agents={agents}
        searchQuery={search.searchQuery}
        onRemoveAgent={actions.handleRemoveAgent}
        onAddAgent={() => modal.setIsAddModalOpen(true)}
        onAgentSelect={onAgentSelect}
      />

      <AddAgentModal
        isOpen={modal.isAddModalOpen}
        onOpenChange={modal.setIsAddModalOpen}
        projectId={projectId}
        onAgentAdded={actions.handleAgentAdded}
      />
    </>
  );
}