import { createFileRoute, Outlet } from "@tanstack/react-router";

import { UserSidebar } from "@/renderer/features/app/components/user-sidebar";

function UserLayout() {
  const { conversations, availableUsers } = Route.useLoaderData();

  return (
    <div className="h-full w-full flex">
      <div className="w-60 h-full">
        <UserSidebar
          conversations={conversations}
          availableUsers={availableUsers}
        />
      </div>
      <main className="flex-1 h-full">
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user")({
  loader: async ({ context }) => {
    const { auth } = context;

    // Defensive check - ensure user exists
    if (!auth.user?.id) {
      throw new Error("User not authenticated");
    }

    // Load conversations and available users in parallel using route loader
    const [conversationsResponse, availableUsersResponse] = await Promise.all([
      window.api.conversations.getUserConversations(),
      window.api.users.listAvailableUsers(),
    ]);

    if (!conversationsResponse.success) {
      throw new Error(
        conversationsResponse.error || "Failed to load conversations",
      );
    }

    if (!availableUsersResponse.success) {
      throw new Error(
        availableUsersResponse.error || "Failed to load available users",
      );
    }

    const conversations = conversationsResponse.data || [];
    const availableUsers = availableUsersResponse.data || [];

    return {
      conversations,
      availableUsers,
    };
  },
  component: UserLayout,
});
