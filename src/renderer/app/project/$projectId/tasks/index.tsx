import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/renderer/features/task-management/components/kanban-board";
import { PageTitle } from "@/components/page-title";
import { CheckSquare } from "lucide-react";

export const Route = createFileRoute("/project/$projectId/tasks/")({
  component: ProjectTasksPage,
});

export function ProjectTasksPage() {
  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto">
        <KanbanBoard />
      </div>
    </div>
  );
}
