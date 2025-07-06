import React from "react";

import { ChatWindow } from "@/ui/features/chat/components/ChatWindow";

import { ChatWindowConversationHeader } from "@/shared/ipc-chat.types";
import type {
  GetDMMessagesResponse,
} from "@/shared/ipc-types/chat.types";
import type { ChatMessage } from "@/core/domain/entities/chat";

interface ChatPageContentProps {
  conversationHeader: ChatWindowConversationHeader | null;
  messages: ChatMessage[] | null | undefined;
  isLoadingMessages: boolean;
  messagesError: Error | null;
  onSendMessage: (content: string) => void;
  currentUserId: string;
  selectedConversationId: string | undefined;
}

export function ChatPageContent({
  conversationHeader,
  messages,
  isLoadingMessages,
  messagesError,
  onSendMessage,
  currentUserId,
  selectedConversationId,
}: ChatPageContentProps) {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {messagesError && !isLoadingMessages && selectedConversationId && (
        <div className="p-4 text-center bg-red-50 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">
            Erro ao carregar mensagens: {messagesError.message}. Tentando
            reconectar...
          </p>
        </div>
      )}
      <ChatWindow
        conversation={conversationHeader}
        messages={messages ?? []}
        onSendMessage={onSendMessage}
        isLoading={isLoadingMessages && !messagesError}
        currentUserId={currentUserId}
      />
    </main>
  );
}
