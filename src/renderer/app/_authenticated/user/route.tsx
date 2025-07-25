import { createFileRoute, Outlet } from "@tanstack/react-router";
import { z } from "zod";

import { UserSidebar } from "@/renderer/features/app/components/user-sidebar";

// Search params schema for user routes
const UserSearchSchema = z.object({
  showArchived: z.boolean().optional().default(false),
});

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
  validateSearch: (search) => UserSearchSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ context, deps }) => {
    const { auth } = context;
    const { search } = deps;

    // Defensive check - ensure user exists
    if (!auth.user?.id) {
      throw new Error("User not authenticated");
    }

    // Load conversations with archive filter based on search params
    const [conversationsResponse, availableUsersResponse] = await Promise.all([
      window.api.conversations.getUserConversations({
        includeArchived: search.showArchived,
        includeInactive: false, // Always exclude inactive conversations
      }),
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
