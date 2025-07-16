import { useCallback } from "react";

import type { AIChatConfigDto } from "../../../../shared/types/domains/projects/channel-message.types";

interface OptimisticMessage {
  id: string;
  content: string;
  isOptimistic: boolean;
}

interface SendHookType {
  createOptimisticMessage: (content: string) => OptimisticMessage;
  createRequestData: (
    content: string,
    customConfig?: Partial<AIChatConfigDto>,
  ) => unknown;
  mutations: {
    sendMessage: (requestData: unknown) => void;
  };
}

interface MessagesHookType {
  addOptimisticMessage: (message: OptimisticMessage) => void;
  clearOptimisticMessages: () => void;
}

export function useChannelChatSendMessage(
  sendHook: SendHookType,
  messagesHook: MessagesHookType,
  setTyping: (isTyping: boolean) => void,
) {
  return useCallback(
    async (content: string, customConfig?: Partial<AIChatConfigDto>) => {
      const optimisticMessage = sendHook.createOptimisticMessage(content);
      messagesHook.addOptimisticMessage(optimisticMessage);
      setTyping(true);

      const requestData = sendHook.createRequestData(content, customConfig);
      sendHook.mutations.sendMessage(requestData);
      messagesHook.clearOptimisticMessages();
      setTyping(false);
    },
    [sendHook, messagesHook, setTyping],
  );
}
