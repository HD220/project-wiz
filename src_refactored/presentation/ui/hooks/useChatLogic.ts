import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { z } from "zod";

import { useConversationMessages } from "@/ui/hooks/useConversationMessages";
import { useSendMessage } from "@/ui/hooks/useSendMessage";
import { useSidebarConversations } from "@/ui/hooks/useSidebarConversations";

import type {
  DirectMessageItem,
  ChatMessage,
} from "@/shared/ipc-types";

const currentUserId = "userJdoe";

const chatSearchSchema = z.object({
  conversationId: z.string().optional(),
});

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
    sidebarConversations,
    isLoadingSidebarConvs,
    sidebarConvsError,
  } = useSidebarConversations();

  const selectedConversationDetails = useMemo(() => {
    if (!selectedConversationId || !sidebarConversations) return null;
    return (
      sidebarConversations?.find((conv) => conv.id === selectedConversationId) ||
      null
    );
  }, [selectedConversationId, sidebarConversations]);

  const {
    data: messagesResponse,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useConversationMessages({
    selectedConversationId,
  });

  const messages: ChatMessage[] | null | undefined = messagesResponse?.data;

  const { handleSendMessage } = useSendMessage({
    selectedConversationId,
  });

  const handleSelectConversation = (convId: string): void => {
    navigate({
      search: { conversationId: convId },
      replace: true,
    });
  };

  const chatWindowConversationHeader = useMemo(() => {
    if (!selectedConversationDetails) return null;
    return {
      id: selectedConversationDetails.id,
      name: selectedConversationDetails.name,
      type:
        selectedConversationDetails.type === "agent"
          ? "agent"
          : selectedConversationDetails.type === "dm"
            ? "dm"
            : "channel",
      avatarUrl: selectedConversationDetails.avatarUrl,
    };
  }, [selectedConversationDetails]);

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
