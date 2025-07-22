import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ContentHeader } from "@/renderer/features/app/components/content-header";

function ChannelLayout() {
  const { channelId } = Route.useParams();

  return (
    <div className="flex-1 flex flex-col">
      <ContentHeader
        title={`# ${channelId}`}
        description="Canal de comunicação do projeto"
      />
      <main className="flex-1 overflow-auto">
        <div className="h-full p-4">
          <div className="text-center text-muted-foreground">
            <p>
              Você está no canal: <strong>{channelId}</strong>
            </p>
            <p className="text-sm mt-2">
              Implementação do chat será adicionada aqui.
            </p>
          </div>
        </div>
      </main>

      {/* Child Routes */}
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute(
  "/_authenticated/project/$projectId/channel/$channelId",
)({
  component: ChannelLayout,
});
