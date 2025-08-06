import { forwardRef, useEffect, useState } from "react";
import { Send, Paperclip, Smile } from "lucide-react";

import { Button } from "@/renderer/components/ui/button";
import { Textarea } from "@/renderer/components/ui/textarea";
import { cn } from "@/renderer/lib/utils";

interface ChatInputAreaProps extends React.ComponentProps<"div"> {
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  loading: boolean;
  onValueChange: (value: string) => void;
  onSend: (value?: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ChatInputArea = forwardRef<HTMLDivElement, ChatInputAreaProps>(
  (
    {
      inputRef,
      value,
      loading,
      onValueChange,
      onSend,
      onKeyDown,
      placeholder = "Type a message...",
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const handleSubmit = () => {
      if (value.trim() && !loading) {
        onSend();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }

      onKeyDown?.(e);
    };

    // Auto-resize textarea with throttling for performance
    const resizeTextarea = () => {
      if (inputRef?.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    };

    useEffect(() => {
      const timeoutId = setTimeout(resizeTextarea, 0);
      return () => clearTimeout(timeoutId);
    }, [value]);

    return (
      <div ref={ref} className={cn("flex items-end gap-3", props.className)}>
        <div className="flex-1 relative">
          <Textarea
            ref={inputRef}
            value={value}
            onChange={(e) => {
              const newValue = e.target.value;
              onValueChange(newValue);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[44px] max-h-[200px] resize-none rounded-lg border-input bg-background px-3 py-2 text-sm focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:ring-offset-1"
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-[44px] w-[44px] p-0"
            disabled={disabled || loading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-[44px] w-[44px] p-0"
            disabled={disabled || loading}
          >
            <Smile className="h-4 w-4" />
          </Button>

          <Button
            type="submit"
            size="sm"
            className="h-[44px] w-[44px] p-0"
            disabled={!value.trim() || loading || disabled}
            onClick={handleSubmit}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  },
);

ChatInputArea.displayName = "ChatInputArea";

export { ChatInputArea };
export type { ChatInputAreaProps };
