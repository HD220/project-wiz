import { useCallback } from "react";

import type { AIChatConfigDto } from "../../../../shared/types/domains/projects/channel-message.types";

export function useChannelChatSendMessage(
  sendHook: any,
  messagesHook: any,
  setTyping: any,
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
