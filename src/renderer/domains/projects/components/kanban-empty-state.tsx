import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface KanbanEmptyStateProps {
  columnName: string;
  onCreateTask: () => void;
}

export function KanbanEmptyState({
  columnName,
  onCreateTask,
}: KanbanEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-3">
        <Plus className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        Nenhuma tarefa em {columnName.toLowerCase()}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={onCreateTask}
      >
        Adicionar tarefa
      </Button>
    </div>
  );
}
