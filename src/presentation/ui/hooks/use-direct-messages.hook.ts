import { useMemo } from "react";

import { useIpcQuery } from "@/ui/hooks/ipc/use-ipc-query.hook";
import { useMessageSending } from "@/ui/hooks/use-message-sending.hook";
import { useMessageSubscription } from "@/ui/hooks/use-message-subscription.hook";

import { IPC_CHANNELS } from "@/shared/ipc-channels.constants";
import type { DirectMessageItem, GetDMConversationsListResponse } from "@/shared/ipc-types/chat.types";

export function useDirectMessages(conversationId: string) {
  const {
    data: dmConversations,
    isLoading: isLoadingConvList,
    error: convListError,
  } = useIpcQuery<
    GetDMConversationsListResponse,
    undefined
  >(
    IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST,
    undefined,
    { staleTime: 5 * 60 * 1000 },
  );

  const conversationDetails: DirectMessageItem | null = useMemo(() => {
    if (!dmConversations) return null;
    return (
      dmConversations.find((conv) => conv.id === conversationId) || null
    );
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
