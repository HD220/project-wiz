import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { ContentHeader } from "@/renderer/features/app/components/content-header";
import { ConversationChat } from "@/renderer/features/conversation/components/conversation-chat";
import { useMessages, useAvailableUsers } from "@/renderer/features/conversation/hooks";
import { useAuthStore } from "@/renderer/store/auth.store";

function UserDMPage() {
  const { conversationId } = Route.useParams();
  const { user } = useAuthStore();
  
  // Server state via TanStack Query hooks
  const { conversation, isLoading } = useMessages(conversationId);
  const { availableUsers } = useAvailableUsers();

  // Loading state
  if (isLoading || !conversation) {
    return (
      <div className="h-full flex flex-col">
        <ContentHeader
          title="Loading..."
          description="Loading conversation"
        />
        <main className="flex-1 overflow-auto p-4">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  // Get conversation display info
  const otherParticipants = conversation.participants
    .filter(p => p.participantId !== user?.id)
    .map(p => availableUsers.find(u => u.id === p.participantId))
    .filter(Boolean);

  const displayName = conversation.name || 
    (otherParticipants.length === 1 ? otherParticipants[0]?.name : `Group ${otherParticipants.length + 1}`) || 
    "Unknown";

  const description = 
    otherParticipants.length === 1
      ? `Direct message with ${otherParticipants[0]?.name || 'Unknown'}`
      : `Group conversation with ${otherParticipants.length} participants`;

  return (
    <div className="h-full w-full flex flex-col">
      <ContentHeader
        title={displayName}
        description={description}
      />
      <main className="flex-1 overflow-hidden">
        <ConversationChat conversationId={conversationId} />
      </main>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/user/dm/$conversationId")({
  component: UserDMPage,
});