import { useEffect, useState } from "react";
import { Plus, MessageCircle } from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { Button } from "@/renderer/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/renderer/components/ui/avatar";
import { cn } from "@/renderer/lib/utils";

import { useConversationStore } from "../conversation.store";
import { CreateConversationDialog } from "./create-conversation-dialog";

function ConversationSidebarList() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const {
    conversations,
    availableUsers,
    isLoading,
    loadConversations,
    loadAvailableUsers,
    getConversationDisplayName,
    getOtherParticipants,
  } = useConversationStore();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    loadAvailableUsers();
  }, [loadConversations, loadAvailableUsers]);

  // Get current conversation ID from router
  const getCurrentConversationId = () => {
    const pathname = routerState.location.pathname;
    const match = pathname.match(/\/user\/dm\/(.+)$/);
    return match ? match[1] : null;
  };

  const currentConversationId = getCurrentConversationId();

  const handleConversationSelect = (conversationId: string) => {
    navigate({
      to: "/user/dm/$conversationId",
      params: { conversationId },
    });
  };

  const handleCreateConversation = () => {
    setShowCreateDialog(true);
  };

  // Auto-select first conversation if none selected and conversations exist
  useEffect(() => {
    if (!currentConversationId && conversations.length > 0 && !isLoading) {
      const firstConversation = conversations[0];
      handleConversationSelect(firstConversation.id);
    }
  }, [conversations, currentConversationId, isLoading]);

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
  };

  const handleConversationCreated = (conversationId: string) => {
    setShowCreateDialog(false);
    handleConversationSelect(conversationId);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-1">
        {/* Header skeleton */}
        <div className="flex items-center justify-between px-2 py-1">
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          <div className="h-6 w-6 bg-muted animate-pulse rounded" />
        </div>
        
        {/* Conversation items skeleton */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded">
            <div className="w-6 h-6 bg-muted animate-pulse rounded-full" />
            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
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
          onClick={handleCreateConversation}
          title="Create conversation"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Conversations list */}
      <div className="space-y-0.5">
        {conversations.map((conversation) => {
          const otherParticipantIds = getOtherParticipants(conversation);
          const otherParticipants = availableUsers.filter(user => 
            otherParticipantIds.includes(user.id)
          );
          const displayName = getConversationDisplayName(conversation);
          const isSelected = currentConversationId === conversation.id;

          // Get avatar for conversation
          const getAvatar = () => {
            if (otherParticipants.length === 1) {
              const participant = otherParticipants[0];
              return {
                image: participant.avatar,
                fallback: participant.name.charAt(0).toUpperCase(),
              };
            }
            
            return {
              image: null,
              fallback: otherParticipants.length.toString(),
            };
          };

          const avatar = getAvatar();

          return (
            <div
              key={conversation.id}
              role="button"
              tabIndex={0}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors",
                "hover:bg-muted/50",
                isSelected 
                  ? "bg-muted text-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => handleConversationSelect(conversation.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleConversationSelect(conversation.id);
                }
              }}
            >
              {/* Avatar */}
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarImage src={avatar.image || undefined} />
                <AvatarFallback className="text-xs">
                  {otherParticipants.length > 1 ? (
                    <MessageCircle className="h-3 w-3" />
                  ) : (
                    avatar.fallback
                  )}
                </AvatarFallback>
              </Avatar>

              {/* Conversation name */}
              <span className="truncate flex-1 text-sm">
                {displayName}
              </span>
            </div>
          );
        })}

        {/* Empty state when no conversations */}
        {conversations.length === 0 && !isLoading && (
          <div className="px-2 py-2 text-center">
            <p className="text-xs text-muted-foreground">
              No conversations yet
            </p>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <CreateConversationDialog
          availableUsers={availableUsers}
          onClose={handleCloseCreateDialog}
          onConversationCreated={handleConversationCreated}
        />
      )}
    </div>
  );
}

export { ConversationSidebarList };