import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/renderer/lib/utils";

// Types for reducer
type ChatState = {
  messages: unknown[];
  input: string;
  loading: boolean;
  typing: boolean;
  history: string[];
  historyIndex: number;
  autoScroll: boolean;
  pendingMessages: Set<string | number>;
};

// Utility types to reduce duplication
type ChatActions = {
  addMessage: (message: unknown) => void;
  updateMessage: (
    id: string | number,
    updates: Record<string, unknown>,
  ) => void;
  removeMessage: (id: string | number) => void;
  setMessages: (messages: unknown[] | ((prev: unknown[]) => unknown[])) => void;
  setInput: (input: string) => void;
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  setAutoScroll: (autoScroll: boolean) => void;
  addPendingMessage: (id: string | number) => void;
  removePendingMessage: (id: string | number) => void;
  send: (input?: string) => void;
  clear: () => void;
  navigateHistory: (direction: "up" | "down") => void;
  scrollToBottom: () => void;
  isPending: (id: string | number) => boolean;
};

type ChatRefs = {
  messagesRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
};

type ChatStatus = {
  loading: boolean;
  typing: boolean;
  messageCount: number;
  hasMessages: boolean;
  pendingCount: number;
  input: string;
  autoScroll: boolean;
  historyIndex: number;
  historyLength: number;
};

type ChatAction =
  | { type: "ADD_MESSAGE"; payload: unknown }
  | {
      type: "UPDATE_MESSAGE";
      payload: {
        id: string | number;
        updates: Record<string, unknown>;
        keyFn: (item: unknown, index: number) => string | number;
      };
    }
  | {
      type: "REMOVE_MESSAGE";
      payload: {
        id: string | number;
        keyFn: (item: unknown, index: number) => string | number;
      };
    }
  | { type: "SET_MESSAGES"; payload: unknown[] }
  | { type: "SET_INPUT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_TYPING"; payload: boolean }
  | { type: "SET_AUTO_SCROLL"; payload: boolean }
  | { type: "TOGGLE_PENDING"; payload: string | number }
  | { type: "CLEAR"; payload?: undefined }
  | { type: "NAVIGATE_HISTORY"; payload: "up" | "down" };

// Consolidated reducer - replaces complex setState logic
function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.payload],
        history:
          state.input && !state.history.includes(state.input)
            ? [...state.history, state.input].slice(-50)
            : state.history,
      };

    case "UPDATE_MESSAGE": {
      const { id, updates, keyFn } = action.payload;
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
      const { id, keyFn } = action.payload;
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

    case "SET_INPUT":
      return {
        ...state,
        input: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_TYPING":
      return {
        ...state,
        typing: action.payload,
      };

    case "SET_AUTO_SCROLL":
      return {
        ...state,
        autoScroll: action.payload,
      };

    case "TOGGLE_PENDING": {
      const newPendingMessages = new Set(state.pendingMessages);
      if (newPendingMessages.has(action.payload)) {
        newPendingMessages.delete(action.payload);
      } else {
        newPendingMessages.add(action.payload);
      }
      return {
        ...state,
        pendingMessages: newPendingMessages,
      };
    }

    case "CLEAR":
      return {
        ...state,
        messages: [],
        input: "",
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
        input:
          newIndex >= 0
            ? state.history[state.history.length - 1 - newIndex] || ""
            : "",
      };
    }

    default:
      return state;
  }
}

type ChatContextValue = {
  state: ChatState;
  actions: ChatActions;
  refs: ChatRefs;
  keyFn: (item: unknown, index: number) => string | number;
};

const ChatContext = React.createContext<ChatContextValue | null>(null);

function useChatContext(): ChatContextValue {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a <Chat /> component");
  }
  return context;
}

