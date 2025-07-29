import { createFileRoute, Outlet } from "@tanstack/react-router";

import type { SelectDMConversation } from "@/renderer/features/dm/dm-conversation.types";
import type { SelectMessage } from "@/renderer/features/message/message.types";

import { ContentHeader } from "@/renderer/features/layout/components/content-header";
import {
  ProfileAvatar,
  ProfileAvatarImage,
  ProfileAvatarStatus,
  ProfileAvatarCounter,
} from "@/renderer/components/ui/profile-avatar";
import { ConversationChat } from "@/renderer/features/conversation/components/conversation-chat";
import { loadApiData } from "@/renderer/lib/route-loader";

// Message type for renderer compatibility
type RendererMessage = {
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

// Helper function to convert DM Message to renderer Message
function convertToRendererMessage(
  mainMessage: SelectMessage,
  dmId: string,
): RendererMessage {
  return {
    id: mainMessage.id,
    isActive: mainMessage.isActive,
    deactivatedAt: mainMessage.deactivatedAt,
    deactivatedBy: mainMessage.deactivatedBy,
    createdAt: mainMessage.createdAt,
    updatedAt: mainMessage.updatedAt,
    conversationId: dmId, // Map DM ID to conversationId for compatibility
    content: mainMessage.content,
    authorId: mainMessage.authorId,
    senderId: mainMessage.authorId,
    senderType: "user", // Default to user
    metadata: null,
  };
}

// Extended conversation type for rendering compatibility
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
  lastMessage?: RendererMessage;
  participants?: Array<{
    id: string;
    conversationId: string;
    userId: string;
    joinedAt: Date;
  }>;
  messages?: RendererMessage[];
};

// Helper function to convert DM Conversation to renderer conversation
function convertToRendererConversation(
  dmConversation: SelectDMConversation & {
    participants: any[];
    messages: SelectMessage[];
  },
): RendererConversation {
  return {
    id: dmConversation.id,
    name: dmConversation.name,
    description: dmConversation.description || null,
    type: "dm" as const,
    archivedAt: dmConversation.archivedAt || null,
    archivedBy: dmConversation.archivedBy || null,
    isActive: dmConversation.isActive,
    deactivatedAt: dmConversation.deactivatedAt,
    deactivatedBy: dmConversation.deactivatedBy,
    createdAt: dmConversation.createdAt,
    updatedAt: dmConversation.updatedAt,
    title: dmConversation.name,
    projectId: null,
    agentId: null,
    isArchived: !!dmConversation.archivedAt,
    participants:
      dmConversation.participants?.map((participant) => ({
        id: participant.id,
        conversationId: dmConversation.id,
        userId: participant.participantId,
        joinedAt: participant.createdAt,
      })) || [],
    messages:
      dmConversation.messages?.map((msg) =>
        convertToRendererMessage(msg, dmConversation.id),
      ) || [],
  };
}

function DMLayout() {
  const { conversationId } = Route.useParams();
  const { conversation, availableUsers, user } = Route.useLoaderData();

  if (!conversation) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-muted-foreground">DM conversation not found</div>
      </div>
    );
  }

  // Get conversation display info
  const otherParticipants =
    conversation.participants
      ?.filter((participant: any) => participant.userId !== user?.id)
      .map((participant: any) =>
        availableUsers.find(
          (availableUser: { id: string }) =>
            availableUser.id === participant.userId,
        ),
      )
      .filter(Boolean) || [];

  const displayName = conversation.name || "Unknown DM";
  const description =
    otherParticipants.length === 1
      ? "Direct message"
      : `${otherParticipants.length + 1} participants`;

  // Create conversation avatar
  const conversationAvatar = (
    <div className="flex-shrink-0">
      {(() => {
        if (otherParticipants.length === 0) {
          return (
            <ProfileAvatar size="sm">
              <ProfileAvatarImage
                fallbackIcon={<div className="text-xs font-bold">?</div>}
              />
            </ProfileAvatar>
          );
        }

        if (otherParticipants.length === 1) {
          const participant = otherParticipants[0];
          if (!participant) {
            return (
              <ProfileAvatar size="sm">
                <ProfileAvatarImage
                  fallbackIcon={<div className="text-xs font-bold">?</div>}
                />
              </ProfileAvatar>
            );
          }
          return (
            <ProfileAvatar size="sm">
              <ProfileAvatarImage
                src={participant.avatar}
                name={participant.name}
              />
              <ProfileAvatarStatus id={participant.id} size="sm" />
            </ProfileAvatar>
          );
        }

        const firstParticipant = otherParticipants[0];
        const remainingCount = otherParticipants.length - 1;

        if (!firstParticipant) {
          return (
            <ProfileAvatar size="sm">
              <ProfileAvatarImage
                fallbackIcon={<div className="text-xs font-bold">?</div>}
              />
            </ProfileAvatar>
          );
        }

        return (
          <ProfileAvatar size="sm">
            <ProfileAvatarImage
              src={firstParticipant.avatar}
              name={firstParticipant.name}
            />
            <ProfileAvatarStatus id={firstParticipant.id} size="sm" />
            {remainingCount > 0 && (
              <ProfileAvatarCounter count={remainingCount} size="sm" />
            )}
          </ProfileAvatar>
        );
      })()}
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
          conversation={conversation}
          availableUsers={availableUsers}
          currentUser={user}
        />
      </main>
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/dm/$conversationId")(
  {
    loader: async ({ params }) => {
      const { conversationId } = params;

      try {
        const [dmConversation, messages, availableUsers, user] =
          await Promise.all([
            loadApiData(
              () => window.api.dm.findById(conversationId),
              "Failed to load DM conversation",
            ),
            loadApiData(
              () => window.api.dm.getMessages(conversationId),
              "Failed to load DM messages",
            ),
            loadApiData(
              () => window.api.users.listAvailableUsers(),
              "Failed to load available users",
            ),
            loadApiData(
              () => window.api.auth.getCurrentUser(),
              "Failed to load current user",
            ),
          ]);

        if (!dmConversation) {
          throw new Error("DM conversation not found");
        }

        const conversationWithMessages = {
          ...dmConversation,
          messages: messages || [],
        };

        const rendererConversation = convertToRendererConversation(
          conversationWithMessages as any,
        );

        return {
          conversation: rendererConversation as any,
          availableUsers,
          user,
        };
      } catch (error) {
        console.error("Failed to load DM conversation data:", error);
        throw error;
      }
    },
    component: DMLayout,
  },
);
