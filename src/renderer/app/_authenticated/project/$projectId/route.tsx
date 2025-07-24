import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ProjectSidebar } from "@/renderer/features/app/components/project-sidebar";

function ProjectLayout() {
  const { project } = Route.useLoaderData();

  return (
    <>
      <div className="w-60">
        <ProjectSidebar project={project} conversations={[]} agents={[]} />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId")({
  loader: async ({ params }) => {
    // Get basic project info for sidebar
    const projectResponse = await window.api.projects.findById(
      params.projectId,
    );
    if (!projectResponse.success || !projectResponse.data) {
      throw new Error("Project not found");
    }

    return {
      project: projectResponse.data,
    };
  },
  component: ProjectLayout,
});
