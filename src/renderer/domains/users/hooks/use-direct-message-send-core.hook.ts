import { useAgentCommunication } from "./use-agent-communication.hook";
import { useMessageValidation } from "./use-message-validation.hook";
import { useOptimisticDirectMessage } from "./use-optimistic-direct-message.hook";

import type { DirectMessageSendProps } from "./use-direct-message-send.types";

export function useDirectMessageSendCore(props: DirectMessageSendProps) {
  const { validateMessage } = useMessageValidation();

  const { addOptimisticMessage, clearOptimisticMessages } =
    useOptimisticDirectMessage({
      conversationId: props.conversationId,
      setOptimisticMessages: props.setOptimisticMessages,
    });

  const { sendToAgent } = useAgentCommunication({
    conversationId: props.conversationId,
    setIsTyping: props.setIsTyping,
    loadMessages: props.loadMessages,
  });

  return {
    validateMessage,
    addOptimisticMessage,
    clearOptimisticMessages,
    sendToAgent,
  };
}
