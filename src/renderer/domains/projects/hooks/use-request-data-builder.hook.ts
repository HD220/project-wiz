import { useCallback, type MutableRefObject } from "react";

import type {
  AISendMessageRequestDto,
  AIChatConfigDto,
} from "../../../../shared/types/domains/projects/channel-message.types";

interface UseRequestDataBuilderProps {
  channelId: string;
  llmProviderId?: string;
  authorId: string;
  authorName: string;
  aiName?: string;
  propsRef: MutableRefObject<AIChatConfigDto>;
}

export function useRequestDataBuilder(props: UseRequestDataBuilderProps) {
  const createRequestData = useCallback(
    (
      content: string,
      customConfig?: Partial<AIChatConfigDto>,
    ): AISendMessageRequestDto => {
      const currentConfigValue = props.propsRef.current;
      return {
        content: content.trim(),
        channelId: props.channelId,
        llmProviderId:
          customConfig?.llmProviderId ||
          props.llmProviderId ||
          currentConfigValue.llmProviderId,
        authorId: props.authorId,
        authorName: props.authorName,
        aiName: props.aiName,
        systemPrompt:
          customConfig?.systemPrompt || currentConfigValue.systemPrompt,
        temperature:
          customConfig?.temperature || currentConfigValue.temperature,
        maxTokens: customConfig?.maxTokens || currentConfigValue.maxTokens,
        includeHistory:
          customConfig?.includeHistory ?? currentConfigValue.includeHistory,
        historyLimit:
          customConfig?.historyLimit || currentConfigValue.historyLimit,
      };
    },
    [props],
  );

  return { createRequestData };
}
