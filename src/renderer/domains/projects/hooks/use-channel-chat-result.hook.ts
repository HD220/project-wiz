export function useChannelChatResult(
  messagesHook: any,
  sendHook: any,
  isTyping: boolean,
  setTyping: any,
  sendMessage: any,
  config: any,
  utilities: any,
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
