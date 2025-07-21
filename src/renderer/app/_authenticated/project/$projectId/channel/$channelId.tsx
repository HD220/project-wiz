import { createFileRoute } from "@tanstack/react-router";

import { ContentHeader } from "@/features/app/components/content-header";

function ChannelPage() {
  const { projectId, channelId } = Route.useParams();

  return (
    <div className="flex-1 flex flex-col">
      <ContentHeader
        title={`# ${channelId}`}
        description="Canal de comunicação do projeto"
      />
      <main className="flex-1 overflow-auto p-4">
        <div className="text-center text-muted-foreground">
          <p>
            Canal {channelId} do projeto {projectId}
          </p>
          <p className="text-sm mt-2">
            Implementação do chat será adicionada aqui.
          </p>
        </div>
      </main>
    </div>
  );
}

export const Route = createFileRoute(
  "/_authenticated/project/$projectId/channel/$channelId",
)({
  component: ChannelPage,
});
