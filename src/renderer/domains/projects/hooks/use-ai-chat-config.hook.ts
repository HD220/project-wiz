import { useMemo, useRef } from 'react';
import type { AIChatConfigDto } from '../../../../shared/types/domains/projects/channel-message.types';

interface UseAiChatConfigProps {
  channelId: string;
  llmProviderId?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  includeHistory?: boolean;
  historyLimit?: number;
}

export function useAiChatConfig(props: UseAiChatConfigProps) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const currentConfig: AIChatConfigDto | null = useMemo(
    () =>
      props.llmProviderId
        ? {
            channelId: props.channelId,
            llmProviderId: props.llmProviderId,
            systemPrompt: props.systemPrompt,
            temperature: props.temperature || 0.7,
            maxTokens: props.maxTokens || 1000,
            includeHistory: props.includeHistory ?? true,
            historyLimit: props.historyLimit || 10,
          }
        : null,
    [
      props.channelId,
      props.llmProviderId,
      props.systemPrompt,
      props.temperature,
      props.maxTokens,
      props.includeHistory,
      props.historyLimit,
    ]
  );

  const updateConfig = (newConfig: Partial<UseAiChatConfigProps>) => {
    propsRef.current = { ...propsRef.current, ...newConfig };
  };

  return {
    currentConfig,
    propsRef,
    updateConfig,
  };
}