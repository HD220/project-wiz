import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { KanbanGrid } from "./kanban-grid";

interface KanbanBoardProps {
  projectId?: string;
  className?: string;
}

export function KanbanBoard({ projectId, className }: KanbanBoardProps) {
  const handleCreateTask = (columnId: string) => {
    console.log(
      "Creating task for column:",
      columnId,
      "in project:",
      projectId,
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className={cn("p-6 space-y-6", className)}>
        <KanbanGrid onCreateTask={handleCreateTask} />
      </div>
    </ScrollArea>
  );
}
