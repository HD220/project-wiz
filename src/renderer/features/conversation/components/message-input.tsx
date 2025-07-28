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
      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1">
        {/* Secondary action buttons - always show */}
        <div className="flex items-center gap-1 mr-1">
          {onAttachment && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={onAttachment}
                  disabled={disabled || isSending}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-150"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach file</p>
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
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-150"
                  aria-label="Add emoji"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add emoji</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

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
                "h-7 w-7 p-0 transition-all duration-150",
                hasContent && !disabled && !isSending
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                isSending && "animate-pulse",
              )}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{hasContent ? "Send message" : "Type a message"}</p>
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
    <div className={cn("bg-background border-t border-border/60", className)}>
      <div className="px-4 py-3">
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
              isFocused
                ? "border-primary/50 ring-1 ring-primary/20"
                : "border-border/50 hover:border-border/70",
              disabled && "opacity-60 cursor-not-allowed",
              isOverLimit && "border-destructive/50 ring-1 ring-destructive/20",
            )}
          >
            <ScrollArea className="max-h-[120px]">
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
                  "resize-none bg-transparent border-0 min-h-[44px]",
                  "focus-visible:ring-0 focus-visible:ring-offset-0",
                  "px-3 py-2.5 pr-16 leading-[1.375] text-sm w-full",
                  "placeholder:text-muted-foreground/60",
                  "transition-all duration-150",
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

          {/* Character count indicator - more compact */}
          {(isNearLimit || isOverLimit) && (
            <div className="flex justify-end items-center mt-1 px-1">
              <div
                className={cn(
                  "text-xs transition-colors duration-200",
                  isOverLimit ? "text-destructive" : "text-muted-foreground/80",
                )}
              >
                {characterCount}/{maxCharacters}
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
