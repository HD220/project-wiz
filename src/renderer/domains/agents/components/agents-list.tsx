import { AgentItem } from "./agent-item";
import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentsListProps {
  agents: AgentDto[];
  title: string;
  onAgentSelect: (agentId: string) => void;
}

export function AgentsList({ agents, title, onAgentSelect }: AgentsListProps) {
  if (agents.length === 0) return null;

  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {title} — {agents.length}
      </h4>
      <div className="space-y-2">
        {agents.map((agent) => (
          <AgentItem
            key={agent.id}
            agent={agent}
            onAgentClick={onAgentSelect}
          />
        ))}
      </div>
    </div>
  );
}
