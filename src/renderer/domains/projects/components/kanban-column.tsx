import type { Task } from "@/renderer/lib/placeholders";

import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanEmptyState } from "./kanban-empty-state";
import { TaskCard } from "./task-card";

interface TaskColumn {
  id: string;
  name: string;
  color: string;
}

interface KanbanColumnProps {
  column: TaskColumn;
  tasks: Task[];
  onCreateTask: (columnId: string) => void;
}

export function KanbanColumn({
  column,
  tasks,
  onCreateTask,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col">
      <KanbanColumnHeader
        column={column}
        taskCount={tasks.length}
        onCreateTask={onCreateTask}
      />

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}

        {tasks.length === 0 && (
          <KanbanEmptyState
            columnName={column.name}
            onCreateTask={() => onCreateTask(column.id)}
          />
        )}
      </div>
    </div>
  );
}
