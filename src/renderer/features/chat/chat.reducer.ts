// Chat state and action types
export type ChatState = {
  messages: unknown[];
  loading: boolean;
  typing: boolean;
  history: string[];
  historyIndex: number;
  autoScroll: boolean;
  pendingMessages: Set<string | number>;
};

export type ChatAction =
  | { type: "ADD_MESSAGE"; payload: unknown }
  | {
      type: "UPDATE_MESSAGE";
      payload: {
        id: string | number;
        updates: Record<string, unknown>;
      };
    }
  | {
      type: "REMOVE_MESSAGE";
      payload: {
        id: string | number;
      };
    }
  | { type: "SET_MESSAGES"; payload: unknown[] }
  | { type: "SET_PROPERTY"; payload: { key: keyof ChatState; value: any } }
  | { type: "ADD_PENDING"; payload: string | number }
  | { type: "REMOVE_PENDING"; payload: string | number }
  | { type: "CLEAR"; payload?: undefined }
  | { type: "NAVIGATE_HISTORY"; payload: "up" | "down" };

// Factory function para reducer com keyFn via closure
export function createChatReducer(
  keyFn: (item: unknown, index: number) => string | number,
) {
  return function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
      case "ADD_MESSAGE":
        return {
          ...state,
          messages: [...state.messages, action.payload],
        };

      case "UPDATE_MESSAGE": {
        const { id, updates } = action.payload;
        return {
          ...state,
          messages: state.messages.map((msg) => {
            const msgId = keyFn(msg, state.messages.indexOf(msg));
            return msgId === id
              ? { ...(msg as Record<string, unknown>), ...updates }
              : msg;
          }),
        };
      }

      case "REMOVE_MESSAGE": {
        const { id } = action.payload;
        const newPendingMessages = new Set(state.pendingMessages);
        newPendingMessages.delete(id);

        return {
          ...state,
          messages: state.messages.filter((msg) => {
            const msgId = keyFn(msg, state.messages.indexOf(msg));
            return msgId !== id;
          }),
          pendingMessages: newPendingMessages,
        };
      }

      case "SET_MESSAGES":
        return {
          ...state,
          messages: action.payload,
        };

      case "SET_PROPERTY":
        return {
          ...state,
          [action.payload.key]: action.payload.value,
        };

      case "ADD_PENDING": {
        const newPendingMessages = new Set(state.pendingMessages);
        newPendingMessages.add(action.payload);
        return {
          ...state,
          pendingMessages: newPendingMessages,
        };
      }

      case "REMOVE_PENDING": {
        const newPendingMessages = new Set(state.pendingMessages);
        newPendingMessages.delete(action.payload);
        return {
          ...state,
          pendingMessages: newPendingMessages,
        };
      }

      case "CLEAR":
        return {
          ...state,
          messages: [],
          historyIndex: -1,
          pendingMessages: new Set(),
        };

      case "NAVIGATE_HISTORY": {
        const newIndex =
          action.payload === "up"
            ? Math.min(state.historyIndex + 1, state.history.length - 1)
            : Math.max(state.historyIndex - 1, -1);
        return {
          ...state,
          historyIndex: newIndex,
        };
      }

      default:
        return state;
    }
  };
}
