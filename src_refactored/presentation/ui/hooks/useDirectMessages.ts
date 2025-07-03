import { useMemo } from "react";

import { useIpcQuery } from "@/ui/hooks/ipc/useIpcQuery";
import { useMessageSending } from "@/ui/hooks/useMessageSending";
import { useMessageSubscription } from "@/ui/hooks/useMessageSubscription";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  DirectMessageItem,
  GetDMConversationsListResponseData,
} from "@/shared/ipc-types";

export function useDirectMessages(conversationId: string) {
  const {
    data: dmConversations,
    isLoading: isLoadingConvList,
    error: convListError,
  } = useIpcQuery<null, GetDMConversationsListResponseData>(
    IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST,
    null,
    { staleTime: 5 * 60 * 1000 },
  );

  const conversationDetails: DirectMessageItem | null = useMemo(() => {
    if (!dmConversations) return null;
    return dmConversations.find((conv) => conv.id === conversationId) || null;
  }, [dmConversations, conversationId]);

  const { messages, isLoadingMessages, messagesError } = useMessageSubscription({
    conversationId,
  });

  const { handleSendMessage } = useMessageSending({
    conversationId,
    conversationDetails,
  });

  const isLoading = isLoadingMessages || isLoadingConvList;
  const combinedError = messagesError || convListError;

  return {
    conversationDetails,
    messages,
    isLoading,
    combinedError,
    handleSendMessage,
    isLoadingMessages,
  };
}
