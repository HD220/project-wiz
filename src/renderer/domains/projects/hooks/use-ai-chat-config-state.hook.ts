import { useRef } from "react";

interface UseAiChatConfigProps {
  channelId: string;
  llmProviderId?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  includeHistory?: boolean;
  historyLimit?: number;
}

export function useAiChatConfigState(props: UseAiChatConfigProps) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const updateConfig = (newConfig: Partial<UseAiChatConfigProps>) => {
    propsRef.current = { ...propsRef.current, ...newConfig };
  };

  return {
    propsRef,
    updateConfig,
  };
}
