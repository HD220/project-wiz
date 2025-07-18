import { taskColumns, getTasksByStatus } from "@/lib/mock-data/tasks";

import { KanbanColumn } from "./kanban-column";

interface KanbanGridProps {
  onCreateTask: (columnId: string) => void;
}

export function KanbanGrid({ onCreateTask }: KanbanGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {taskColumns.map((column) => {
        const tasks = getTasksByStatus(column.id as Task["status"]);

        return (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks}
            onCreateTask={onCreateTask}
          />
        );
      })}
    </div>
  );
}
