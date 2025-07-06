import { toast } from 'sonner';

import { useIpcSubscription } from '@/ui/hooks/ipc/useIpcSubscription';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type {
  GetDMMessagesRequest,
  GetDMMessagesResponse,
  DMMessageReceivedEventPayload,
} from "@/shared/ipc-types/chat.types";
import type { ChatMessage } from "@/core/domain/entities/chat";

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
    GetDMMessagesRequest,
    GetDMMessagesResponse,
    DMMessageReceivedEventPayload
  >(
    GET_CONVERSATION_MESSAGES_CHANNEL,
    { conversationId: selectedConversationId || '' },
    CONVERSATION_MESSAGE_RECEIVED_EVENT_CHANNEL,
    {
      getSnapshot: (prevMessages, eventPayload) => {
        if (eventPayload.conversationId === selectedConversationId) {
          if (prevMessages?.find((msg: ChatMessage) => msg.id === eventPayload.message.id)) {
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
    },
  );

  return { messages, isLoadingMessages, messagesError };
}
