import { createFileRoute } from "@tanstack/react-router";

import { ContentHeader } from "@/renderer/features/app/components/content-header";
import {
  messageApi,
  ConversationAPI,
} from "@/renderer/features/conversation/api";
import { ConversationChat } from "@/renderer/features/conversation/components/conversation-chat";

function UserDMPage() {
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
    .map((p) => availableUsers.find((u) => u.id === p.participantId))
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
      : `Group conversation with ${otherParticipants.length} participants`;

  return (
    <div className="h-full w-full flex flex-col">
      <ContentHeader title={displayName} description={description} />
      <main className="flex-1 overflow-hidden">
        <ConversationChat conversationId={conversationId} />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/dm/$conversationId")(
  {
    beforeLoad: async ({ context }) => {
      const { auth } = context;
      const { user } = auth;

      if (!user) {
        throw new Error("User not authenticated");
      }
    },
    loader: async ({ params, context }) => {
      const { auth } = context;
      const { user } = auth;
      const { conversationId } = params;

      // Fetch conversation with messages and available users in parallel
      const [conversation, availableUsers] = await Promise.all([
        messageApi.getConversationWithMessages(conversationId),
        ConversationAPI.getAvailableUsers(),
      ]);

      return {
        conversation,
        availableUsers: availableUsers || [],
        user,
      };
    },
    component: UserDMPage,
  },
);
