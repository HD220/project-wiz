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
    // Check if it's a placeholder project ID (mock data)
    const isPlaceholder = params.projectId.startsWith("server-");

    if (isPlaceholder) {
      // Return mock project data for placeholder projects
      const mockProject = {
        id: params.projectId,
        name:
          params.projectId === "server-1"
            ? "Project Alpha"
            : params.projectId === "server-2"
              ? "Team Beta"
              : "Community",
        description:
          "This is a placeholder project for demonstration purposes.",
        status: "active" as const,
        localPath: "/placeholder/path",
        ownerId: "placeholder-user",
        createdAt: new Date(),
        updatedAt: new Date(),
        avatarUrl: null,
        gitUrl: null,
        branch: null,
      };

      return { project: mockProject };
    }

    // For real project IDs, load from database
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
