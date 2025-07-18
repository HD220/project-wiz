import { Users, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface AgentsSidebarHeaderProps {
  projectId?: string;
  onAddClick: () => void;
}

export function AgentsSidebarHeader({
  projectId,
  onAddClick,
}: AgentsSidebarHeaderProps) {
  return (
    <div className="h-12 px-3 flex items-center justify-between border-b border-border shadow-sm flex-none">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold text-foreground truncate">Agentes</h2>
      </div>
      {projectId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddClick}
          className="h-8 w-8 p-0"
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
