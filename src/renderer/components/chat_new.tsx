import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/renderer/lib/utils";

type ChatContextValue = {
  state: {
    messages: unknown[];
    input: string;
    loading: boolean;
    typing: boolean;
    history: string[];
    historyIndex: number;
    autoScroll: boolean;
    pendingMessages: Set<string | number>;
  };
  actions: {
    addMessage: (message: unknown) => void;
    updateMessage: (
      id: string | number,
      updates: Record<string, unknown>,
    ) => void;
    removeMessage: (id: string | number) => void;
    setMessages: (
      messages: unknown[] | ((prev: unknown[]) => unknown[]),
    ) => void;
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
  refs: {
    messagesRef: React.RefObject<HTMLDivElement | null>;
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  };
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

  const [state, setState] = React.useState({
    messages: value || defaultValue,
    input: "",
    loading: false,
    typing: false,
    history: [] as string[],
    historyIndex: -1,
    autoScroll: true,
    pendingMessages: new Set<string | number>(),
  });

  // Controlled/uncontrolled pattern
  const messages = value !== undefined ? value : state.messages;

  React.useEffect(() => {
    if (value !== undefined) {
      setState((prev) => ({ ...prev, messages: value }));
    }
  }, [value]);

  const scrollToBottom = React.useCallback(() => {
    if (messagesRef.current && state.autoScroll) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [state.autoScroll]);

  const actions = React.useMemo(
    () => ({
      addMessage: (message: unknown) => {
        const newMessages = [...messages, message];
        setState((prev) => {
          const newHistory =
            prev.input && !prev.history.includes(prev.input)
              ? [...prev.history, prev.input].slice(-50)
              : prev.history;

          return {
            ...prev,
            messages: value === undefined ? newMessages : prev.messages,
            history: newHistory,
          };
        });
        onValueChange?.(newMessages);
      },
      updateMessage: (
        id: string | number,
        updates: Record<string, unknown>,
      ) => {
        const newMessages = messages.map((msg) => {
          const msgId = keyFn(msg, messages.indexOf(msg));
          return msgId === id
            ? { ...(msg as Record<string, unknown>), ...updates }
            : msg;
        });
        setState((prev) => ({
          ...prev,
          messages: value === undefined ? newMessages : prev.messages,
        }));
        onValueChange?.(newMessages);
        onMessageUpdate?.(id, updates, contextValue);
      },
      removeMessage: (id: string | number) => {
        const newMessages = messages.filter((msg) => {
          const msgId = keyFn(msg, messages.indexOf(msg));
          return msgId !== id;
        });
        setState((prev) => ({
          ...prev,
          messages: value === undefined ? newMessages : prev.messages,
          pendingMessages: new Set(
            [...prev.pendingMessages].filter((pid) => pid !== id),
          ),
        }));
        onValueChange?.(newMessages);
        onMessageRemove?.(id, contextValue);
      },
      setMessages: (
        messagesOrFn: unknown[] | ((prev: unknown[]) => unknown[]),
      ) => {
        const newMessages =
          typeof messagesOrFn === "function"
            ? messagesOrFn(messages)
            : messagesOrFn;
        setState((prev) => ({
          ...prev,
          messages: value === undefined ? newMessages : prev.messages,
        }));
        onValueChange?.(newMessages);
      },
      setInput: (input: string) => setState((prev) => ({ ...prev, input })),
      setLoading: (loading: boolean) =>
        setState((prev) => ({ ...prev, loading })),
      setTyping: (typing: boolean) => setState((prev) => ({ ...prev, typing })),
      setAutoScroll: (autoScroll: boolean) =>
        setState((prev) => ({ ...prev, autoScroll })),
      addPendingMessage: (id: string | number) =>
        setState((prev) => ({
          ...prev,
          pendingMessages: new Set([...prev.pendingMessages, id]),
        })),
      removePendingMessage: (id: string | number) =>
        setState((prev) => ({
          ...prev,
          pendingMessages: new Set(
            [...prev.pendingMessages].filter((pid) => pid !== id),
          ),
        })),
      send: (customInput?: string) => {
        const inputToSend = customInput ?? state.input.trim();
        if (onSend && inputToSend && !state.loading && !disabled) {
          onSend(inputToSend, contextValue);
        }
      },
      clear: () => {
        const newMessages: unknown[] = [];
        setState((prev) => ({
          ...prev,
          messages: value === undefined ? newMessages : prev.messages,
          input: "",
          historyIndex: -1,
          pendingMessages: new Set(),
        }));
        onValueChange?.(newMessages);
        onClear?.(contextValue);
      },
      isPending: (id: string | number) => state.pendingMessages.has(id),
      navigateHistory: (direction: "up" | "down") =>
        setState((prev) => {
          const newIndex =
            direction === "up"
              ? Math.min(prev.historyIndex + 1, prev.history.length - 1)
              : Math.max(prev.historyIndex - 1, -1);
          return {
            ...prev,
            historyIndex: newIndex,
            input:
              newIndex >= 0
                ? prev.history[prev.history.length - 1 - newIndex] || ""
                : "",
          };
        }),
      scrollToBottom,
    }),
    [
      messages,
      state.input,
      state.loading,
      state.history,
      state.historyIndex,
      onSend,
      onValueChange,
      onMessageUpdate,
      onMessageRemove,
      onClear,
      value,
      disabled,
      scrollToBottom,
      keyFn,
    ],
  );

  // Auto scroll when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const contextValue = React.useMemo<ChatContextValue>(
    () => ({
      state: { ...state, messages },
      actions,
      refs: { messagesRef, inputRef },
      keyFn,
    }),
    [state, messages, actions, keyFn],
  );

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
    chatState: {
      messages: unknown[];
      loading: boolean;
      typing: boolean;
      input: string;
      autoScroll: boolean;
      history: string[];
      historyIndex: number;
      pendingMessages: Set<string | number>;
    },
    chatActions: {
      addMessage: (message: unknown) => void;
      updateMessage: (
        id: string | number,
        updates: Record<string, unknown>,
      ) => void;
      removeMessage: (id: string | number) => void;
      setMessages: (
        messages: unknown[] | ((prev: unknown[]) => unknown[]),
      ) => void;
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
    },
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
    inputRefs: {
      inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
    },
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

  const inputRefs = {
    inputRef: refs.inputRef,
  };

  return render(inputState, inputActions, inputRefs);
}

interface ChatStatusProps {
  render: (status: {
    loading: boolean;
    typing: boolean;
    messageCount: number;
    hasMessages: boolean;
    pendingCount: number;
    input: string;
    autoScroll: boolean;
    historyIndex: number;
    historyLength: number;
  }) => React.ReactNode;
  showWhen?: (status: {
    loading: boolean;
    typing: boolean;
    messageCount: number;
    hasMessages: boolean;
    pendingCount: number;
    input: string;
  }) => boolean;
}

function ChatStatus({ render, showWhen }: ChatStatusProps) {
  const context = useChatContext();
  const { state } = context;

  const status = React.useMemo(
    () => ({
      loading: state.loading,
      typing: state.typing,
      messageCount: state.messages.length,
      hasMessages: state.messages.length > 0,
      pendingCount: state.pendingMessages.size,
      input: state.input,
      autoScroll: state.autoScroll,
      historyIndex: state.historyIndex,
      historyLength: state.history.length,
    }),
    [state],
  );

  const shouldShow = showWhen ? showWhen(status) : true;

  if (!shouldShow) {
    return null;
  }

  return render(status);
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
