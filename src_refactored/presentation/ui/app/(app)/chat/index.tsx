import { createFileRoute, useNavigate } from '@tanstack/react-router';
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { ChatSidebar } from '@/presentation/ui/features/chat/components/ChatSidebar';
import { ChatWindow } from '@/presentation/ui/features/chat/components/ChatWindow';
import { useIpcMutation } from '@/presentation/ui/hooks/ipc/useIpcMutation';
import { useIpcQuery } from '@/presentation/ui/hooks/ipc/useIpcQuery';
import { useIpcSubscription } from '@/presentation/ui/hooks/ipc/useIpcSubscription';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type {
  GetDMMessagesRequest as GetConversationMessagesRequest,
  GetDMMessagesResponseData as GetConversationMessagesResponseData,
  DMMessageReceivedEventPayload as ConversationMessageReceivedEventPayload,
  SendDMMessageRequest as SendConversationMessageRequest,
  SendDMMessageResponseData as SendConversationMessageResponseData,
  IPCResponse,
  GetDMConversationsListResponseData
} from '@/shared/ipc-types';

interface ChatWindowConversationHeader {
  id: string;
  name: string;
  type: 'dm' | 'channel' | 'agent';
  avatarUrl?: string;
}

const currentUserId = "userJdoe";

const chatSearchSchema = z.object({
  conversationId: z.string().optional(),
});

const GET_CONVERSATION_MESSAGES_CHANNEL = IPC_CHANNELS.GET_DM_MESSAGES;
const SEND_CONVERSATION_MESSAGE_CHANNEL = IPC_CHANNELS.SEND_DM_MESSAGE;
const CONVERSATION_MESSAGE_RECEIVED_EVENT_CHANNEL = IPC_CHANNELS.DM_MESSAGE_RECEIVED_EVENT;
const GET_SIDEBAR_CONVERSATIONS_CHANNEL = IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST;


function ChatPage(): JSX.Element {
  const navigate = useNavigate({ from: Route.fullPath });
  const { conversationId: selectedConversationIdFromSearch } = Route.useSearch();

  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(selectedConversationIdFromSearch);

  useEffect(() => {
    setSelectedConversationId(selectedConversationIdFromSearch);
  }, [selectedConversationIdFromSearch]);

  const { data: sidebarConversations, isLoading: isLoadingSidebarConvs, error: sidebarConvsError } =
    useIpcQuery<null, GetDMConversationsListResponseData>(
      GET_SIDEBAR_CONVERSATIONS_CHANNEL,
      null,
      { staleTime: 5 * 60 * 1000 }
    );

  const selectedConversationDetails = useMemo(() => {
    if (!selectedConversationId || !sidebarConversations) return null;
    return sidebarConversations.find(conv => conv.id === selectedConversationId) || null;
  }, [selectedConversationId, sidebarConversations]);

  const { data: messages, isLoading: isLoadingMessages, error: messagesError } = useIpcSubscription<
    GetConversationMessagesRequest,
    GetConversationMessagesResponseData,
    ConversationMessageReceivedEventPayload
  >(
    GET_CONVERSATION_MESSAGES_CHANNEL,
    { conversationId: selectedConversationId || '' },
    CONVERSATION_MESSAGE_RECEIVED_EVENT_CHANNEL,
    {
      getSnapshot: (prevMessages, eventPayload) => {
        if (eventPayload.conversationId === selectedConversationId) {
          if (prevMessages?.find(msg => msg.id === eventPayload.message.id)) {
            return prevMessages;
          }
          return [...(prevMessages || []), eventPayload.message];
        }
        return prevMessages || [];
      },
      onError: (err) => {
        toast.error(`Erro na subscrição de mensagens: ${err.message}`);
      },
      enabled: !!selectedConversationId,
    }
  );

  const sendMessageMutation = useIpcMutation<
    SendConversationMessageRequest,
    IPCResponse<SendConversationMessageResponseData>
  >(
    SEND_CONVERSATION_MESSAGE_CHANNEL,
    {
      onSuccess: (response) => {
        if (!response.success) {
          toast.error(`Falha ao enviar mensagem: ${response.error?.message || 'Erro desconhecido.'}`);
        }
      },
      onError: (error) => {
        toast.error(`Erro ao enviar mensagem: ${error.message}`);
      },
    }
  );

  const handleSendMessage = (content: string): void => {
    if (!selectedConversationId) {
      toast.error("Nenhuma conversa selecionada.");
      return;
    }
    if (sendMessageMutation.isLoading) {
      toast.info("Aguarde o envio da mensagem anterior.");
      return;
    }
    sendMessageMutation.mutate({ conversationId: selectedConversationId, content });
  };

  const handleSelectConversation = (convId: string): void => {
    navigate({ search: (prev) => ({ ...prev, conversationId: convId }), replace: true });
  };

  const chatWindowConversationHeader: ChatWindowConversationHeader | null = selectedConversationDetails ? {
    id: selectedConversationDetails.id,
    name: selectedConversationDetails.name,
    type: selectedConversationDetails.type === 'agent' ? 'agent' : (selectedConversationDetails.type === 'dm' ? 'dm' : 'channel'),
    avatarUrl: selectedConversationDetails.avatarUrl,
  } : null;

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

interface ChatPageContentProps {
  conversationHeader: ChatWindowConversationHeader | null;
  messages: GetConversationMessagesResponseData;
  isLoadingMessages: boolean;
  messagesError: Error | null;
  onSendMessage: (content: string) => void;
  currentUserId: string;
  selectedConversationId: string | undefined;
}

function ChatPageContent({
  conversationHeader,
  messages,
  isLoadingMessages,
  messagesError,
  onSendMessage,
  currentUserId,
  selectedConversationId,
}: ChatPageContentProps): JSX.Element {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {messagesError && !isLoadingMessages && selectedConversationId && (
        <div className="p-4 text-center bg-red-50 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">
            Erro ao carregar mensagens: {messagesError.message}. Tentando reconectar...
          </p>
        </div>
      )}
      <ChatWindow
        conversation={conversationHeader}
        messages={messages}
        onSendMessage={onSendMessage}
        isLoading={isLoadingMessages && !messagesError}
        currentUserId={currentUserId}
      />
    </main>
  );
}

export const Route = createFileRoute('/(app)/chat/')({
  component: ChatPage,
  validateSearch: (search) => chatSearchSchema.parse(search),
});
