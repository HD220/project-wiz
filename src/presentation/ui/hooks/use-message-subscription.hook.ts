import { toast } from "sonner";

import { useIpcSubscription } from "@/ui/hooks/ipc/use-ipc-subscription.hook";

import { IPC_CHANNELS } from "@/shared/ipc-channels.constants";
import type {
  GetDMMessagesRequest,
  GetDMMessagesResponse,
  DMMessageReceivedEventPayload,
} from "@/shared/ipc-types/chat.types";

const GET_CONVERSATION_MESSAGES_CHANNEL = IPC_CHANNELS.GET_DM_MESSAGES;
const CONVERSATION_MESSAGE_RECEIVED_EVENT_CHANNEL =
  IPC_CHANNELS.DM_MESSAGE_RECEIVED_EVENT;

interface UseMessageSubscriptionProps {
  conversationId: string;
}

export function useMessageSubscription({
  conversationId,
}: UseMessageSubscriptionProps) {
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
    { conversationId: conversationId || '' },
    CONVERSATION_MESSAGE_RECEIVED_EVENT_CHANNEL,
    {
      getSnapshot: (prevMessages, eventPayload) => {
        if (eventPayload.conversationId === conversationId) {
          if (prevMessages?.find((msg) => msg.id === eventPayload.message.id)) {
            return prevMessages;
          }
          return [...(prevMessages || []), eventPayload.message];
        }
        return prevMessages || [];
      },
      onError: (err) => {
        toast.error(`Erro na subscrição de mensagens: ${err.message}`);
      },
      enabled: !!conversationId,
    },
  );

  return { messages, isLoadingMessages, messagesError };
}

