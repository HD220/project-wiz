import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ProjectSidebar } from "@/renderer/features/app/components/project-sidebar";

function ProjectLayout() {
  const { projectId } = Route.useParams();
  const { project } = Route.useLoaderData();

  return (
    <>
      <div className="w-60">
        <ProjectSidebar projectId={projectId} project={project} />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId")({
  loader: async ({ params }) => {
    // SIMPLE: Load project data directly with window.api
    const response = await window.api.projects.findById(params.projectId);
    if (!response.success) {
      throw new Error(response.error || "Failed to load project");
    }

    if (!response.data) {
      throw new Error("Project not found");
    }

    return { project: response.data };
  },
  component: ProjectLayout,
});
