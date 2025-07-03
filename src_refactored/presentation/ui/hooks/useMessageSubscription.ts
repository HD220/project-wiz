import { toast } from "sonner";

import { useIpcSubscription } from "@/ui/hooks/ipc/useIpcSubscription";
import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  GetDMMessagesRequest,
  GetDMMessagesResponseData,
  DMMessageReceivedEventPayload,
} from "@/shared/ipc-types";

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
    GetDMMessagesResponseData,
    DMMessageReceivedEventPayload
  >(
    IPC_CHANNELS.GET_DM_MESSAGES,
    { conversationId },
    IPC_CHANNELS.DM_MESSAGE_RECEIVED_EVENT,
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
    },
  );

  return { messages, isLoadingMessages, messagesError };
}
