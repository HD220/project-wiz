import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { ContentHeader } from "@/renderer/features/app/components/content-header";
import { ConversationChat } from "@/renderer/features/conversation/components/conversation-chat";
import { useConversationStore } from "@/renderer/features/conversation/conversation.store";

function UserDMPage() {
  const { conversationId } = Route.useParams();
  
  const {
    selectedConversation,
    availableUsers,
    isLoadingMessages,
    selectConversation,
    getConversationDisplayName,
    getOtherParticipants,
  } = useConversationStore();

  // Load conversation when component mounts or conversationId changes
  useEffect(() => {
    selectConversation(conversationId);
  }, [conversationId, selectConversation]);

  // Loading state
  if (isLoadingMessages || !selectedConversation) {
    return (
      <div className="flex-1 flex flex-col">
        <ContentHeader
          title="Loading..."
          description="Loading conversation"
        />
        <main className="flex-1 overflow-auto p-4">
          <div className="text-center text-muted-foreground">
            <p>Loading conversation...</p>
          </div>
        </main>
      </div>
    );
  }

  // Get conversation info for header
  const otherParticipantIds = getOtherParticipants(selectedConversation);
  const otherParticipants = availableUsers.filter(user => 
    otherParticipantIds.includes(user.id)
  );
  
  const displayName = getConversationDisplayName(selectedConversation);
  const description = otherParticipants.length === 1 
    ? `Direct message with ${otherParticipants[0]?.name || 'Unknown'}`
    : `Group conversation with ${otherParticipants.length} participants`;

  return (
    <div className="flex-1 flex flex-col">
      <ContentHeader
        title={displayName}
        description={description}
      />
      <main className="flex-1 overflow-hidden">
        <ConversationChat conversation={selectedConversation} />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/dm/$conversationId")({
  component: UserDMPage,
});
