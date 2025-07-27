import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Send } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Textarea } from "@/renderer/components/ui/textarea";
import { cn } from "@/renderer/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// Send button composition for better accessibility
interface SendButtonProps {
  onSend: () => void;
  disabled: boolean;
  isSending: boolean;
  hasContent: boolean;
}

function SendButton({
  onSend,
  disabled,
  isSending,
  hasContent,
}: SendButtonProps) {
  return (
    <div className="absolute bottom-2 right-2">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={onSend}
        disabled={disabled || isSending || !hasContent}
        className={cn(
          "h-8 w-8 p-0 transition-all duration-200",
          hasContent && !disabled && !isSending
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
        )}
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}

function MessageInput(props: MessageInputProps) {
  const {
    onSendMessage,
    isSending,
    disabled = false,
    placeholder = "Type a message...",
    className,
  } = props;

  const [message, setMessage] = useState("");
  const [previousIsSending, setPreviousIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea and restore focus when message sending completes
  useEffect(() => {
    // Auto-resize textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    // Restore focus when message sending completes
    if (previousIsSending && !isSending && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 10);
    }
    setPreviousIsSending(isSending);
  }, [message, isSending, previousIsSending]);

  // Send message handler with validation
  async function handleSend() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    try {
      setMessage("");
      await onSendMessage(trimmedMessage);
    } catch {
      // Error handling is done by useApiMutation in parent component
      // Restore message on error
      setMessage(trimmedMessage);
    }
  }

  // Keyboard event handler with accessibility support
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Send on Enter (but not Shift+Enter) for better UX
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }

    // Escape to clear input (common pattern)
    if (event.key === "Escape" && message.trim()) {
      setMessage("");
    }
  }

  // Textarea change handler
  function handleTextareaChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(event.target.value);
  }

  const hasContent = message.trim().length > 0;

  return (
    <div className={cn("border-t bg-background", className)}>
      <div className="px-4 pb-6 pt-4">
        {/* Form-like input container with proper accessibility */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <div className="bg-muted/50 rounded-lg border border-border/50 focus-within:border-border transition-colors relative">
            <ScrollArea className="flex flex-col flex-1 max-h-[120px] transition-all duration-150">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled || isSending}
                className={cn(
                  "resize-none bg-transparent border-0 min-h-[44px]",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "px-4 py-3 pr-12 leading-5 text-sm w-full",
                  "placeholder:text-muted-foreground/70",
                  disabled && "cursor-not-allowed opacity-50",
                )}
                rows={1}
                aria-label="Type a message"
                role="textbox"
                aria-multiline="true"
                aria-describedby={
                  disabled ? "message-input-disabled-help" : undefined
                }
              />
            </ScrollArea>

            <SendButton
              onSend={handleSend}
              disabled={disabled}
              isSending={isSending}
              hasContent={hasContent}
            />
          </div>

          {/* Hidden submit button for form submission */}
          <button
            type="submit"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          >
            Send
          </button>

          {/* Accessibility help text */}
          {disabled && (
            <div id="message-input-disabled-help" className="sr-only">
              Message input is disabled. You cannot send messages in this
              conversation.
            </div>
          )}
        </form>

        {/* Keyboard shortcuts help */}
        <div className="text-xs text-muted-foreground/60 mt-1 px-1">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {hasContent && <span> • Escape to clear</span>}
        </div>
      </div>
    </div>
  );
}

export { MessageInput };
