import { toast } from 'sonner';

import { useIpcSubscription } from '@/ui/hooks/ipc/useIpcSubscription';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type {
  GetDMMessagesRequest as GetConversationMessagesRequest,
  GetDMMessagesResponseData as GetConversationMessagesResponseData,
  DMMessageReceivedEventPayload as ConversationMessageReceivedEventPayload,
  ChatMessage,
  IPCResponse,
} from "@/shared/ipc-types";

const GET_CONVERSATION_MESSAGES_CHANNEL = IPC_CHANNELS.GET_DM_MESSAGES;
const CONVERSATION_MESSAGE_RECEIVED_EVENT_CHANNEL =
  IPC_CHANNELS.DM_MESSAGE_RECEIVED_EVENT;

interface UseConversationMessagesProps {
  selectedConversationId: string | undefined;
}

export function useConversationMessages({
  selectedConversationId,
}: UseConversationMessagesProps) {
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useIpcSubscription<
    GetConversationMessagesRequest,
    IPCResponse<ChatMessage[]>,
    ConversationMessageReceivedEventPayload
  >(
    GET_CONVERSATION_MESSAGES_CHANNEL,
    { conversationId: selectedConversationId || '' },
    CONVERSATION_MESSAGE_RECEIVED_EVENT_CHANNEL,
    {
      getSnapshot: (prevMessagesResponse, eventPayload) => {
        const typedEventPayload = eventPayload as ConversationMessageReceivedEventPayload;
        const currentMessages = prevMessagesResponse?.success ? (prevMessagesResponse.data || []) : [];
        if (typedEventPayload.conversationId === selectedConversationId) {
          if (currentMessages.find((msg) => msg.id === typedEventPayload.message.id)) {
            return { success: true, data: currentMessages };
          }
          return { success: true, data: [...currentMessages, typedEventPayload.message] };
        }
        return { success: true, data: currentMessages };
      },
      onError: (err) => {
        toast.error(`Erro na subscrição de mensagens: ${err.message}`);
      },
      enabled: !!selectedConversationId,
    },
  );

  return { messages: messages?.data, isLoadingMessages, messagesError };
}