import { createFileRoute, Outlet } from "@tanstack/react-router";

import { UserSidebar } from "@/renderer/components/app/user-sidebar";

function UserLayout() {
  const { conversations, availableUsers } = Route.useLoaderData();

  return (
    <div className="h-full w-full flex">
      <div className="w-60 h-full flex-shrink-0 min-w-0 overflow-hidden">
        <UserSidebar
          conversations={conversations}
          availableUsers={availableUsers}
        />
      </div>
      <main className="flex-1 h-full min-w-0">
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

    // Load all DM conversations (including archived) - filtering handled in component
    const [conversationsResponse, availableUsersResponse] = await Promise.all([
      window.api.dm.list({
        includeArchived: true, // Always load all conversations
        includeInactive: false, // Always exclude inactive conversations
      }),
      window.api.user.list({}),
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

    const dmConversations = conversationsResponse.data || [];
    const availableUsers = availableUsersResponse.data || [];

    // Transform DM conversations to universal format
    const conversations = dmConversations.map((dm) => ({
      ...dm,
      type: "dm" as const,
      title: dm.name,
      isArchived: dm.archivedAt !== null,
      participants: dm.participants?.map((p) => ({
        id: p.id,
        conversationId: p.dmConversationId,
        userId: p.participantId,
        joinedAt: p.createdAt,
      })),
      lastMessage: dm.lastMessage
        ? {
            id: dm.lastMessage.id,
            isActive: true,
            deactivatedAt: null,
            createdAt: dm.lastMessage.createdAt,
            updatedAt: dm.lastMessage.updatedAt || dm.lastMessage.createdAt,
            conversationId: dm.id,
            content: dm.lastMessage.content,
            authorId: dm.lastMessage.authorId,
            senderId: dm.lastMessage.authorId,
            senderType: "user" as const,
            metadata: null,
          }
        : undefined,
    }));

    return {
      conversations,
      availableUsers,
    };
  },
  component: UserLayout,
});
