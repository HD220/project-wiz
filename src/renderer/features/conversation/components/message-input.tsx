import { Send, Plus, Smile, AtSign, Hash } from "lucide-react";
import { useState, useRef, KeyboardEvent } from "react";

import { Button } from "@/renderer/components/ui/button";
import { Textarea } from "@/renderer/components/ui/textarea";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSend() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending || disabled) return;

    try {
      await onSendMessage(trimmedMessage);
      setMessage("");

      // Reset textarea height and maintain focus
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.focus();
      }
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

    // Auto-resize textarea
    const textarea = event.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }

  const canSend = message.trim().length > 0 && !isSending && !disabled;

  return (
    <div className={cn("border-t bg-background", className)}>
      <div className="px-4 pb-6 pt-4">
        {/* Input container - Discord style rounded rectangle */}
        <div className="relative flex items-end bg-muted/50 rounded-lg border border-border/50 focus-within:border-border transition-colors">
          {/* Left action button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-11 w-11 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground rounded-l-lg rounded-r-none border-r border-border/30"
            title="Anexar arquivo"
          >
            <Plus className="h-5 w-5" />
          </Button>

          {/* Message textarea container */}
          <div className="flex-1 relative">
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
                "min-h-[44px] max-h-[120px] resize-none bg-transparent border-0",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "px-3 py-3 leading-5 text-sm",
                "placeholder:text-muted-foreground/70",
                disabled && "cursor-not-allowed opacity-50",
              )}
              rows={1}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center flex-shrink-0 pr-2">
            {/* Emoji button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              title="Adicionar emoji"
            >
              <Smile className="h-4 w-4" />
            </Button>

            {/* Send button - only show when there's content */}
            {canSend && (
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                  "h-8 w-8 p-0 ml-1 bg-primary hover:bg-primary/90",
                  "rounded-md transition-all duration-200",
                )}
                title="Enviar mensagem (Enter)"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Helper text - only show when focused */}
        {message.length === 0 && (
          <div className="mt-2 px-1">
            <p className="text-xs text-muted-foreground/60">
              Pressione{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono border">
                Enter
              </kbd>{" "}
              para enviar,{" "}
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono border">
                Shift+Enter
              </kbd>{" "}
              para nova linha
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export { MessageInput };
