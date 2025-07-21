import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/server/$serverId")({
  beforeLoad: async ({ params }) => {
    // Redirect to new project route for compatibility
    throw redirect({ 
      to: "/project/$projectId", 
      params: { projectId: params.serverId }
    });
  },
});