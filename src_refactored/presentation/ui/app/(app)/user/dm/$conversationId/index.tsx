import { createFileRoute, useParams, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Loader2, ServerCrash } from 'lucide-react';
import React, { useMemo } from 'react'; // Removed useEffect, useState as they are no longer directly used
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { ChatWindow } from '@/presentation/ui/features/chat/components/ChatWindow';
import { useIpcMutation } from '@/presentation/ui/hooks/ipc/useIpcMutation'; // Import useIpcMutation
import { useIpcQuery } from '@/presentation/ui/hooks/ipc/useIpcQuery';
import { useIpcSubscription } from '@/presentation/ui/hooks/ipc/useIpcSubscription';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
// ChatMessage is used in handleSendMessage
// DirectMessageItem is used for conversationDetails type
import type {
  DirectMessageItem,
  ChatMessage,
  GetDMMessagesRequest,
  GetDMMessagesResponseData,
  DMMessageReceivedEventPayload,
  GetDMConversationsListResponseData,
  SendDMMessageRequest, // Import request type for sending message
  SendDMMessageResponseData, // Import response type for sending message
  IPCResponse // For the mutation's expected response structure
} from '@/shared/ipc-types';

// This type is for the data structure ChatWindow expects for a conversation header.
interface ChatWindowConversationHeader {
  id: string;
  name: string;
  type: 'dm' | 'channel' | 'agent';
  avatarUrl?: string;
}

// Mock current user ID - this would ideally come from a global user context/store
const currentUserId = "userJdoe";

function DirectMessagePage() {
  const params = useParams({ from: '/(app)/user/dm/$conversationId/' });
  const conversationId = params.conversationId;
  const router = useRouter();

  const { data: dmConversations, isLoading: isLoadingConvList, error: convListError } = useIpcQuery<null, GetDMConversationsListResponseData>(
    IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST,
    null,
    { staleTime: 5 * 60 * 1000 }
  );

  const conversationDetails: DirectMessageItem | null = useMemo(() => {
    if (!dmConversations) return null;
    return dmConversations.find(conv => conv.id === conversationId) || null;
  }, [dmConversations, conversationId]);

  const { data: messages, isLoading: isLoadingMessages, error: messagesError } = useIpcSubscription<
    GetDMMessagesRequest,
    GetDMMessagesResponseData,
    DMMessageReceivedEventPayload
  >(
    IPC_CHANNELS.GET_DM_MESSAGES,
    { conversationId },
    IPC_CHANNELS.DM_MESSAGE_RECEIVED_EVENT,
    {
      getSnapshot: (prevMessages, eventPayload) => {
        if (eventPayload.conversationId === conversationId) {
          if (prevMessages?.find(msg => msg.id === eventPayload.message.id)) {
            return prevMessages;
          }
          return [...(prevMessages || []), eventPayload.message];
        }
        return prevMessages || [];
      },
      onError: (err) => { // This onError is for the subscription part
        toast.error(`Erro na subscrição de mensagens: ${err.message}`);
      }
    }
  );

  const sendMessageMutation = useIpcMutation<
    SendDMMessageRequest,
    IPCResponse<SendDMMessageResponseData>
  >(
    IPC_CHANNELS.SEND_DM_MESSAGE,
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          // Message sent successfully.
          // The DM_MESSAGE_RECEIVED_EVENT should update the message list via useIpcSubscription.
          // No need to manually add the message here if the event system is working.
          console.log('Message sent, response data:', response.data);
        } else {
          // This case should ideally be handled by onError if IPCResponse wrapper is consistent
          toast.error(`Falha ao enviar mensagem: ${response.error?.message || 'Erro desconhecido retornando sucesso.'}`);
        }
      },
      onError: (error) => {
        toast.error(`Falha ao enviar mensagem: ${error.message}`);
      },
    }
  );

  const handleSendMessage = (content: string) => {
    if (!conversationDetails) {
      toast.error("Detalhes da conversa não encontrados para enviar mensagem.");
      return;
    }
    if (sendMessageMutation.isLoading) {
      toast.info("Aguarde o envio da mensagem anterior.");
      return;
    }
    // No local optimistic update here; relying on DM_MESSAGE_RECEIVED_EVENT
    // after successful IPC call from main process.
    sendMessageMutation.mutate({ conversationId, content });
  };

  const isLoading = isLoadingMessages || isLoadingConvList;
  const combinedError = messagesError || convListError; // Prioritize messagesError if both exist

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900"><Loader2 className="h-8 w-8 animate-spin text-sky-500"/> Carregando conversa...</div>;
  }

  if (combinedError) {
    // Determine which error to show, or show a generic one.
    // The individual hooks might already show toasts.
    const errorToShow = messagesError || convListError;
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/10 rounded-lg">
        <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Erro ao Carregar Conversa</h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-1">{errorToShow?.message}</p>
        <Button onClick={() => router.navigate({ to: "/user/"})} variant="destructive" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para DMs
        </Button>
      </div>
    );
  }

  if (!conversationDetails) {
    // This case might occur if dmConversations loaded but the specific conversationId was not found
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900">
        <ServerCrash className="h-12 w-12 text-slate-500 dark:text-slate-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Conversa não encontrada</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Não foi possível encontrar detalhes para a conversa com ID: {conversationId}.
        </p>
        <Button onClick={() => router.navigate({ to: "/user/"})} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para DMs
        </Button>
      </div>
    );
  }

  const chatWindowConversationHeader: ChatWindowConversationHeader = {
      id: conversationDetails.id,
      name: conversationDetails.name,
      type: conversationDetails.type === 'agent' ? 'dm' : conversationDetails.type,
      avatarUrl: conversationDetails.avatarUrl,
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
        <ChatWindow
        conversation={chatWindowConversationHeader}
        messages={messages || []}
        onSendMessage={handleSendMessage}
        isLoading={isLoadingMessages} // Pass message-specific loading to ChatWindow
        currentUserId={currentUserId}
        />
    </div>
  );
}

export const Route = createFileRoute('/(app)/user/dm/$conversationId/')({
  component: DirectMessagePage,
});
