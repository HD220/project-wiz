import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "@/renderer/features/task-management/components/kanban-board";
import { PageTitle } from "@/components/page-title";
import { CheckSquare } from "lucide-react";

export const Route = createFileRoute("/project/$projectId/tasks/")({
  component: ProjectTasksPage,
});

export function ProjectTasksPage() {
  return (
    <div className="h-full">
      <PageTitle title="Tarefas" icon={<CheckSquare className="w-5 h-5 text-muted-foreground" />} />
      <KanbanBoard />
    </div>
  );
}
