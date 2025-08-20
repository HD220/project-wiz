import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { cn } from "@/renderer/lib/utils";

// Types for reducer - input moved to local state
type ChatState = {
  messages: unknown[];
  loading: boolean;
  typing: boolean;
  history: string[];
  historyIndex: number;
  autoScroll: boolean;
  pendingMessages: Set<string | number>;
};

// Utility types to reduce duplication - input actions removed
type ChatActions = {
  addMessage: (message: unknown) => void;
  updateMessage: (
    id: string | number,
    updates: Record<string, unknown>,
  ) => void;
  removeMessage: (id: string | number) => void;
  setMessages: (messages: unknown[] | ((prev: unknown[]) => unknown[])) => void;
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  setAutoScroll: (autoScroll: boolean) => void;
  addPendingMessage: (id: string | number) => void;
  removePendingMessage: (id: string | number) => void;
  send: (input: string) => void;
  clear: () => void;
  navigateHistory: (direction: "up" | "down") => void;
  scrollToBottom: () => void;
  isPending: (id: string | number) => boolean;
};

type ChatRefs = {
  messagesRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
};

// Utility types para ChatStatus - DRY principle
type ChatStatusUI = { loading: boolean; typing: boolean };
type ChatStatusStats = {
  messageCount: number;
  hasMessages: boolean;
  pendingCount: number;
};
type ChatStatusControl = { autoScroll: boolean };
type ChatStatusHistory = { index: number; length: number };

type ChatAction =
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
  | { type: "SET_PROPERTY"; payload: { key: keyof ChatState; value: unknown } }
  | { type: "ADD_PENDING"; payload: string | number }
  | { type: "REMOVE_PENDING"; payload: string | number }
  | { type: "CLEAR"; payload?: undefined }
  | { type: "NAVIGATE_HISTORY"; payload: "up" | "down" };

