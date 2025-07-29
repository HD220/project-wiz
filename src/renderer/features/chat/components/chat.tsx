import * as React from "react";
import { useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Button } from "@/renderer/components/ui/button";
import { Textarea } from "@/renderer/components/ui/textarea";
import { ArchivedConversationBanner } from "@/renderer/features/conversation/components/archived-conversation-banner";
import { cn } from "@/renderer/lib/utils";

// Props for the root Chat component
type ChatProps = React.ComponentProps<"div">;

/**
 * Chat - Root compound component for complete chat interface
 */
export function Chat({ children, className, ...props }: ChatProps) {
  return (
    <div
      data-slot="chat"
      className={cn("flex flex-col h-full", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Props for ChatArchived component
type ChatArchivedProps = React.ComponentProps<"div"> & {
  conversationId: string;
  conversationName?: string;
  archivedAt: Date;
};

/**
 * ChatArchived - Shows archived banner when conversation is archived
 */
export function ChatArchived({
  conversationId,
  conversationName,
  archivedAt,
  className,
  ...props
}: ChatArchivedProps) {
  return (
    <div data-slot="chat-archived" className={className} {...props}>
      <ArchivedConversationBanner
        conversationId={conversationId}
        conversationName={conversationName}
        archivedAt={archivedAt}
      />
    </div>
  );
}

// Props for ChatMessages component
type ChatMessagesProps = React.ComponentProps<"div">;

/**
 * ChatMessages - Scrollable messages area with auto-scroll behavior
 */
export function ChatMessages({
  children,
  className,
  ...props
}: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on mount
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector(
          "[data-radix-scroll-area-viewport]",
        );
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    };

    scrollToBottom();
  });

  return (
    <div
      data-slot="chat-messages"
      className={cn("flex-1 overflow-hidden relative", className)}
      {...props}
    >
      <ScrollArea ref={scrollAreaRef} className="h-full w-full">
        <div className="min-h-full flex flex-col">
          {children}
          {/* Scroll padding */}
          <div className="h-2" />
        </div>
      </ScrollArea>
    </div>
  );
}

// Props for ChatInput component
type ChatInputProps = React.ComponentProps<"div"> & {
  onSendMessage: (content: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  isSending?: boolean;
};

/**
 * ChatInput - Message input with textarea and send button
 */
export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  isSending = false,
  className,
  ...props
}: ChatInputProps) {
  const [message, setMessage] = React.useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Send message handler
  async function handleSend() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    try {
      await onSendMessage(trimmedMessage);
      setMessage("");
    } catch (error) {
      // Error handling is managed by the mutation hook
    }
  }

  // Handle Enter key to send (Shift+Enter for new line)
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      data-slot="chat-input"
      className={cn("border-t border-border/50 p-4", className)}
      {...props}
    >
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isSending}
          size="sm"
          className="h-[44px] px-3"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
