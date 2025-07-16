import { createFileRoute } from "@tanstack/react-router";

import { KanbanBoard } from "@/domains/projects/components/kanban-board";

export const Route = createFileRoute("/project/$projectId/tasks/")({
  component: ProjectTasksPage,
});

export function ProjectTasksPage() {
  return (
    <div className="h-full overflow-auto">
      <KanbanBoard />
    </div>
  );
}
