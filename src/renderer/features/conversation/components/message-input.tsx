import { Send, Paperclip, Smile } from "lucide-react";
import { useState, useRef, KeyboardEvent, useEffect } from "react";

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

export function MessageInput(props: MessageInputProps) {
  const {
    onSendMessage,
    isSending,
    disabled = false,
    placeholder = "Type a message...",
    className,
  } = props;

  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxCharacters = 2000; // Standard message limit

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Restore focus when message sending completes
  useEffect(() => {
    if (!isSending && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isSending]);

  // Send message handler with enhanced validation
  async function handleSend() {
    const trimmedMessage = message.trim();
    if (
      !trimmedMessage ||
      isSending ||
      disabled ||
      message.length > maxCharacters
    )
      return;

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

  const hasContent = message.trim().length > 0;

  // Responsive configuration
  const padding =
    "px-[var(--spacing-component-sm)] lg:px-[var(--spacing-component-md)] py-[var(--spacing-component-xs)] lg:py-[var(--spacing-component-sm)]";

  return (
    <div className={cn("bg-background border-t border-border/60", className)}>
      <div className={padding}>
        {/* Form-like input container with enhanced design */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative"
        >
          <div
            className={cn(
              "bg-muted/40 rounded-lg border transition-all duration-200 relative",
              "border-border/50 hover:border-border/70 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20",
              disabled && "opacity-60 cursor-not-allowed",
              message.length > maxCharacters &&
                "border-destructive/50 ring-1 ring-destructive/20",
            )}
          >
            <ScrollArea className="max-h-[120px]">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled || isSending}
                maxLength={maxCharacters}
                className={cn(
                  "resize-none bg-transparent border-0 min-h-[44px]",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "px-[var(--spacing-component-sm)] py-[var(--spacing-component-sm)] pr-16 leading-[1.375] text-sm w-full",
                  "placeholder:text-muted-foreground/60",
                  "transition-all duration-150",
                  disabled && "cursor-not-allowed opacity-50",
                  message.length > maxCharacters && "text-destructive",
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

            {/* Action buttons - responsive sizing for touch */}
            <div className="absolute flex items-center bottom-1 lg:bottom-[var(--spacing-component-xs)] right-1 lg:right-[var(--spacing-component-xs)] gap-1 lg:gap-[var(--spacing-component-xs)]">
              <div className="flex items-center gap-1 lg:gap-[var(--spacing-component-xs)] mr-1 lg:mr-[var(--spacing-component-xs)]">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => console.log("Attachment - TODO")}
                  disabled={disabled || isSending}
                  className={cn(
                    "p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-150",
                    "h-7 w-7 lg:h-8 lg:w-8", // Responsive size
                  )}
                  title="Attach file"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => console.log("Emoji - TODO")}
                  disabled={disabled || isSending}
                  className={cn(
                    "p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-150",
                    "h-7 w-7 lg:h-8 lg:w-8", // Responsive size
                  )}
                  title="Add emoji"
                  aria-label="Add emoji"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleSend}
                disabled={disabled || isSending || !hasContent}
                className={cn(
                  "p-0 transition-all duration-150",
                  "h-7 w-7 lg:h-8 lg:w-8", // Responsive size
                  hasContent && !disabled && !isSending
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  isSending && "animate-pulse",
                )}
                title={hasContent ? "Send message" : "Type a message"}
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Character count indicator - more compact */}
          {message.length > maxCharacters * 0.8 && (
            <div className="flex justify-end items-center mt-[var(--spacing-component-xs)] px-[var(--spacing-component-xs)]">
              <div
                className={cn(
                  "text-xs transition-colors duration-200",
                  message.length > maxCharacters
                    ? "text-destructive"
                    : "text-muted-foreground/80",
                )}
              >
                {message.length}/{maxCharacters}
              </div>
            </div>
          )}

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
      </div>
    </div>
  );
}
