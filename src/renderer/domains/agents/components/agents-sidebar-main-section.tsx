import { AgentsSidebarError } from "./agents-sidebar-error";
import { AgentsSidebarList } from "./agents-sidebar-list";
import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentsSidebarMainSectionProps {
  projectId?: string;
  agents: {
    filteredAgents: AgentDto[];
    isLoading: boolean;
    error: string | null;
  };
  searchQuery: string;
  onRemoveAgent: (agentId: string) => void;
  onAddAgent: () => void;
  onAgentSelect?: (agent: AgentDto) => void;
}

export function AgentsSidebarMainSection({
  projectId,
  agents,
  searchQuery,
  onRemoveAgent,
  onAddAgent,
  onAgentSelect,
}: AgentsSidebarMainSectionProps) {
  return (
    <>
      {agents.error && (
        <AgentsSidebarError
          error={agents.error}
          onClearError={() => {
            /* clearError functionality to be implemented */
          }}
        />
      )}
      
      <AgentsSidebarList
        agents={agents.filteredAgents}
        isLoading={agents.isLoading}
        searchQuery={searchQuery}
        projectId={projectId}
        onRemoveAgent={onRemoveAgent}
        onAddAgent={onAddAgent}
        onAgentSelect={onAgentSelect}
      />
    </>
  );
}