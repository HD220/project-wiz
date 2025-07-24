import { Plus, MessageCircle } from "lucide-react";
import { useState } from "react";

import type { ConversationWithLastMessage } from "@/main/features/conversation/conversation.types";
import type { UserSummary } from "@/main/features/user/user.service";

import { Button } from "@/renderer/components/ui/button";
import { useAuth } from "@/renderer/contexts/auth.context";
import { ConversationSidebarItem } from "@/renderer/features/conversation/components/conversation-sidebar-item";
import { CreateConversationDialog } from "@/renderer/features/conversation/components/create-conversation-dialog";
import type { ConversationWithLastMessage as RendererConversationWithLastMessage } from "@/renderer/features/conversation/types";
import type { AuthenticatedUser } from "@/renderer/features/user/user.types";

interface ConversationSidebarListProps {
  conversations: ConversationWithLastMessage[];
  availableUsers: unknown[];
}

function ConversationSidebarList(props: ConversationSidebarListProps) {
  const { conversations, availableUsers } = props;
  const { user: currentUser } = useAuth();

  // SIMPLE: Local state for UI
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // No loading states needed - data is preloaded by route
  const isLoading = false;

  // Helper functions
  function getOtherParticipants(
    _conversation: ConversationWithLastMessage,
  ): string[] {
    if (!currentUser) return [];
    // Return participant IDs that are not the current user
    return (
      _conversation.participants
        ?.filter((participant) => participant.participantId !== currentUser.id)
        .map((participant) => participant.participantId) || []
    );
  }

  function convertToUserSummary(user: unknown): UserSummary {
    const typedUser = user as {
      id: string;
      name?: string;
      displayName?: string;
      username?: string;
      avatar?: string | null;
      type?: string;
    };
    return {
      id: typedUser.id,
      name:
        typedUser.name ||
        typedUser.displayName ||
        typedUser.username ||
        "Unknown",
      avatar: typedUser.avatar ?? null,
      type: (typedUser.type as "human" | "agent") || "human",
    };
  }

  function convertToConversationWithLastMessage(
    conversation: ConversationWithLastMessage,
  ): RendererConversationWithLastMessage {
    return {
      ...conversation,
      name: conversation.name || "Untitled Conversation",
      description: conversation.description ?? null,
      agentId: null,
      participants: conversation.participants || [],
    };
  }

  function handleCreateDialog() {
    setShowCreateDialog(true);
  }

  function handleCloseDialog() {
    setShowCreateDialog(false);
  }

  function handleConversationCreated() {
    setShowCreateDialog(false);
  }

  // Loading skeleton - Discord style
  if (isLoading) {
    return (
      <div className="space-y-1">
        {/* Header skeleton */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          <div className="h-6 w-6 bg-muted animate-pulse rounded" />
        </div>

        {/* Conversation items skeleton - Discord style */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 px-2 py-2 mx-1 rounded"
          >
            <div className="w-8 h-8 bg-muted animate-pulse rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-3.5 w-20 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted/70 animate-pulse rounded" />
            </div>
            <div className="h-2.5 w-8 bg-muted/50 animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header with create button */}
      <div className="flex items-center justify-between px-2 py-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Direct Messages
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-5 w-5 p-0 hover:bg-muted"
          onClick={handleCreateDialog}
          title="Create conversation"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Conversations list - Discord style */}
      <div className="space-y-0.5">
        {conversations.map((conversation) => {
          const otherParticipantIds = getOtherParticipants(conversation);
          const otherParticipants = (availableUsers as AuthenticatedUser[])
            .filter((user) => otherParticipantIds.includes(user.id))
            .map(convertToUserSummary);

          return (
            <ConversationSidebarItem
              key={conversation.id}
              conversation={convertToConversationWithLastMessage(conversation)}
              lastMessage={conversation.lastMessage || null}
              otherParticipants={otherParticipants}
              unreadCount={0}
            />
          );
        })}

        {/* Empty state when no conversations */}
        {conversations.length === 0 && !isLoading && (
          <div className="px-4 py-6 text-center">
            <MessageCircle className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1 font-medium">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Click the + button to start chatting
            </p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      {showCreateDialog && currentUser && (
        <CreateConversationDialog
          availableUsers={(availableUsers as AuthenticatedUser[]).map(
            convertToUserSummary,
          )}
          currentUser={currentUser}
          onClose={handleCloseDialog}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}

export { ConversationSidebarList };
