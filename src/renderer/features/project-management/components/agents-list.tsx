import { Agent } from "@/lib/placeholders";
import { AgentItem } from "./agent-item";

interface AgentsListProps {
  agents: Agent[];
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
