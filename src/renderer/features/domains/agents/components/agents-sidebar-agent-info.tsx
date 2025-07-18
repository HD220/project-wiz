import type { AgentDto } from "../../../../shared/types/agents/agent.types";

interface AgentsSidebarAgentInfoProps {
  agent: AgentDto;
}

export function AgentsSidebarAgentInfo({ agent }: AgentsSidebarAgentInfoProps) {
  return (
    <div className="min-w-0 overflow-hidden">
      <div className="text-xs font-medium truncate leading-3">{agent.name}</div>
      <div className="text-xs text-muted-foreground truncate leading-3 mt-0.5">
        {agent.role}
      </div>
    </div>
  );
}
