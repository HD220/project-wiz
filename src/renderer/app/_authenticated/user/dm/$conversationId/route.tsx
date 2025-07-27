import { createFileRoute, Outlet } from "@tanstack/react-router";

import type { SelectConversationParticipant } from "@/main/features/conversation/conversation.model";
import type { SelectMessage } from "@/main/features/conversation/message.model";
import type { AuthenticatedUser as MainAuthUser } from "@/main/features/user/user.types";

import { ContentHeader } from "@/renderer/features/app/components/content-header";
import { ConversationAvatar } from "@/renderer/features/conversation/components/conversation-avatar";
import { ConversationChat } from "@/renderer/features/conversation/components/conversation-chat";
import type { AuthenticatedUser } from "@/renderer/features/user/user.types";
import { loadApiData } from "@/renderer/lib/route-loader";

// Message type for renderer
type Message = {
  id: string;
  isActive: boolean;
  deactivatedAt: Date | null;
  deactivatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  conversationId: string;
  content: string;
  authorId: string;
  senderId: string;
  senderType: "user" | "agent";
  metadata: unknown;
};

// Helper function to convert main Message to renderer Message
function convertToRendererMessage(mainMessage: SelectMessage): Message {
  return {
    id: mainMessage.id,
    isActive: mainMessage.isActive,
    deactivatedAt: mainMessage.deactivatedAt,
    deactivatedBy: mainMessage.deactivatedBy,
    createdAt: mainMessage.createdAt,
    updatedAt: mainMessage.updatedAt,
    conversationId: mainMessage.conversationId,
    content: mainMessage.content,
    authorId: mainMessage.authorId,
    senderId: mainMessage.authorId, // Map authorId to senderId
    senderType: "user", // Default to user, could be enhanced based on user type
    metadata: null, // Default metadata
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
    type: "user",
    isActive: true,
    deactivatedAt: null,
    deactivatedBy: null,
    createdAt: mainUser.createdAt,
    updatedAt: mainUser.updatedAt,
  };
}

// Extended conversation type for rendering
type RendererConversation = {
  type: "dm" | "channel";
  name: string | null;
  id: string;
  isActive: boolean;
  deactivatedAt: Date | null;
  deactivatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  description: string | null;
  archivedAt: Date | null;
  archivedBy: string | null;
  title?: string | null;
  projectId?: string | null;
  agentId?: string | null;
  isArchived?: boolean;
  lastMessage?: Message;
  participants?: Array<{
    id: string;
    conversationId: string;
    userId: string;
    joinedAt: Date;
  }>;
  messages?: Message[];
};

// Helper function to convert main Conversation to renderer conversation
function convertToRendererConversation(mainConversation: {
  id: string;
  name: string | null;
  description?: string | null;
  type?: "dm" | "channel";
  archivedAt?: Date | null;
  archivedBy?: string | null;
  isActive: boolean;
  deactivatedAt: Date | null;
  deactivatedBy: string | null;
  lastMessage?: SelectMessage;
  participants?: SelectConversationParticipant[];
  createdAt: Date;
  updatedAt: Date;
}): RendererConversation {
  return {
    id: mainConversation.id,
    name: mainConversation.name,
    description: mainConversation.description || null,
    type: mainConversation.type || "dm",
    archivedAt: mainConversation.archivedAt || null,
    archivedBy: mainConversation.archivedBy || null,
    isActive: mainConversation.isActive,
    deactivatedAt: mainConversation.deactivatedAt,
    deactivatedBy: mainConversation.deactivatedBy,
    createdAt: mainConversation.createdAt,
    updatedAt: mainConversation.updatedAt,
    // Additional renderer properties
    title: mainConversation.name,
    projectId: null,
    agentId: null,
    isArchived: !!mainConversation.archivedAt,
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

  // Use generated title from backend or create fallback
  const displayName = conversation.name || "Unknown Conversation";

  // Create description based on participants, not duplicating the title
  const description =
    otherParticipants.length === 1
      ? "Conversa direta"
      : otherParticipants.length > 1
        ? `${otherParticipants.length + 1} participantes`
        : "Conversa";

  // Create conversation avatar - use small size for header
  const conversationAvatar = (
    <div className="flex-shrink-0">
      <ConversationAvatar
        participants={conversation.participants}
        availableUsers={availableUsers}
        currentUserId={user?.id}
        size="sm"
        showStatus={false}
      />
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col">
      <ContentHeader
        title={displayName}
        description={description}
        customIcon={conversationAvatar}
      />
      <main className="flex-1 overflow-hidden">
        <ConversationChat
          conversationId={conversationId}
          conversation={{
            ...convertToRendererConversation({
              ...conversation,
              name: conversation.name || "Untitled Conversation",
              isActive: conversation.isActive ?? true,
              deactivatedAt: conversation.deactivatedAt ?? null,
              deactivatedBy: conversation.deactivatedBy ?? null,
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

      try {
        // Load conversation with messages and required data in parallel
        const [conversationResult, availableUsers, user] = await Promise.all([
          // Direct conversation fetch with messages
          Promise.all([
            loadApiData(
              () =>
                window.api.conversations.getUserConversations({
                  includeArchived: true,
                  includeInactive: false,
                }),
              "Failed to load conversations",
            ),
            loadApiData(
              () => window.api.messages.getConversationMessages(conversationId),
              "Failed to load messages",
            ),
          ]).then(([conversations, messages]) => {
            const conversation = conversations.find(
              (conv) => conv.id === conversationId,
            );
            if (!conversation) {
              throw new Error("Conversation not found");
            }
            return { ...conversation, messages };
          }),
          // Load users and auth in parallel
          loadApiData(
            () => window.api.users.listAvailableUsers(),
            "Failed to load available users",
          ),
          loadApiData(
            () => window.api.auth.getCurrentUser(),
            "Failed to load current user",
          ),
        ]);

        return {
          conversation: conversationResult,
          availableUsers,
          user,
        };
      } catch (error) {
        // Enhanced error handling with more specific messages
        console.error("Failed to load conversation data:", error);
        throw error;
      }
    },
    component: DMLayout,
  },
);
