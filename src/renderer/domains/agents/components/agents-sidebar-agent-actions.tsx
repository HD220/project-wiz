import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AgentsSidebarAgentActionsProps {
  agentId: string;
  projectId?: string;
  onRemoveAgent: (agentId: string) => void;
}

export function AgentsSidebarAgentActions({
  agentId,
  projectId,
  onRemoveAgent,
}: AgentsSidebarAgentActionsProps) {
  return (
    <div className="w-4 flex justify-center">
      {projectId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveAgent(agentId);
          }}
          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-2.5 w-2.5 text-red-500" />
        </Button>
      )}
    </div>
  );
}
