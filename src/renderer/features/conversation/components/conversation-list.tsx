import { Plus } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { useConversations, useAvailableUsers } from "../hooks";
import { useConversationUIStore } from "../store";
import { useAuthStore } from "@/renderer/store/auth.store";

import { EmptyConversations } from "./empty-conversations";
import { ConversationItem } from "./conversation-item";
import { CreateConversationDialog } from "./create-conversation-dialog";

interface ConversationListProps {
  selectedConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  className?: string;
}

function ConversationList(props: ConversationListProps) {
  const { selectedConversationId, onConversationSelect, className } = props;
  const { user } = useAuthStore();
  
  // Server state via TanStack Query hooks
  const { conversations, isLoading: conversationsLoading, error: conversationsError } = useConversations();
  const { availableUsers, isLoading: usersLoading } = useAvailableUsers();
  
  // UI state
  const { showCreateDialog, openCreateDialog, closeCreateDialog } = useConversationUIStore();
  
  const isLoading = conversationsLoading || usersLoading;
  const error = conversationsError;

  const handleCreateConversation = () => {
    openCreateDialog();
  };

  const handleCloseCreateDialog = () => {
    closeCreateDialog();
  };

  const handleConversationCreated = (conversationId: string) => {
    closeCreateDialog();
    onConversationSelect(conversationId);
  };

  // Loading skeleton similar to Discord
  if (isLoading) {
    return (
      <div className={`space-y-2 p-2 ${className || ""}`}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between px-2 mb-4">
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        </div>
        
        {/* Conversation items skeleton */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded">
            <div className="w-10 h-10 bg-muted animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-3 w-full bg-muted animate-pulse rounded" />
            </div>
            <div className="h-3 w-12 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`p-4 ${className || ""}`}>
        <div className="text-center text-destructive">
          <p className="text-sm mb-2">Failed to load conversations</p>
          <p className="text-xs text-muted-foreground">{error?.message}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (conversations.length === 0 && !showCreateDialog) {
    return (
      <div className={`p-4 ${className || ""}`}>
        <EmptyConversations onCreateConversation={handleCreateConversation} />
        
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

  return (
    <div className={`${className || ""}`}>
      {/* Header with create button - Discord style */}
      <div className="flex items-center justify-between px-4 py-2 mb-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Direct Messages
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted"
          onClick={handleCreateConversation}
          title="Create conversation"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Conversations list - Discord style */}
      <div className="space-y-0.5 px-2">
        {conversations.map((conversation) => {
          // Get other participants (exclude current user)
          const otherParticipantIds = conversation.participants
            .filter(p => p.participantId !== user?.id)
            .map(p => p.participantId);
            
          const otherParticipants = availableUsers.filter(user => 
            otherParticipantIds.includes(user.id)
          );
          
          // Get last message from conversation data
          const lastMessage = conversation.lastMessage || null;

          return (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              lastMessage={lastMessage}
              otherParticipants={otherParticipants}
              isSelected={selectedConversationId === conversation.id}
              onClick={() => onConversationSelect(conversation.id)}
              className="mx-1"
            />
          );
        })}
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

export { ConversationList };