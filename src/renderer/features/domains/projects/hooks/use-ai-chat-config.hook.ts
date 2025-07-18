import { useAiChatConfigBuilder } from "./use-ai-chat-config-builder.hook";
import { useAiChatConfigState } from "./use-ai-chat-config-state.hook";

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
  const builder = useAiChatConfigBuilder(props);
  const state = useAiChatConfigState(props);

  return {
    currentConfig: builder.currentConfig,
    propsRef: state.propsRef,
    updateConfig: state.updateConfig,
  };
}
