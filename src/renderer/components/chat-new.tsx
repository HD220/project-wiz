import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { ScrollArea } from "@/renderer/components/ui/scroll-area";
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

// Utility types para ChatStatus - DRY principle
type ChatStatusUI = { loading: boolean; typing: boolean };
type ChatStatusStats = {
  messageCount: number;
  hasMessages: boolean;
  pendingCount: number;
};
type ChatStatusControl = { autoScroll: boolean };
type ChatStatusHistory = { index: number; length: number; input: string };

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
  | { type: "SET_PROPERTY"; payload: { key: keyof ChatState; value: any } }
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
          history:
            state.input && !state.history.includes(state.input)
              ? [...state.history, state.input].slice(-50)
              : state.history,
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
    input: "",
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
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [state.autoScroll]);

  // Helper para complex actions com callbacks
  const createAction =
    (
      actionType: ChatAction["type"],
      payloadFn: (...args: any[]) => any,
      messageCalculator?: (messages: unknown[], ...args: any[]) => unknown[],
      callback?: (contextValue: ChatContextValue, ...args: any[]) => void,
    ) =>
    (...args: any[]) => {
      dispatch({ type: actionType, payload: payloadFn(...args) });
      if (messageCalculator) {
        const newMessages = messageCalculator(messages, ...args);
        onValueChange?.(newMessages);
      }
      if (callback) {
        callback(contextValue, ...args); // contextValue será definido abaixo
      }
    };

  // Actions simplificadas usando helper centralizado
  const actions = {
    addMessage: createAction(
      "ADD_MESSAGE",
      (message: unknown) => message,
      (msgs, message: unknown) => [...msgs, message],
    ),

    updateMessage: createAction(
      "UPDATE_MESSAGE",
      (id: string | number, updates: Record<string, unknown>) => ({
        id,
        updates,
      }),
      (msgs, id: string | number, updates: Record<string, unknown>) => {
        return msgs.map((msg) => {
          const msgId = keyFn(msg, msgs.indexOf(msg));
          return msgId === id
            ? { ...(msg as Record<string, unknown>), ...updates }
            : msg;
        });
      },
      (ctx, id: string | number, updates: Record<string, unknown>) => {
        onMessageUpdate?.(id, updates, ctx);
      },
    ),

    removeMessage: createAction(
      "REMOVE_MESSAGE",
      (id: string | number) => ({ id }),
      (msgs, id: string | number) => {
        return msgs.filter((msg) => {
          const msgId = keyFn(msg, msgs.indexOf(msg));
          return msgId !== id;
        });
      },
      (ctx, id: string | number) => {
        onMessageRemove?.(id, ctx);
      },
    ),

    setMessages: createAction(
      "SET_MESSAGES",
      (messagesOrFn: unknown[] | ((prev: unknown[]) => unknown[])) => {
        return typeof messagesOrFn === "function"
          ? messagesOrFn(messages)
          : messagesOrFn;
      },
      (msgs, messagesOrFn: unknown[] | ((prev: unknown[]) => unknown[])) => {
        return typeof messagesOrFn === "function"
          ? messagesOrFn(msgs)
          : messagesOrFn;
      },
    ),

    setInput: (input: string) =>
      dispatch({
        type: "SET_PROPERTY",
        payload: { key: "input", value: input },
      }),
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

    send: (customInput?: string) => {
      const inputToSend = customInput ?? state.input.trim();
      if (onSend && inputToSend && !state.loading && !disabled) {
        // contextValue will be defined below
        onSend(inputToSend, contextValue);
      }
    },

    clear: createAction(
      "CLEAR",
      () => undefined,
      () => [],
      (ctx) => onClear?.(ctx),
    ),

    isPending: (id: string | number) => state.pendingMessages.has(id),
    navigateHistory: (direction: "up" | "down") =>
      dispatch({ type: "NAVIGATE_HISTORY", payload: direction }),
    scrollToBottom,
  };

  // Context construction simplificada - definição direta sem mutação
  const contextValue: ChatContextValue = {
    state: { ...state, messages },
    actions,
    refs: { messagesRef, inputRef },
    keyFn,
  };

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

interface ChatMessagesProps extends React.ComponentProps<typeof ScrollArea> {
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
    <ScrollArea
      data-slot="chat-messages"
      className={cn(
        "flex-1 p-0 will-change-scroll contain-layout contain-style",
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
    </ScrollArea>
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
    send: (value?: string) => void;
    navigateHistory: (direction: "up" | "down") => void;
    clear: () => void;
    // Ref específica (apenas inputRef)
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  }) => React.ReactNode;
}

function ChatInput({ render }: ChatInputProps) {
  const context = useChatContext();
  const { state, actions, refs } = context;

  // Objeto consolidado focado no input
  const chatInput = {
    // State específico do input
    value: state.input,
    loading: state.loading,
    history: state.history,
    historyIndex: state.historyIndex,
    // Actions específicas do input
    setValue: actions.setInput,
    send: actions.send,
    navigateHistory: actions.navigateHistory,
    clear: () => actions.setInput(""),
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
      input: state.input,
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
