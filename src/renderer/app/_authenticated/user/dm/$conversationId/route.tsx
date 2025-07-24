import { createFileRoute, Outlet } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import type { SelectConversationParticipant } from "@/main/features/conversation/conversation.model";
import type { SelectMessage } from "@/main/features/conversation/message.model";
import type { AuthenticatedUser as MainAuthUser } from "@/main/features/user/user.types";

import { ContentHeader } from "@/renderer/features/app/components/content-header";
import { ConversationChat } from "@/renderer/features/conversation/components/conversation-chat";
import type { SelectConversation } from "@/renderer/features/conversation/conversation.types";
import type { Message } from "@/renderer/features/conversation/message.types";
import type { AuthenticatedUser } from "@/renderer/features/user/user.types";
import { loadApiDataParallel, loadApiData } from "@/renderer/lib/route-loader";

// Helper function to convert main Message to renderer Message
function convertToRendererMessage(mainMessage: SelectMessage): Message {
  return {
    id: mainMessage.id,
    conversationId: mainMessage.conversationId,
    authorId: mainMessage.authorId,
    senderId: mainMessage.authorId, // Map authorId to senderId
    senderType: "user", // Default to user, could be enhanced based on user type
    content: mainMessage.content,
    metadata: null, // Default metadata
    createdAt: mainMessage.createdAt,
    updatedAt: mainMessage.updatedAt,
  };
}

// Helper function to convert main AuthenticatedUser to renderer AuthenticatedUser
function convertToRendererUser(mainUser: MainAuthUser): AuthenticatedUser {
  return {
    id: mainUser.id,
    username: mainUser.name,
    email: "",
    displayName: mainUser.name,
    name: mainUser.name,
    avatar: mainUser.avatar,
    theme: "system",
    createdAt: mainUser.createdAt,
    updatedAt: mainUser.updatedAt,
  };
}

// Helper function to convert main Conversation to renderer SelectConversation
function convertToRendererConversation(mainConversation: {
  id: string;
  name: string | null;
  description?: string | null;
  type?: "dm" | "channel";
  lastMessage?: SelectMessage;
  participants?: SelectConversationParticipant[];
  createdAt: Date;
  updatedAt: Date;
}): SelectConversation {
  return {
    id: mainConversation.id,
    userId: undefined,
    projectId: null,
    agentId: null,
    title: mainConversation.name,
    name: mainConversation.name,
    description: mainConversation.description,
    type: (mainConversation.type as "dm" | "channel" | "direct") || "dm",
    isArchived: false,
    lastMessage: mainConversation.lastMessage
      ? convertToRendererMessage(mainConversation.lastMessage)
      : undefined,
    participants:
      mainConversation.participants?.map((participant) => ({
        id: participant.id,
        conversationId: participant.conversationId,
        userId: participant.participantId,
        joinedAt: participant.createdAt,
      })) || [],
    createdAt: mainConversation.createdAt,
    updatedAt: mainConversation.updatedAt,
  };
}

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
    .filter((participant) => participant.participantId !== user?.id)
    .map((participant) =>
      availableUsers.find(
        (availableUser: { id: string }) =>
          availableUser.id === participant.participantId,
      ),
    )
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
          conversation={{
            ...convertToRendererConversation({
              ...conversation,
              name: conversation.name || "Untitled Conversation",
            }),
            messages: conversation.messages.map(convertToRendererMessage),
          }}
          availableUsers={availableUsers}
          currentUser={user ? convertToRendererUser(user) : null}
        />
      </main>

      {/* Child Routes */}
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/dm/$conversationId")(
  {
    loader: async ({ params }) => {
      const { conversationId } = params;

      // Load conversations first to validate conversation exists
      const conversations = await loadApiData(
        () => window.api.conversations.getUserConversations(),
        "Failed to load conversations",
      );

      const conversation = conversations.find(
        (conv) => conv.id === conversationId,
      );
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Load messages, users, and current user in parallel
      const { messages, availableUsers, user } = await loadApiDataParallel({
        messages: () =>
          window.api.messages.getConversationMessages(conversationId),
        availableUsers: () => window.api.users.listAvailableUsers(),
        user: () => window.api.auth.getCurrentUser(),
      });

      return {
        conversation: { ...conversation, messages },
        availableUsers,
        user,
      };
    },
    component: DMLayout,
  },
);
