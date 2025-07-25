import { useState, useRef, KeyboardEvent, useEffect } from "react";

import { Textarea } from "@/renderer/components/ui/textarea";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { cn } from "@/renderer/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isSending: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
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

  // Restore focus when message sending completes
  useEffect(() => {
    // If was sending and now is not sending, restore focus
    if (previousIsSending && !isSending && textareaRef.current) {
      // Small delay to ensure DOM updates are complete
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 10);
    }
    setPreviousIsSending(isSending);
  }, [isSending, previousIsSending]);

  async function handleSend() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    try {
      setMessage("");

      await onSendMessage(trimmedMessage);
      // Focus restoration will be handled by useEffect
    } catch (_error) {
      // Error handling is done by useApiMutation in parent component
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Send on Enter (but not Shift+Enter)
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleTextareaChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(event.target.value);
  }

  return (
    <div className={cn("border-t bg-background", className)}>
      <div className="px-4 pb-6 pt-4">
        {/* Input container - ScrollArea expansível até 120px, depois scroll do shadcn */}
        <div className=" bg-muted/50 rounded-lg border border-border/50 focus-within:border-border transition-colors">
          <ScrollArea className="flex flex-col flex-1 max-h-[120px] transition-all duration-150">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={
                disabled
                  ? "Você não pode enviar mensagens neste canal"
                  : placeholder
              }
              disabled={disabled || isSending}
              className={cn(
                "resize-none bg-transparent border-0 min-h-[44px] h-full",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "px-4 py-3 leading-5 text-sm w-full",
                "placeholder:text-muted-foreground/70",
                disabled && "cursor-not-allowed opacity-50",
              )}
              rows={1}
            />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

export { MessageInput };
