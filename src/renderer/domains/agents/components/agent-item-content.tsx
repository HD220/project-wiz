import { Loader2 } from "lucide-react";

import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";

interface AgentItemContentProps {
  agent: AgentDto;
  isOffline: boolean;
}

export function AgentItemContent({ agent, isOffline }: AgentItemContentProps) {
  return (
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
  );
}
