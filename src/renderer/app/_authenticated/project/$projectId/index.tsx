import { createFileRoute } from "@tanstack/react-router";

import { ContentHeader } from "@/renderer/features/app/components/content-header";
import { ServerView } from "@/renderer/features/app/components/server-view";

function ProjectPage() {
  const { projectId } = Route.useParams();

  return (
    <div className="flex-1 flex flex-col">
      <ContentHeader
        title="Projeto"
        description="Gerencie seu projeto e colabore com agentes"
      />
      <main className="flex-1 overflow-auto">
        <ServerView serverId={projectId} />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId/")({
  component: ProjectPage,
});
