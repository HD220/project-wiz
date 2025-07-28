import { Send, Paperclip, Smile } from "lucide-react";
import { useState, useRef, KeyboardEvent, useEffect } from "react";

import { Button } from "@/renderer/components/ui/button";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Textarea } from "@/renderer/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/renderer/components/ui/tooltip";
import { cn } from "@/renderer/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

// Action buttons composition for enhanced UX
interface ActionButtonsProps {
  onSend: () => void;
  disabled: boolean;
  isSending: boolean;
  hasContent: boolean;
  onAttachment?: () => void;
  onEmoji?: () => void;
}

export function ActionButtons({
  onSend,
  disabled,
  isSending,
  hasContent,
  onAttachment,
  onEmoji,
}: ActionButtonsProps) {
  return (
    <TooltipProvider>
      <div className="absolute bottom-2 right-2 flex items-center gap-[var(--spacing-component-xs)]">
        {/* Secondary action buttons - only show when no content */}
        {!hasContent && (
          <div className="flex items-center gap-[var(--spacing-component-xs)] mr-1">
            {onAttachment && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onAttachment}
                    disabled={disabled || isSending}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Anexar arquivo</p>
                </TooltipContent>
              </Tooltip>
            )}

            {onEmoji && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onEmoji}
                    disabled={disabled || isSending}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                    aria-label="Add emoji"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adicionar emoji</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Send button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onSend}
              disabled={disabled || isSending || !hasContent}
              className={cn(
                "h-8 w-8 p-0 transition-all duration-200 shadow-sm",
                hasContent && !disabled && !isSending
                  ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 hover:scale-[1.01] hover:shadow-md border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent",
                isSending && "animate-pulse",
              )}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hasContent ? "Enviar mensagem" : "Digite uma mensagem"}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
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
  const [previousIsSending, setPreviousIsSending] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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

  // Send message handler with enhanced validation
  async function handleSend() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled || isOverLimit) return;

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
  const characterCount = message.length;
  const maxCharacters = 2000; // Standard message limit
  const isNearLimit = characterCount > maxCharacters * 0.8;
  const isOverLimit = characterCount > maxCharacters;

  // Focus handlers for enhanced visual feedback
  function handleFocus() {
    setIsFocused(true);
  }

  function handleBlur() {
    setIsFocused(false);
  }

  // Placeholder action handlers (for future implementation)
  function handleAttachment() {
    // Future: file attachment functionality
    console.log("Attachment clicked");
  }

  function handleEmoji() {
    // Future: emoji picker functionality
    console.log("Emoji clicked");
  }

  return (
    <div
      className={cn(
        "border-t bg-gradient-to-r from-background to-background/95 backdrop-blur-sm",
        className,
      )}
    >
      <div className="px-[var(--spacing-component-md)] pb-[var(--spacing-component-md)] pt-[var(--spacing-component-md)]">
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
              "bg-gradient-to-r from-muted/40 to-muted/30 rounded-xl border transition-all duration-300 relative shadow-sm",
              isFocused
                ? "border-primary/40 shadow-md ring-2 ring-primary/10"
                : "border-border/60 hover:border-border/80",
              disabled && "opacity-60 cursor-not-allowed",
              isOverLimit && "border-destructive/50 ring-2 ring-destructive/10",
            )}
          >
            <ScrollArea className="flex flex-col flex-1 max-h-[160px] transition-all duration-300">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled || isSending}
                maxLength={maxCharacters}
                className={cn(
                  "resize-none bg-transparent border-0 min-h-[52px]",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "px-5 py-[var(--spacing-component-md)] pr-20 leading-relaxed text-sm w-full font-medium",
                  "placeholder:text-muted-foreground/60 placeholder:font-normal",
                  "transition-all duration-200",
                  disabled && "cursor-not-allowed opacity-50",
                  isOverLimit && "text-destructive",
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

            <ActionButtons
              onSend={handleSend}
              disabled={disabled || isOverLimit}
              isSending={isSending}
              hasContent={hasContent}
              onAttachment={handleAttachment}
              onEmoji={handleEmoji}
            />
          </div>

          {/* Character count indicator */}
          {(hasContent || isFocused) && (
            <div className="flex justify-between items-center mt-2 px-[var(--spacing-component-sm)]">
              <div className="text-xs text-muted-foreground/70 font-medium">
                <span>Press Enter to send, Shift+Enter for new line</span>
                {hasContent && <span> • Escape to clear</span>}
              </div>

              {characterCount > 0 && (
                <div
                  className={cn(
                    "text-xs font-medium transition-colors duration-200",
                    isOverLimit
                      ? "text-destructive"
                      : isNearLimit
                        ? "text-chart-4"
                        : "text-muted-foreground/60",
                  )}
                >
                  {characterCount}/{maxCharacters}
                </div>
              )}
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
