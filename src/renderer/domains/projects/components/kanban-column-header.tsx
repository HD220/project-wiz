import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KanbanColumnHeaderProps {
  column: {
    id: string;
    name: string;
    color: string;
  };
  taskCount: number;
  onCreateTask: (columnId: string) => void;
}

export function KanbanColumnHeader({
  column,
  taskCount,
  onCreateTask,
}: KanbanColumnHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={cn("w-3 h-3 rounded-full", column.color)} />
        <h3 className="font-semibold text-foreground">{column.name}</h3>
        <Badge variant="secondary" className="ml-auto">
          {taskCount}
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8"
        onClick={() => onCreateTask(column.id)}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
