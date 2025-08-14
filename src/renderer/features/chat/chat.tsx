import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/renderer/lib/utils";

import { ChatContext, type ChatContextValue } from "./chat.context";
import { ChatState } from "./chat.reducer";
import { createChatReducer } from "./chat.reducer";

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
              ? { ...(msg as Record<string, unknown>), ...updates }
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

export { Chat, chatVariants };
