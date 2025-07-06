import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import { z } from "zod";

import { useConversationMessages } from "@/ui/hooks/useConversationMessages";
import { useSendMessage } from "@/ui/hooks/useSendMessage";
import { useSidebarConversations } from "@/ui/hooks/useSidebarConversations";

import type { ChatWindowConversationHeader } from "@/shared/ipc-chat.types";
import type { DirectMessageItem, ChatMessage } from "@/core/domain/entities/chat";

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

  const { sidebarConversations, isLoadingSidebarConvs, sidebarConvsError } = useSidebarConversations();

  const selectedConversationDetails = useMemo(() => {
    if (!selectedConversationId || !sidebarConversations) return null;
    return (
      sidebarConversations.find((conv: DirectMessageItem) => conv.id === selectedConversationId) ||
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
      search: (prev: { conversationId?: string }) => ({ ...prev, conversationId: convId }),
      replace: true,
    });
  };

  const getChatWindowConversationHeader = useCallback((): ChatWindowConversationHeader | null => {
    if (!selectedConversationDetails) return null;

    let type: "agent" | "dm" | "channel";
    if (selectedConversationDetails.type === "dm") {
      type = "dm";
    } else if (selectedConversationDetails.type === "agent") {
      type = "agent";
    } else {
      // Fallback or default for other types, assuming 'channel' for now
      type = "channel";
    }

    return {
      id: selectedConversationDetails.id,
      name: selectedConversationDetails.name,
      type: type,
      avatarUrl: selectedConversationDetails.avatarUrl,
    };
  }, [selectedConversationDetails]);

  const chatWindowConversationHeader = getChatWindowConversationHeader();

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
