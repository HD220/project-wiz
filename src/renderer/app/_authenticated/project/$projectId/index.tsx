import { createFileRoute } from "@tanstack/react-router";
import { ServerView } from "@/features/dashboard/components/server-view";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";

function ProjectPage() {
  const { projectId } = Route.useParams();
  
  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader title="Projeto" description="Gerencie seu projeto e colabore com agentes" />
      <main className="flex-1 overflow-auto">
        <ServerView serverId={projectId} />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId/")({
  component: ProjectPage,
});