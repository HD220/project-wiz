import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { ChatPageContent } from '@/ui/features/chat/components/ChatPageContent';
import { ChatSidebar } from '@/ui/features/chat/components/ChatSidebar';
import { useChatLogic } from '@/ui/hooks/useChatLogic';

const chatSearchSchema = z.object({
  conversationId: z.string().optional(),
});

export const Route = createFileRoute('/app/chat/')({
  component: ChatPage,
  validateSearch: chatSearchSchema,
});

export function ChatPage() {
  const { conversationId: selectedConversationIdFromSearch = undefined } = Route.useSearch();

  const {
    selectedConversationId,
    sidebarConversations,
    isLoadingSidebarConvs,
    sidebarConvsError,
    messages,
    isLoadingMessages,
    messagesError,
    handleSendMessage,
    handleSelectConversation,
    chatWindowConversationHeader,
    currentUserId,
  } = useChatLogic({
    selectedConversationIdFromSearch,
    routeFullPath: Route.fullPath,
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      <ChatSidebar
        conversations={sidebarConversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        isLoading={isLoadingSidebarConvs}
        error={sidebarConvsError}
      />
      <ChatPageContent
        conversationHeader={chatWindowConversationHeader}
        messages={messages || []}
        isLoadingMessages={isLoadingMessages}
        messagesError={messagesError}
        onSendMessage={handleSendMessage}
        currentUserId={currentUserId}
        selectedConversationId={selectedConversationId}
      />
    </div>
  );
}


