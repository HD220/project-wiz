import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ProjectSidebar } from "@/renderer/features/app/components/project-sidebar";
import { loadApiData } from "@/renderer/lib/route-loader";

function ProjectLayout() {
  const { project } = Route.useLoaderData();

  return (
    <>
      <div className="w-60 h-full">
        <ProjectSidebar project={project} conversations={[]} agents={[]} />
      </div>
      <main className="flex-1 h-full">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId")({
  loader: async ({ params }) => {
    try {
      // Get basic project info for sidebar using loadApiData for consistency
      const project = await loadApiData(
        () => window.api.projects.findById(params.projectId),
        "Project not found",
      );

      return {
        project,
      };
    } catch (error) {
      console.error("Failed to load project:", error);
      throw error;
    }
  },
  component: ProjectLayout,
});
