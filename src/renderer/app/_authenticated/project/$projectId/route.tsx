import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ProjectSidebar } from "@/renderer/features/app/components/project-sidebar";

function ProjectLayout() {
  const { projectId } = Route.useParams();
  const { project, conversations, agents } = Route.useLoaderData();

  return (
    <>
      <div className="w-60">
        <ProjectSidebar
          projectId={projectId}
          project={project}
          conversations={conversations}
          agents={agents}
        />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createFileRoute("/_authenticated/project/$projectId")({
  loader: async ({ params }) => {
    // Load minimal data for sidebar
    const [conversationsResponse, agentsResponse] = await Promise.all([
      window.api.conversations.getUserConversations(),
      window.api.agents.list(),
    ]);

    // Get basic project info just for sidebar
    const projectResponse = await window.api.projects.findById(
      params.projectId,
    );
    if (!projectResponse.success || !projectResponse.data) {
      throw new Error("Project not found");
    }

    const conversations = conversationsResponse.success
      ? conversationsResponse.data
      : [];
    const agents = agentsResponse.success ? agentsResponse.data : [];

    return {
      project: projectResponse.data,
      conversations: conversations || [],
      agents: agents || [],
    };
  },
  component: ProjectLayout,
});
