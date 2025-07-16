import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar/avatar-core";
import { cn, getAgentStatusColor } from "../../../lib/utils";

import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentItemAvatarProps {
  agent: AgentDto;
}

export function AgentItemAvatar({ agent }: AgentItemAvatarProps) {
  return (
    <div className="relative flex-shrink-0">
      <Avatar className="w-8 h-8">
        <AvatarImage src={agent.avatar} />
        <AvatarFallback className="text-xs">
          {agent.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-card rounded-full",
          getAgentStatusColor(agent.status),
        )}
      />
    </div>
  );
}
