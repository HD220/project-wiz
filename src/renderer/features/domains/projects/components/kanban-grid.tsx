import { useKanbanData } from "../hooks/use-issues";
import { KanbanColumn } from "./kanban-column";

interface KanbanGridProps {
  projectId?: string;
  onCreateTask: (columnId: string) => void;
}

export function KanbanGrid({ projectId, onCreateTask }: KanbanGridProps) {
  const { columns, isLoading, error } = useKanbanData(projectId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading issues: {error.message}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={column.tasks}
          onCreateTask={onCreateTask}
        />
      ))}
    </div>
  );
}