const chatVariants = cva("flex h-full flex-col bg-background text-foreground", {
  variants: {
    variant: {
      default: "border border-input rounded-md shadow-xs",
      ghost: "",
      bordered: "border-2 border-input rounded-lg shadow-sm",
      filled: "bg-muted/30 border-0 rounded-lg",
    },
    size: {
      default: "min-h-[400px]",
      sm: "min-h-[300px]",
      lg: "min-h-[600px]",
      xl: "min-h-[800px]",
      full: "h-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface ChatProps extends Omit<React.ComponentProps<"div">, "defaultValue"> {
  children: React.ReactNode;
  keyFn: (item: unknown, index: number) => string | number;
  value?: unknown[];
  defaultValue?: unknown[];
  onValueChange?: (messages: unknown[]) => void;
  onSend?: (input: string, context: ChatContextValue) => void;
  onMessageUpdate?: (
    id: string | number,
    updates: Record<string, unknown>,
    context: ChatContextValue,
  ) => void;
  onMessageRemove?: (id: string | number, context: ChatContextValue) => void;
  onClear?: (context: ChatContextValue) => void;
  variant?: VariantProps<typeof chatVariants>["variant"];
  size?: VariantProps<typeof chatVariants>["size"];
  disabled?: boolean;
}

function Chat({
  className,
  children,
  value,
  defaultValue = [],
  onValueChange,
  onSend,
  onMessageUpdate,
  onMessageRemove,
  onClear,
  keyFn,
  variant,
  size,
  disabled = false,
  ...props
}: ChatProps) {
  const messagesRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const initialState: ChatState = {
    messages: value || defaultValue,
    input: "",
    loading: false,
    typing: false,
    history: [],
    historyIndex: -1,
    autoScroll: true,
    pendingMessages: new Set<string | number>(),
  };

  const [state, dispatch] = React.useReducer(chatReducer, initialState);

  // Controlled/uncontrolled pattern
  const messages = value !== undefined ? value : state.messages;

  React.useEffect(() => {
    if (value !== undefined) {
      dispatch({ type: "SET_MESSAGES", payload: value });
    }
  }, [value]);

  const scrollToBottom = React.useCallback(() => {
    if (messagesRef.current && state.autoScroll) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [state.autoScroll]);

  // React Compiler optimizes - no useMemo needed
  // Define contextValue first so it can be used in actions
  const contextValue: ChatContextValue = {
    state: { ...state, messages },
    actions: {} as any, // Will be filled after actions definition
    refs: { messagesRef, inputRef },
    keyFn,
  };

  // Simplified actions using dispatch - React Compiler optimizes
  const actions = {
    addMessage: (message: unknown) => {
      dispatch({ type: "ADD_MESSAGE", payload: message });
      const newMessages = [...messages, message];
      onValueChange?.(newMessages);
    },

    updateMessage: (id: string | number, updates: Record<string, unknown>) => {
      dispatch({ type: "UPDATE_MESSAGE", payload: { id, updates, keyFn } });
      const newMessages = messages.map((msg) => {
        const msgId = keyFn(msg, messages.indexOf(msg));
        return msgId === id
          ? { ...(msg as Record<string, unknown>), ...updates }
          : msg;
      });
      onValueChange?.(newMessages);
      // contextValue will be defined below
      onMessageUpdate?.(id, updates, contextValue);
    },

    removeMessage: (id: string | number) => {
      dispatch({ type: "REMOVE_MESSAGE", payload: { id, keyFn } });
      const newMessages = messages.filter((msg) => {
        const msgId = keyFn(msg, messages.indexOf(msg));
        return msgId !== id;
      });
      onValueChange?.(newMessages);
      // contextValue will be defined below
      onMessageRemove?.(id, contextValue);
    },

    setMessages: (
      messagesOrFn: unknown[] | ((prev: unknown[]) => unknown[]),
    ) => {
      const newMessages =
        typeof messagesOrFn === "function"
          ? messagesOrFn(messages)
          : messagesOrFn;
      dispatch({ type: "SET_MESSAGES", payload: newMessages });
      onValueChange?.(newMessages);
    },

    setInput: (input: string) =>
      dispatch({ type: "SET_INPUT", payload: input }),
    setLoading: (loading: boolean) =>
      dispatch({ type: "SET_LOADING", payload: loading }),
    setTyping: (typing: boolean) =>
      dispatch({ type: "SET_TYPING", payload: typing }),
    setAutoScroll: (autoScroll: boolean) =>
      dispatch({ type: "SET_AUTO_SCROLL", payload: autoScroll }),

    addPendingMessage: (id: string | number) =>
      dispatch({ type: "TOGGLE_PENDING", payload: id }),
    removePendingMessage: (id: string | number) =>
      dispatch({ type: "TOGGLE_PENDING", payload: id }),

    send: (customInput?: string) => {
      const inputToSend = customInput ?? state.input.trim();
      if (onSend && inputToSend && !state.loading && !disabled) {
        // contextValue will be defined below
        onSend(inputToSend, contextValue);
      }
    },

    clear: () => {
      dispatch({ type: "CLEAR" });
      onValueChange?.([]);
      // contextValue will be defined below
      onClear?.(contextValue);
    },

    isPending: (id: string | number) => state.pendingMessages.has(id),
    navigateHistory: (direction: "up" | "down") =>
      dispatch({ type: "NAVIGATE_HISTORY", payload: direction }),
    scrollToBottom,
  };

  // Update contextValue with the actual actions
  contextValue.actions = actions;

  // Auto scroll when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  return (
    <ChatContext.Provider value={contextValue}>
      <div
        data-slot="chat"
        className={cn(
          chatVariants({ variant, size }),
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
        role="log"
        aria-label="Chat conversation"
        aria-live="polite"
        aria-disabled={disabled}
        {...props}
      >
        {children}
      </div>
    </ChatContext.Provider>
  );
}

interface ChatMessagesProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

function ChatMessages({ className, children, ...props }: ChatMessagesProps) {
  const context = useChatContext();
  const { refs, actions, state } = context;

  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

      if (!isAtBottom && state.autoScroll) {
        actions.setAutoScroll(false);
      } else if (isAtBottom && !state.autoScroll) {
        actions.setAutoScroll(true);
      }
    },
    [state.autoScroll, actions],
  );

  return (
    <div
      data-slot="chat-messages"
      className={cn(
        "flex-1 overflow-y-auto p-0 will-change-scroll contain-layout contain-style",
        className,
      )}
      {...props}
    >
      <div
        ref={refs.messagesRef}
        data-slot="chat-messages-container"
        className="flex flex-col space-y-1 min-h-full contain-layout contain-style will-change-scroll transform-gpu"
        onScroll={handleScroll}
        role="log"
        aria-label="Messages"
        aria-live="polite"
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}

interface ChatMessageProps {
  messageData: unknown;
  messageIndex: number;
  render: (
    messageData: unknown,
    chatState: ChatState,
    chatActions: ChatActions,
    messageIndex: number,
  ) => React.ReactNode;
}

function ChatMessage({ messageData, messageIndex, render }: ChatMessageProps) {
  const context = useChatContext();
  const { state, actions } = context;

  return render(messageData, state, actions, messageIndex);
}

interface ChatInputProps {
  render: (
    inputState: {
      value: string;
      loading: boolean;
      history: string[];
      historyIndex: number;
    },
    inputActions: {
      setValue: (value: string) => void;
      send: (value?: string) => void;
      navigateHistory: (direction: "up" | "down") => void;
      clear: () => void;
    },
    inputRefs: ChatRefs,
  ) => React.ReactNode;
}

function ChatInput({ render }: ChatInputProps) {
  const context = useChatContext();
  const { state, actions, refs } = context;
  const inputState = {
    value: state.input,
    loading: state.loading,
    history: state.history,
    historyIndex: state.historyIndex,
  };

  const inputActions = {
    setValue: actions.setInput,
    send: actions.send,
    navigateHistory: actions.navigateHistory,
    clear: () => actions.setInput(""),
  };

  const inputRefs: ChatRefs = refs;

  return render(inputState, inputActions, inputRefs);
}

interface ChatStatusProps {
  render: (status: ChatStatus) => React.ReactNode;
  showWhen?: (
    status: Omit<ChatStatus, "autoScroll" | "historyIndex" | "historyLength">,
  ) => boolean;
}

function ChatStatus({ render, showWhen }: ChatStatusProps) {
  const context = useChatContext();
  const { state } = context;

  // React Compiler optimizes - no useMemo needed
  const status: ChatStatus = {
    loading: state.loading,
    typing: state.typing,
    messageCount: state.messages.length,
    hasMessages: state.messages.length > 0,
    pendingCount: state.pendingMessages.size,
    input: state.input,
    autoScroll: state.autoScroll,
    historyIndex: state.historyIndex,
    historyLength: state.history.length,
  };

  const shouldShow = showWhen ? showWhen(status) : true;

  if (!shouldShow) {
    return null;
  }

  return render(status);
}

// Optional hooks for power users - not required for basic usage
export function useChatInputState() {
  const { state } = useChatContext();
  return {
    value: state.input,
    loading: state.loading,
    history: state.history,
    historyIndex: state.historyIndex,
  };
}

export function useChatActions() {
  const { actions } = useChatContext();
  return {
    setValue: actions.setInput,
    send: actions.send,
    navigateHistory: actions.navigateHistory,
    clear: () => actions.setInput(""),
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
    input: state.input,
    autoScroll: state.autoScroll,
    historyIndex: state.historyIndex,
    historyLength: state.history.length,
  };
}

export function useChatRefs() {
  const { refs } = useChatContext();
  return refs;
}

export {
  Chat,
  ChatMessages,
  ChatMessage,
  ChatInput,
  ChatStatus,
  useChatContext,
  chatVariants,
  type ChatProps,
  type ChatMessagesProps,
  type ChatMessageProps,
  type ChatInputProps,
  type ChatStatusProps,
  type ChatContextValue,
};
