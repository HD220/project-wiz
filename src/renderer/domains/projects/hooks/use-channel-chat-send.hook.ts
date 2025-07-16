import { useAiChatConfig } from "./use-ai-chat-config.hook";
import { useAiChatMutations } from "./use-ai-chat-mutations.hook";
import { useOptimisticMessage } from "./use-optimistic-message.hook";
import { useRequestDataBuilder } from "./use-request-data-builder.hook";
import { useTyping } from "./use-typing.hook";

import type { ChannelMessageDto } from "../../../../shared/types/domains/projects/channel-message.types";

interface UseChannelChatSendProps {
  channelId: string;
  llmProviderId?: string;
  authorId: string;
  authorName: string;
  aiName?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  includeHistory?: boolean;
  historyLimit?: number;
}

export function useChannelChatSend(props: UseChannelChatSendProps) {
  const { setTyping } = useTyping(props.channelId);
  const mutations = useAiChatMutations(props.channelId);
  const config = useAiChatConfig(props);
  const { createOptimisticMessage } = useOptimisticMessage(props);
  const { createRequestData } = useRequestDataBuilder({
    ...props,
    propsRef: config.propsRef,
  });

  return {
    mutations,
    setTyping,
    createOptimisticMessage,
    createRequestData,
  };
}
