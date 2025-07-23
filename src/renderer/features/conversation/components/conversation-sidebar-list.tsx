import { useRouteContext } from "@tanstack/react-router";
import { Plus, MessageCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/renderer/components/ui/button";
import { ConversationSidebarItem } from "@/renderer/features/conversation/components/conversation-sidebar-item";
import { CreateConversationDialog } from "@/renderer/features/conversation/components/create-conversation-dialog";

function ConversationSidebarList() {
  // PREFERRED: Use Router Context for data loaded in route
  const { conversations, availableUsers, user } = useRouteContext({
    from: "/_authenticated/user",
  });

  // SIMPLE: Local state for UI
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // No loading states needed - data is preloaded by route
  const isLoading = false;

  // Helper functions
  function getOtherParticipants(conversation: any) {
    const currentUserId = user?.id;
    return conversation.participants
      .filter((p: any) => p.participantId !== currentUserId)
      .map((p: any) => p.participantId);
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
          const otherParticipants = availableUsers.filter((user) =>
            otherParticipantIds.includes(user.id),
          );

          return (
            <ConversationSidebarItem
              key={conversation.id}
              conversation={conversation}
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
      {showCreateDialog && (
        <CreateConversationDialog
          availableUsers={availableUsers}
          onClose={handleCloseDialog}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}

export { ConversationSidebarList };
