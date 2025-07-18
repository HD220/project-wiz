import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { KanbanGrid } from "./kanban-grid";

interface KanbanBoardProps {
  projectId?: string;
  className?: string;
}

export function KanbanBoard({ projectId, className }: KanbanBoardProps) {
  const handleCreateTask = (columnId: string) => {
    // TODO: Implement task creation logic
    // This will integrate with the task management system
    // columnId: The column where the task should be created
    // projectId: The project context for the new task
  };

  return (
    <ScrollArea className="h-full">
      <div className={cn("p-6 space-y-6", className)}>
        <KanbanGrid projectId={projectId} onCreateTask={handleCreateTask} />
      </div>
    </ScrollArea>
  );
}
