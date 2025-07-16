interface ChatMessage {
  id: string;
  content: string;
}

interface HookError extends Error {}

interface MessagesHook {
  messages: ChatMessage[];
  isLoading: boolean;
  error: HookError | null;
  clearError: () => void;
}

interface SendHookMutations {
  sendError: HookError | null;
  regenerateError: HookError | null;
  isSending: boolean;
  isRegenerating: boolean;
  clearMessages: () => void;
  regenerateMessage: () => void;
}

interface SendHook {
  mutations: SendHookMutations;
}

// TODO: Refine this type with specific chat configuration properties.
// This is a temporary placeholder to address @typescript-eslint/no-explicit-any
// if Record<string, unknown> is being flagged as too broad or implicitly 'any'.
type TemporaryChatConfig = Record<string, unknown>;

interface ConfigHook {
  currentConfig: ChatConfig;
  updateConfig: (newConfig: ChatConfig) => void;
}

interface UtilitiesHook {}

export function useChannelChatResult(
  messagesHook: MessagesHook,
  sendHook: SendHook,
  isTyping: boolean,
  setTyping: (value: boolean) => void,
  sendMessage: (message: string) => void,
  config: ConfigHook,
  utilities: UtilitiesHook,
) {
  const error =
    messagesHook.error ||
    sendHook.mutations.sendError ||
    sendHook.mutations.regenerateError;

  return {
    messages: messagesHook.messages,
    isLoading: messagesHook.isLoading,
    isSending: sendHook.mutations.isSending,
    isRegenerating: sendHook.mutations.isRegenerating,
    error,
    isTyping,
    sendMessage,
    clearError: messagesHook.clearError,
    setTyping,
    currentConfig: config.currentConfig,
    updateConfig: config.updateConfig,
    ...utilities,
    clearAIMessages: sendHook.mutations.clearMessages,
    regenerateLastMessage: sendHook.mutations.regenerateMessage,
  };
}
