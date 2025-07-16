import { cn } from "../../../lib/utils";

import { AgentItemAvatar } from "./agent-item-avatar";
import { AgentItemContent } from "./agent-item-content";

import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentItemProps {
  agent: AgentDto;
  onAgentClick: (agentId: string) => void;
}

export function AgentItem({ agent, onAgentClick }: AgentItemProps) {
  const isOffline = agent.status === "offline";

  return (
    <button
      type="button"
      className={cn(
        "flex items-start gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer",
        isOffline && "opacity-60",
      )}
      onClick={() => onAgentClick(agent.id)}
    >
      <AgentItemAvatar agent={agent} />
      <AgentItemContent agent={agent} isOffline={isOffline} />
    </button>
  );
}
