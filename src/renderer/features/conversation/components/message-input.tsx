import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";

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

  const handleSend = async () => {
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
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (but not Shift+Enter)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  const canSend = message.trim().length > 0 && !isSending && !disabled;

  return (
    <div className={cn(
      "border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="flex items-end gap-2 p-4">
        {/* Message textarea */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className={cn(
              "min-h-[40px] max-h-[120px] resize-none border-border/50",
              "focus:border-border transition-colors",
              "pr-12" // Space for send button
            )}
            rows={1}
          />
          
          {/* Send button inside textarea */}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "absolute right-1 bottom-1 h-8 w-8 p-0",
              "hover:bg-primary hover:text-primary-foreground",
              canSend && "text-primary"
            )}
            title="Send message (Enter)"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Helper text */}
      <div className="px-4 pb-2">
        <p className="text-xs text-muted-foreground">
          Press <kbd className="px-1 bg-muted rounded text-xs">Enter</kbd> to send, 
          <kbd className="px-1 bg-muted rounded text-xs ml-1">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
}

export { MessageInput };