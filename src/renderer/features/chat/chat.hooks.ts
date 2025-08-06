import { useChatContext } from "./chat.context";

export function useChatInputState() {
  const { state } = useChatContext();
  return {
    loading: state.loading,
    history: state.history,
    historyIndex: state.historyIndex,
  };
}

export function useChatActions() {
  const { actions } = useChatContext();
  return {
    send: actions.send,
    navigateHistory: actions.navigateHistory,
    addMessage: actions.addMessage,
    updateMessage: actions.updateMessage,
    removeMessage: actions.removeMessage,
  };
}

export function useChatStatus() {
  const { state } = useChatContext();
  return {
    loading: state.loading,
    typing: state.typing,
    messageCount: state.messages.length,
    hasMessages: state.messages.length > 0,
    pendingCount: state.pendingMessages.size,
    autoScroll: state.autoScroll,
    historyIndex: state.historyIndex,
    historyLength: state.history.length,
  };
}

export function useChatRefs() {
  const { refs } = useChatContext();
  return refs;
}
