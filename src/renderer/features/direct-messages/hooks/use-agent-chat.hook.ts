import React from "react";

import { useLlmProviders } from "../../llm-provider-management/hooks/use-llm-provider.hook";

import { useDirectMessageChat } from "./use-direct-message-chat.hook";

import type { ConversationDto } from "../../../../shared/types/message.types";

interface UseAgentChatProps {
  conversationId: string;
  conversation?: ConversationDto;
}

export const useAgentChat = ({
  conversationId,
  conversation,
}: UseAgentChatProps) => {
  // Get agent info from conversation participants
  const getAgentForConversation = () => {
    if (!conversation) return null;

    const participantId = conversation.participants.find(
      (p: string) => p !== "user",
    );
    if (!participantId) return null;

    // For now, return a simplified agent object
    // In the future, we could fetch full agent data if needed
    return {
      id: participantId,
      name: participantId === "Leo" ? "Leo" : "AI Assistant",
    };
  };

  const agent = getAgentForConversation();

  // Use the new direct message chat hook
  const directMessageChatHook = useDirectMessageChat({
    conversationId,
  });

  return {
    ...directMessageChatHook,
    // Alias some methods for backward compatibility
    regenerateLastResponse: directMessageChatHook.regenerateLastMessage,
    validateAgent: async () => {
      try {
        return await window.electronIPC.invoke(
          "dm:agent:validateConversation",
          { conversationId },
        );
      } catch (error) {
        console.error("Error validating conversation:", error);
        return false;
      }
    },
    // Agent info
    agent: agent || { id: "unknown", name: "AI Assistant" },
    // Legacy compatibility
    fullAgent: agent,
  };
};

// Export for backward compatibility
export const usePersonaChat = useAgentChat;
