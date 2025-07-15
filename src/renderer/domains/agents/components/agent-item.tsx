import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { cn, getAgentStatusColor } from "../../../lib/utils";
import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentItemProps {
  agent: AgentDto;
  onAgentClick: (agentId: string) => void;
}

export function AgentItem({ agent, onAgentClick }: AgentItemProps) {
  const isOffline = agent.status === "offline";

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer",
        isOffline && "opacity-60",
      )}
      onClick={() => onAgentClick(agent.id)}
    >
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium truncate">{agent.name}</span>
          {agent.isExecuting && (
            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
          )}
        </div>
        {agent.currentTask && !isOffline && (
          <div className="text-xs text-muted-foreground truncate">
            {agent.currentTask}
          </div>
        )}
      </div>
    </div>
  );
}