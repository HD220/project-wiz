import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback } from "../../../components/ui/avatar";

import type { AgentDto } from "../../../../shared/types/agents/agent.types";

interface AgentsSidebarAgentAvatarProps {
  agent: AgentDto;
}

export function AgentsSidebarAgentAvatar({
  agent,
}: AgentsSidebarAgentAvatarProps) {
  return (
    <div className="relative">
      <Avatar className="w-5 h-5">
        <AvatarFallback className="text-xs">
          {agent.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 border border-card rounded-full",
          agent.isActive ? "bg-green-500" : "bg-gray-500",
        )}
      />
    </div>
  );
}
