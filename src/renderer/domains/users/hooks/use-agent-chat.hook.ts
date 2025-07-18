import { useCallback, useMemo, useState } from "react";

import { useConversation } from "./use-conversations.hook";
import { useMessages } from "./use-messages.hook";

import type { AgentDto } from "../../../../shared/types/domains/agents/agent.types";
import type { ConversationDto } from "../../../../shared/types/domains/users/conversation-dto.type";

interface UseAgentChatProps {
  conversationId: string;
  conversation?: ConversationDto;
}

export function useAgentChat({
  conversationId,
  conversation,
}: UseAgentChatProps) {
  const messagesHook = useMessages(conversationId);
  const conversationHook = useConversation(conversationId);
  const [isTyping, setIsTyping] = useState(false); // Placeholder for isTyping

  const currentConversation = conversation || conversationHook.conversation;

  const agent = useMemo((): AgentDto => {
    if (!currentConversation) {
      return {
        id: "unknown",
        name: "AI Assistant",
        isActive: true,
      } as AgentDto; // Default values, adjust as needed
    }

    const participantId = currentConversation.participants.find(
      (p: string) => p !== "user",
    );

    if (!participantId) {
      return {
        id: "unknown",
        name: "AI Assistant",
        isActive: true,
      } as AgentDto; // Default values, adjust as needed
    }

    // This part needs to fetch the actual AgentDto based on participantId
    // For now, returning a partial AgentDto
    return {
      id: participantId,
      name: participantId === "Leo" ? "Leo" : "AI Assistant",
      isActive: true, // Placeholder
    } as AgentDto;
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
    fullAgent: agent, // fullAgent is now AgentDto
    validateAgent,
    regenerateLastResponse,
    regenerateLastMessage: regenerateLastResponse,
    isTyping,
    sendMessage: messagesHook.createMessage, // sendMessage is createMessage from messagesHook
  };
}
