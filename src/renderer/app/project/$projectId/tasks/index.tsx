import { createFileRoute } from "@tanstack/react-router";

import { KanbanBoard } from "@/features/projects/components";

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
