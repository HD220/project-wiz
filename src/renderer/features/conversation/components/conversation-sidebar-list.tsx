import { useRouteContext } from "@tanstack/react-router";
import { Plus, MessageCircle } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { ConversationSidebarItem } from "@/renderer/features/conversation/components/conversation-sidebar-item";
import { CreateConversationDialog } from "@/renderer/features/conversation/components/create-conversation-dialog";
import {
  useConversations,
  useAvailableUsers,
} from "@/renderer/features/conversation/hooks";
import { useConversationUIStore } from "@/renderer/features/conversation/store";

function ConversationSidebarList() {
  const { auth } = useRouteContext({ from: "__root__" });
  const { user } = auth;

  // Server state via TanStack Query hooks
  const { conversations, isLoading: conversationsLoading } = useConversations();
  const { availableUsers, isLoading: usersLoading } = useAvailableUsers();

  // UI state via Zustand
  const { showCreateDialog, openCreateDialog, closeCreateDialog } =
    useConversationUIStore();

  const isLoading = conversationsLoading || usersLoading;

  // Helper functions
  const getOtherParticipants = (conversation: any) => {
    const currentUserId = user?.id;
    return conversation.participants
      .filter((p: any) => p.participantId !== currentUserId)
      .map((p: any) => p.participantId);
  };

  function handleConversationCreated() {
    closeCreateDialog();
    // Navigation will be handled by the parent component
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
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
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
          onClick={openCreateDialog}
          title="Create conversation"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Conversations list - Discord style */}
      <div className="space-y-0.5">
        {conversations.map((conversation) => {
          const otherParticipantIds = getOtherParticipants(conversation);
          const otherParticipants = availableUsers.filter((user) =>
            otherParticipantIds.includes(user.id),
          );

          return (
            <ConversationSidebarItem
              key={conversation.id}
              conversation={conversation}
              lastMessage={
                conversation.lastMessage
                  ? (conversation.lastMessage as any)
                  : null
              }
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
      {showCreateDialog && (
        <CreateConversationDialog
          availableUsers={availableUsers}
          onClose={closeCreateDialog}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}

export { ConversationSidebarList };
