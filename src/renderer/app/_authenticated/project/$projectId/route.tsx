import { createFileRoute, Outlet } from "@tanstack/react-router";

import type { Project } from "@/shared/types";

import { ProjectSidebar } from "@/renderer/components/app/project-sidebar";
import { loadApiData } from "@/renderer/lib/route-loader";

function ProjectLayout() {
  const { project } = Route.useLoaderData();

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-60 h-full">
        <ProjectSidebar project={project || {} as Project} conversations={[]} agents={[]} />
      </div>
      <main className="flex-1 h-full">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId")({
  loader: async ({ params }) => {
    // Get basic project info for sidebar using loadApiData for consistency
    const project = await loadApiData(
      () => window.api.project.get(params.projectId),
      "Project not found",
    );

    return {
      project,
    };
  },
  component: ProjectLayout,
});
