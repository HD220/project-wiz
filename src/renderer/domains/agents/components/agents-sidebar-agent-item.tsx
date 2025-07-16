import { AgentsSidebarAgentActions } from "./agents-sidebar-agent-actions";
import { AgentsSidebarAgentAvatar } from "./agents-sidebar-agent-avatar";
import { AgentsSidebarAgentInfo } from "./agents-sidebar-agent-info";

import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentItemProps {
  agent: AgentDto;
  projectId?: string;
  onRemoveAgent: (agentId: string) => void;
  onAgentSelect?: (agent: AgentDto) => void;
}

export function AgentsSidebarAgentItem({
  agent,
  projectId,
  onRemoveAgent,
  onAgentSelect,
}: AgentItemProps) {
  return (
    <div
      key={agent.id}
      className="group relative px-1.5 py-1 rounded-md hover:bg-accent/50 transition-colors"
    >
      <div className="grid grid-cols-[auto_1fr_auto] gap-1.5 items-center w-full">
        <AgentsSidebarAgentAvatar agent={agent} />
        <AgentsSidebarAgentInfo agent={agent} />
        <AgentsSidebarAgentActions
          agentId={agent.id}
          projectId={projectId}
          onRemoveAgent={onRemoveAgent}
        />
      </div>
    </div>
  );
}
