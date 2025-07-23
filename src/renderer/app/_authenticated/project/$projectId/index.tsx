import { createFileRoute } from "@tanstack/react-router";

import { ContentHeader } from "@/renderer/features/app/components/content-header";
import { ProjectView } from "@/renderer/features/app/components/server-view";

function ProjectPage() {
  const { project } = Route.useLoaderData();

  return (
    <div className="flex-1 flex flex-col">
      <ContentHeader
        title="Projeto"
        description="Gerencie seu projeto e colabore com agentes"
      />
      <main className="flex-1 overflow-auto">
        <ProjectView project={project} />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId/")({
  loader: async ({ params }) => {
    const response = await window.api.projects.findById(params.projectId);

    if (!response.success || !response.data) {
      throw new Error(response.error || "Project not found");
    }

    return { project: response.data };
  },
  component: ProjectPage,
});
