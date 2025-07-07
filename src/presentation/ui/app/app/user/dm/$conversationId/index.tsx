import { createFileRoute, useParams } from "@tanstack/react-router";
import React from "react";

import { ChatWindow } from "@/ui/features/chat/components/chat-window";
import { DirectMessageLoadingErrorDisplay } from "@/ui/features/chat/components/direct-message-loading-error-display";
import { useDirectMessages } from "@/ui/hooks/use-direct-messages.hook";

import type { ChatWindowConversationHeader } from "@/shared/ipc-chat.types";

const currentUserId = "userJdoe";

function DirectMessagePage() {
  const params = useParams({ from: "/app/user/dm/$conversationId/" });
  const conversationId = params.conversationId;

  const {
    conversationDetails,
    messages,
    isLoading,
    combinedError,
    handleSendMessage,
    isLoadingMessages,
  } = useDirectMessages(conversationId);

  if (isLoading || combinedError || !conversationDetails) {
    return (
      <DirectMessageLoadingErrorDisplay
        isLoading={isLoading}
        error={combinedError}
        conversationId={conversationId}
      />
    );
  }

  const chatWindowConversationHeader: ChatWindowConversationHeader = {
    id: conversationDetails.id,
    name: conversationDetails.name,
    type: conversationDetails.type,
    avatarUrl: conversationDetails.avatarUrl,
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
      <ChatWindow
        conversation={chatWindowConversationHeader}
        messages={messages || []}
        onSendMessage={handleSendMessage}
        isLoading={isLoadingMessages}
        currentUserId={currentUserId}
      />
    </div>
  );
}

export const Route = createFileRoute("/app/user/dm/$conversationId/")({
  component: DirectMessagePage,
});
