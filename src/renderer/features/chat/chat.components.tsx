import * as React from "react";

import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { cn } from "@/renderer/lib/utils";

import { useChatContext } from "./chat.context";
// Status utility types
type ChatStatusUI = { loading: boolean; typing: boolean };
type ChatStatusStats = {
  messageCount: number;
  hasMessages: boolean;
  pendingCount: number;
};
type ChatStatusControl = { autoScroll: boolean };
type ChatStatusHistory = { index: number; length: number };

interface ChatMessagesProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

export function ChatMessages({
  className,
  children,
  ...props
}: ChatMessagesProps) {
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
        scrollViewportRef.current = viewport;

        // Update the chat context ref to point to viewport for scrolling
        if (refs.messagesRef) {
          refs.messagesRef.current = viewport;
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

export function ChatMessage({
  messageData,
  messageIndex,
  render,
}: ChatMessageProps) {
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

export function ChatInput({ render }: ChatInputProps) {
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

export function ChatStatus({ render, showWhen }: ChatStatusProps) {
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
