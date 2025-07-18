import { AgentsSidebarEmpty } from "./agents-sidebar-empty";
import { AgentsSidebarListRenderer } from "./agents-sidebar-list-renderer";
import { AgentsSidebarLoading } from "./agents-sidebar-loading";

import type { AgentDto } from "../../../../shared/types/agents/agent.types";

interface AgentsSidebarListProps {
  agents: AgentDto[];
  isLoading: boolean;
  searchQuery: string;
  projectId?: string;
  onRemoveAgent: (agentId: string) => void;
  onAddAgent: () => void;
  onAgentSelect?: (agent: AgentDto) => void;
}

export function AgentsSidebarList({
  agents,
  isLoading,
  searchQuery,
  projectId,
  onRemoveAgent,
  onAddAgent,
  onAgentSelect,
}: AgentsSidebarListProps) {
  if (isLoading) {
    return <AgentsSidebarLoading />;
  }

  if (agents.length === 0) {
    return (
      <AgentsSidebarEmpty
        searchQuery={searchQuery}
        projectId={projectId}
        onAddAgent={onAddAgent}
      />
    );
  }

  return (
    <AgentsSidebarListRenderer
      agents={agents}
      projectId={projectId}
      onRemoveAgent={onRemoveAgent}
      onAgentSelect={onAgentSelect}
    />
  );
}
