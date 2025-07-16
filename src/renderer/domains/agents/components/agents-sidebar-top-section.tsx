import { AgentsSidebarHeader } from "./agents-sidebar-header";
import { AgentsSidebarSearch } from "./agents-sidebar-search";
import { AgentsSidebarStats } from "./agents-sidebar-stats";

import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentsSidebarTopSectionProps {
  projectId?: string;
  agents: {
    activeAgents: AgentDto[];
    filteredAgents: AgentDto[];
  };
  search: {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
  };
  onAddClick: () => void;
}

export function AgentsSidebarTopSection({
  projectId,
  agents,
  search,
  onAddClick,
}: AgentsSidebarTopSectionProps) {
  return (
    <>
      <AgentsSidebarHeader projectId={projectId} onAddClick={onAddClick} />
      <AgentsSidebarStats
        totalAgents={agents.activeAgents.length}
        filteredAgents={agents.filteredAgents.length}
      />
      <AgentsSidebarSearch
        searchQuery={search.searchQuery}
        onSearchChange={search.setSearchQuery}
      />
    </>
  );
}
