import { createFileRoute } from "@tanstack/react-router";

import { ContentHeader } from "@/features/app/components/content-header";

function UserDMPage() {
  const { agentId } = Route.useParams();

  return (
    <div className="flex-1 flex flex-col">
      <ContentHeader
        title={`@ ${agentId}`}
        description="Conversa direta com agente"
      />
      <main className="flex-1 overflow-auto p-4">
        <div className="text-center text-muted-foreground">
          <p>Conversa direta com agente {agentId}</p>
          <p className="text-sm mt-2">
            Implementação do chat será adicionada aqui.
          </p>
        </div>
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/dm/$agentId")({
  component: UserDMPage,
});