// Factory function para reducer com keyFn via closure
function createChatReducer(
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
              ? { ...(msg && typeof msg === "object" ? msg : {}), ...updates }
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
    loading: false,
    typing: false,
    history: [],
    historyIndex: -1,
    autoScroll: true,
    pendingMessages: new Set<string | number>(),
  };

  const [state, dispatch] = React.useReducer(
    createChatReducer(keyFn),
    initialState,
  );

  // Controlled/uncontrolled pattern
  const messages = value !== undefined ? value : state.messages;

  React.useEffect(() => {
    if (value !== undefined) {
      dispatch({ type: "SET_MESSAGES", payload: value });
    }
  }, [value]);

  const scrollToBottom = React.useCallback(() => {
    if (messagesRef.current && state.autoScroll) {
      // Use async scrolling for dynamic content as recommended by Radix
      setTimeout(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [state.autoScroll]);

  // Actions simplificadas usando helper centralizado - memoized for performance
  const actions = React.useMemo(
    () => ({
      addMessage: (message: unknown) => {
        dispatch({ type: "ADD_MESSAGE", payload: message });
        if (onValueChange) {
          const newMessages = [...messages, message];
          onValueChange(newMessages);
        }
      },

      updateMessage: (
        id: string | number,
        updates: Record<string, unknown>,
      ) => {
        dispatch({ type: "UPDATE_MESSAGE", payload: { id, updates } });
        if (onValueChange) {
          const newMessages = messages.map((msg) => {
            const msgId = keyFn(msg, messages.indexOf(msg));
            return msgId === id
              ? { ...(msg && typeof msg === "object" ? msg : {}), ...updates }
              : msg;
          });
          onValueChange(newMessages);
        }
      },

      removeMessage: (id: string | number) => {
        dispatch({ type: "REMOVE_MESSAGE", payload: { id } });
        if (onValueChange) {
          const newMessages = messages.filter((msg) => {
            const msgId = keyFn(msg, messages.indexOf(msg));
            return msgId !== id;
          });
          onValueChange(newMessages);
        }
      },

      setMessages: (
        messagesOrFn: unknown[] | ((prev: unknown[]) => unknown[]),
      ) => {
        const newMessages =
          typeof messagesOrFn === "function"
            ? messagesOrFn(messages)
            : messagesOrFn;
        dispatch({ type: "SET_MESSAGES", payload: newMessages });
        if (onValueChange) {
          onValueChange(newMessages);
        }
      },

      setLoading: (loading: boolean) =>
        dispatch({
          type: "SET_PROPERTY",
          payload: { key: "loading", value: loading },
        }),
      setTyping: (typing: boolean) =>
        dispatch({
          type: "SET_PROPERTY",
          payload: { key: "typing", value: typing },
        }),
      setAutoScroll: (autoScroll: boolean) =>
        dispatch({
          type: "SET_PROPERTY",
          payload: { key: "autoScroll", value: autoScroll },
        }),

      addPendingMessage: (id: string | number) =>
        dispatch({ type: "ADD_PENDING", payload: id }),
      removePendingMessage: (id: string | number) =>
        dispatch({ type: "REMOVE_PENDING", payload: id }),

      send: (_input: string) => {
        // This will be overridden with proper contextValue later
      },

      clear: () => {
        dispatch({ type: "CLEAR" });
        if (onValueChange) {
          onValueChange([]);
        }
      },

      isPending: (id: string | number) => state.pendingMessages.has(id),
      navigateHistory: (direction: "up" | "down") =>
        dispatch({ type: "NAVIGATE_HISTORY", payload: direction }),
      scrollToBottom,
    }),
    [
      messages,
      keyFn,
      onValueChange,
      state.pendingMessages,
      scrollToBottom,
      dispatch,
    ],
  );

  // Context construction simplificada - memoized for stability
  const contextValue: ChatContextValue = React.useMemo(() => {
    const ctx: ChatContextValue = {
      state: { ...state, messages },
      actions: {
        ...actions,
        send: (input: string) => {
          if (onSend && input && input.trim() && !state.loading && !disabled) {
            onSend(input.trim(), ctx);
          }
        },
        updateMessage: (
          id: string | number,
          updates: Record<string, unknown>,
        ) => {
          actions.updateMessage(id, updates);
          if (onMessageUpdate) {
            onMessageUpdate(id, updates, ctx);
          }
        },
        removeMessage: (id: string | number) => {
          actions.removeMessage(id);
          if (onMessageRemove) {
            onMessageRemove(id, ctx);
          }
        },
        clear: () => {
          actions.clear();
          if (onClear) {
            onClear(ctx);
          }
        },
      },
      refs: { messagesRef, inputRef },
      keyFn,
    };
    return ctx;
  }, [
    state,
    messages,
    actions,
    keyFn,
    onSend,
    onMessageUpdate,
    onMessageRemove,
    onClear,
    disabled,
  ]);

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

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollViewportRef = React.useRef<HTMLDivElement | null>(null);

  // Find and setup viewport ref after mount
  React.useEffect(() => {
    if (containerRef.current) {
      // Find the viewport element inside ScrollArea using querySelector
      const viewport = containerRef.current.querySelector(
        '[data-slot="scroll-area-viewport"]',
      );
      if (viewport) {
        scrollViewportRef.current = viewport as HTMLDivElement;

        // Update the chat context ref to point to viewport for scrolling
        if (refs.messagesRef) {
          refs.messagesRef.current = viewport as HTMLDivElement;
        }
      }
    }
  }, [refs.messagesRef]);

  // Handle scroll events on the ScrollArea viewport
  React.useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;

      if (!isAtBottom && state.autoScroll) {
        actions.setAutoScroll(false);
      } else if (isAtBottom && !state.autoScroll) {
        actions.setAutoScroll(true);
      }
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [state.autoScroll, actions]);

  return (
    <div
      ref={containerRef}
      className={cn("flex-1 min-h-0", className)}
      {...props}
    >
      <ScrollArea className="h-full">
        <div
          data-slot="chat-messages-container"
          className="flex flex-col space-y-1 p-4"
          role="log"
          aria-label="Messages"
          aria-live="polite"
        >
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ChatMessageProps {
  messageData: unknown;
  messageIndex: number;
  render: (message: {
    data: unknown;
    index: number;
    // Actions específicas da mensagem
    update: (updates: Record<string, unknown>) => void;
    remove: () => void;
    isPending: boolean;
    // Estado mínimo para feedback visual
    chatLoading: boolean;
    chatTyping: boolean;
  }) => React.ReactNode;
}

function ChatMessage({ messageData, messageIndex, render }: ChatMessageProps) {
  const context = useChatContext();
  const { state, actions, keyFn } = context;

  // Cálculo direto do messageId - React Compiler otimiza
  const messageId = keyFn(messageData, messageIndex);

  // Objeto focado apenas no que uma mensagem precisa
  const message = {
    data: messageData,
    index: messageIndex,
    // Actions específicas da mensagem com messageId pré-calculado
    update: (updates: Record<string, unknown>) =>
      actions.updateMessage(messageId, updates),
    remove: () => actions.removeMessage(messageId),
    isPending: actions.isPending(messageId),
    // Estado mínimo para feedback visual
    chatLoading: state.loading,
    chatTyping: state.typing,
  };

  return render(message);
}

interface ChatInputProps {
  render: (chatInput: {
    // State específico do input
    value: string;
    loading: boolean;
    history: string[];
    historyIndex: number;
    // Actions específicas do input
    setValue: (value: string) => void;
    send: () => void;
    navigateHistory: (direction: "up" | "down") => void;
    clear: () => void;
    // Ref específica (apenas inputRef)
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  }) => React.ReactNode;
}

function ChatInput({ render }: ChatInputProps) {
  const context = useChatContext();
  const { state, actions, refs } = context;

  // LOCAL input state - this eliminates the lag!
  const [inputValue, setInputValue] = React.useState("");

  // Navigate history handler with local state
  const handleNavigateHistory = (direction: "up" | "down") => {
    const newIndex =
      direction === "up"
        ? Math.min(state.historyIndex + 1, state.history.length - 1)
        : Math.max(state.historyIndex - 1, -1);

    actions.navigateHistory(direction);

    // Update local input with history value
    if (newIndex >= 0) {
      const historyValue =
        state.history[state.history.length - 1 - newIndex] || "";
      setInputValue(historyValue);
    } else {
      setInputValue("");
    }
  };

  // Send handler that passes input to context
  const handleSend = () => {
    if (inputValue.trim()) {
      // Add to history before sending
      if (!state.history.includes(inputValue.trim())) {
        // This could be optimized but keeping functionality for now
      }
      actions.send(inputValue);
      setInputValue(""); // Clear after send
    }
  };

  // Objeto consolidado focado no input
  const chatInput = {
    // State específico do input - now local!
    value: inputValue,
    loading: state.loading,
    history: state.history,
    historyIndex: state.historyIndex,
    // Actions específicas do input
    setValue: setInputValue, // Local setter - NO MORE LAG!
    send: handleSend,
    navigateHistory: handleNavigateHistory,
    clear: () => setInputValue(""),
    // Ref específica (apenas inputRef)
    inputRef: refs.inputRef,
  };

  return render(chatInput);
}

interface ChatStatusProps {
  render: (status: {
    ui: ChatStatusUI;
    stats: ChatStatusStats;
    control: ChatStatusControl;
    history: ChatStatusHistory;
  }) => React.ReactNode;
  showWhen?: (status: { ui: ChatStatusUI; stats: ChatStatusStats }) => boolean;
}

function ChatStatus({ render, showWhen }: ChatStatusProps) {
  const context = useChatContext();
  const { state } = context;

  // React Compiler optimizes - no useMemo needed
  // Objetos segregados por responsabilidade
  const status = {
    ui: {
      loading: state.loading,
      typing: state.typing,
    },
    stats: {
      messageCount: state.messages.length,
      hasMessages: state.messages.length > 0,
      pendingCount: state.pendingMessages.size,
    },
    control: {
      autoScroll: state.autoScroll,
    },
    history: {
      index: state.historyIndex,
      length: state.history.length,
    },
  };

  const shouldShow = showWhen
    ? showWhen({ ui: status.ui, stats: status.stats })
    : true;

  if (!shouldShow) {
    return null;
  }

  return render(status);
}

// Optional hooks for power users - not required for basic usage
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
