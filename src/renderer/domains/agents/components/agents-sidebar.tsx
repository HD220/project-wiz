import { AgentsSidebarContent } from "./agents-sidebar-content";
import { useAgentsSidebarHooks } from "./agents-sidebar-hooks";

import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentsSidebarProps {
  isOpen: boolean;
  onAgentSelect?: (agent: AgentDto) => void;
  projectId?: string;
}

export function AgentsSidebar({
  _isOpen,
  onAgentSelect,
  projectId,
}: AgentsSidebarProps) {
  const hooks = useAgentsSidebarHooks({ onAgentSelect });

  return (
    <div className="w-full bg-card border-l border-border flex flex-col h-full min-w-0 overflow-hidden">
      <AgentsSidebarContent
        projectId={projectId}
        agents={hooks.agents}
        search={hooks.search}
        modal={hooks.modal}
        actions={hooks.actions}
        onAgentSelect={onAgentSelect}
      />
    </div>
  );
}
