import { useAgentChat } from "./use-agent-chat.hook";
import { useConversationAutoScroll } from "./use-conversation-auto-scroll.hook";
import { useConversationMessageHandler } from "./use-conversation-message-handler.hook";
import { useConversationMessageFormat } from "./use-conversation-message-format.hook";
import type { ConversationDto } from "../../../../shared/types/domains/users/user.types";

interface UseConversationViewStateProps {
  conversationId: string;
  conversation: ConversationDto;
}

export function useConversationViewState({
  conversationId,
  conversation,
}: UseConversationViewStateProps) {
  const chatHook = useAgentChat({ conversationId, conversation });
  const { messagesEndRef } = useConversationAutoScroll(
    chatHook.messages,
    chatHook.isTyping,
    conversationId,
  );
  const messageHandler = useConversationMessageHandler(
    chatHook.sendMessage,
    chatHook.fullAgent,
  );
  const { convertToMessageFormat } = useConversationMessageFormat(
    chatHook.agent.name,
  );

  return {
    ...chatHook,
    messagesEndRef,
    messageHandler,
    convertToMessageFormat,
  };
}