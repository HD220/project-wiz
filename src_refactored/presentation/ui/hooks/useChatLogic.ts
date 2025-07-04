import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";

import { useIpcQuery } from "@/ui/hooks/ipc/useIpcQuery";
import { useConversationMessages } from "@/ui/hooks/useConversationMessages";
import { useSendMessage } from "@/ui/hooks/useSendMessage";

import { IPC_CHANNELS } from "@/shared/ipc-channels";
import type {
  GetDMConversationsListResponseData,
} from "@/shared/ipc-types";

interface ChatWindowConversationHeader {
  id: string;
  name: string;
  type: "dm" | "channel" | "agent";
  avatarUrl?: string;
}

const currentUserId = "userJdoe";

const chatSearchSchema = z.object({
  conversationId: z.string().optional(),
});


const GET_SIDEBAR_CONVERSATIONS_CHANNEL =
  IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST;

interface UseChatLogicProps {
  selectedConversationIdFromSearch: string | undefined;
  routeFullPath: string;
}

export function useChatLogic({
  selectedConversationIdFromSearch,
  routeFullPath,
}: UseChatLogicProps) {
  const navigate = useNavigate();

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >(selectedConversationIdFromSearch);

  useEffect(() => {
    setSelectedConversationId(selectedConversationIdFromSearch);
  }, [selectedConversationIdFromSearch]);

  const {
    data: sidebarConversations,
    isLoading: isLoadingSidebarConvs,
    error: sidebarConvsError,
  } = useIpcQuery<void, GetDMConversationsListResponseData>(
    GET_SIDEBAR_CONVERSATIONS_CHANNEL,
    undefined,
    { staleTime: 5 * 60 * 1000 }
  );

  const selectedConversationDetails = useMemo(() => {
    if (!selectedConversationId || !sidebarConversations) return null;
    return (
      (sidebarConversations as DirectMessageItem[]).find((conv) => conv.id === selectedConversationId) ||
      null
    );
  }, [selectedConversationId, sidebarConversations]);

  const { messages, isLoadingMessages, messagesError } = useConversationMessages({
    selectedConversationId,
  });

  const { handleSendMessage } = useSendMessage({
    selectedConversationId,
  });

  const handleSelectConversation = (convId: string): void => {
    navigate({
      search: { conversationId: convId },
      replace: true,
    });
  };

  const chatWindowConversationHeader: ChatWindowConversationHeader | null =
    selectedConversationDetails
      ? {
          id: selectedConversationDetails.id,
          name: selectedConversationDetails.name,
          type:
            selectedConversationDetails.type === "agent"
              ? "agent"
              : selectedConversationDetails.type === "dm"
                ? "dm"
                : "channel",
          avatarUrl: selectedConversationDetails.avatarUrl,
        }
      : null;

  return {
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
    chatSearchSchema,
  };
}
