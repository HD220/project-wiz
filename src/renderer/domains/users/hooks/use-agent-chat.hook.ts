import { useCallback, useMemo } from "react";

import { useConversation } from "./use-conversations.hook";
import { useMessages } from "./use-messages.hook";

import type { ConversationDto } from "../../../../shared/types/domains/users/message.types";

interface UseAgentChatProps {
  conversationId: string;
  conversation?: ConversationDto;
}

interface AgentInfo {
  id: string;
  name: string;
}

export function useAgentChat({
  conversationId,
  conversation,
}: UseAgentChatProps) {
  const messagesHook = useMessages(conversationId);
  const conversationHook = useConversation(conversationId);

  const currentConversation = conversation || conversationHook.conversation;

  const agent = useMemo((): AgentInfo => {
    if (!currentConversation) {
      return { id: "unknown", name: "AI Assistant" };
    }

    const participantId = currentConversation.participants.find(
      (p: string) => p !== "user",
    );

    if (!participantId) {
      return { id: "unknown", name: "AI Assistant" };
    }

    return {
      id: participantId,
      name: participantId === "Leo" ? "Leo" : "AI Assistant",
    };
  }, [currentConversation]);

  const validateAgent = useCallback(async (): Promise<boolean> => {
    try {
      return await window.electronIPC.invoke("dm:agent:validateConversation", {
        conversationId,
      });
    } catch (error) {
      console.error("Error validating conversation:", error);
      return false;
    }
  }, [conversationId]);

  const regenerateLastResponse = useCallback(async (): Promise<void> => {
    // Implementation would go here for regenerating last agent response
    console.log("Regenerate last response not implemented yet");
  }, []);

  return {
    ...messagesHook,
    agent,
    fullAgent: agent,
    validateAgent,
    regenerateLastResponse,
    regenerateLastMessage: regenerateLastResponse,
  };
}
