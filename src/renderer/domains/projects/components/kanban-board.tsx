import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import {
  Task,
  taskColumns,
  getTasksByStatus,
} from "@/renderer/lib/placeholders";

import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanEmptyState } from "./kanban-empty-state";
import { TaskCard } from "./task-card";

interface KanbanBoardProps {
  projectId?: string;
  className?: string;
}

export function KanbanBoard({ projectId, className }: KanbanBoardProps) {
  const handleCreateTask = (columnId: string) => {
    console.log("Creating task for column:", columnId);
  };

  return (
    <ScrollArea className="h-full">
      <div className={cn("p-6 space-y-6", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {taskColumns.map((column) => {
            const tasks = getTasksByStatus(column.id);

            return (
              <div key={column.id} className="flex flex-col">
                <KanbanColumnHeader
                  column={column}
                  taskCount={tasks.length}
                  onCreateTask={handleCreateTask}
                />

                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}

                  {tasks.length === 0 && (
                    <KanbanEmptyState
                      columnName={column.name}
                      onCreateTask={() => handleCreateTask(column.id)}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}
