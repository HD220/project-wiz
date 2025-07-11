import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "../features/task-management/components/kanban-board";

export const Route = createFileRoute("/tasks")({
  component: TasksComponent,
});

function TasksComponent() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold">Gerenciamento de Tarefas</h1>
        <p className="text-muted-foreground">
          Organize e acompanhe o progresso das suas tarefas
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
