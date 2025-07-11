import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "../features/task-management/components/kanban-board";

export const Route = createFileRoute("/tasks")({
  component: TasksComponent,
});

function TasksComponent() {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-12 px-6 flex items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="font-semibold">Gerenciamento de Tarefas</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
