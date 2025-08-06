import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { ScrollArea } from "@/renderer/components/atoms/scroll-area";
import { cn } from "@/renderer/lib/utils";

import { ChatState, ChatActions, ChatRefs, ChatAction, ChatContextValue } from "./chat.types";
import { createChatReducer } from "./chat.reducer";
import { ChatContext, useChatContext } from "./chat.context";
import { ChatMessages, ChatMessage, ChatInput, ChatStatus } from "./chat.components";
import { useChatInputState, useChatActions, useChatStatus, useChatRefs } from "./chat.hooks";

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

  // Actions simplificadas usando helper centralizado - memoized for performance
  const actions = React.useMemo(() => ({
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

    send: (input: string) => {
      if (onSend && input && input.trim() && !state.loading && !disabled) {
        // contextValue will be defined below
        onSend(input.trim(), contextValue);
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
  }), [messages, keyFn, onValueChange, onMessageUpdate, onMessageRemove, onClear, onSend, state.loading, disabled, state.pendingMessages, scrollToBottom]);

  // Context construction simplificada - memoized for stability
  const contextValue: ChatContextValue = React.useMemo(() => ({
    state: { ...state, messages },
    actions,
    refs: { messagesRef, inputRef },
    keyFn,
  }), [state, messages, actions, keyFn]);

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



export {
  Chat,
  chatVariants,
};
