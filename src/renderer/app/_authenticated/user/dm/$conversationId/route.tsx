import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { ContentHeader } from "@/renderer/features/app/components/content-header";
import { ConversationChat } from "@/renderer/features/conversation/components/conversation-chat";

function DMLayout() {
  const { conversationId } = Route.useParams();
  const { conversation, availableUsers, user } = Route.useLoaderData();

  if (!conversation) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-muted-foreground">Conversation not found</div>
      </div>
    );
  }

  // Get conversation display info
  const otherParticipants = conversation.participants
    .filter((p) => p.participantId !== user?.id)
    .map((p) => availableUsers.find((u: any) => u.id === p.participantId))
    .filter(Boolean);

  const displayName =
    conversation.name ||
    (otherParticipants.length === 1
      ? otherParticipants[0]?.name
      : `Group ${otherParticipants.length + 1}`) ||
    "Unknown";

  const description =
    otherParticipants.length === 1
      ? `Direct message with ${otherParticipants[0]?.name || "Unknown"}`
      : `Group conversation with ${otherParticipants.length + 1} participants`;

  return (
    <div className="h-full w-full flex flex-col">
      <ContentHeader
        title={displayName}
        description={description}
        icon={MessageCircle}
      />
      <main className="flex-1 overflow-hidden">
        <ConversationChat
          conversationId={conversationId}
          conversation={conversation}
          availableUsers={availableUsers}
          currentUser={user}
        />
      </main>

      {/* Child Routes */}
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/dm/$conversationId")(
  {
    loader: async ({ params, context }) => {
      const { auth } = context;
      const { conversationId } = params;

      // SIMPLE: Direct window.api calls
      const conversationsResponse =
        await window.api.conversations.getUserConversations();
      if (!conversationsResponse.success) {
        throw new Error("Failed to load conversations");
      }

      const conversation = conversationsResponse.data?.find(
        (conv) => conv.id === conversationId,
      );
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const messagesResponse =
        await window.api.messages.getConversationMessages(conversationId);

      const messages = messagesResponse.success
        ? messagesResponse.data || []
        : [];

      const availableUsersResponse =
        await window.api.users.listAvailableUsers();
      const availableUsers = availableUsersResponse.success
        ? availableUsersResponse.data || []
        : [];

      return {
        conversation: { ...conversation, messages },
        availableUsers,
        user: auth.user,
      };
    },
    component: DMLayout,
  },
);
