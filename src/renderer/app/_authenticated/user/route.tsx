import { createFileRoute, Outlet } from "@tanstack/react-router";

import { UserSidebar } from "@/renderer/features/app/components/user-sidebar";

function UserLayout() {
  return (
    <div className="h-full w-full flex">
      <div className="w-60 h-full">
        <UserSidebar />
      </div>
      <main className="flex-1 h-full">
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user")({
  beforeLoad: async ({ context }) => {
    const { auth } = context;

    // Defensive check - ensure user exists
    if (!auth.user?.id) {
      throw new Error("User not authenticated");
    }

    // PREFERRED: Load conversations and agents in parallel using route loader
    const [conversationsResponse, agentsResponse] = await Promise.all([
      window.api.conversations.getUserConversations(),
      window.api.agents.list(),
    ]);

    if (!conversationsResponse.success) {
      throw new Error(
        conversationsResponse.error || "Failed to load conversations",
      );
    }

    if (!agentsResponse.success) {
      throw new Error(agentsResponse.error || "Failed to load agents");
    }

    const conversations = conversationsResponse.data || [];
    const agents = agentsResponse.data || [];

    // CORRECTED: Map agent.id (not agent.userId) as the user ID
    const availableUsers = agents.map((agent) => ({
      id: agent.id, // ✅ FIXED: was agent.userId
      name: agent.name,
      avatar: null, // Agent type doesn't have avatar field
      type: "agent" as const,
      createdAt: new Date(agent.createdAt),
      updatedAt: new Date(agent.updatedAt),
    }));

    return {
      conversations,
      availableUsers,
      user: auth.user,
    };
  },
  component: UserLayout,
});
