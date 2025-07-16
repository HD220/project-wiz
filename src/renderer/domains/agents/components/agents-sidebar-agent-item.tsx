import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

        <div className="min-w-0 overflow-hidden">
          <div className="text-xs font-medium truncate leading-3">
            {agent.name}
          </div>
          <div className="text-xs text-muted-foreground truncate leading-3 mt-0.5">
            {agent.role}
          </div>
        </div>

        <div className="w-4 flex justify-center">
          {projectId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveAgent(agent.id);
              }}
              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-2.5 w-2.5 text-red-500" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
