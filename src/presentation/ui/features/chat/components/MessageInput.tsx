import { SendHorizontal, Paperclip, CornerDownLeft } from "lucide-react";
// KeyboardEvent type from React namespace is used below (React.KeyboardEvent)
import React, { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/ui/lib/utils";

export interface MessageInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export function MessageInput({
  onSubmit,
  isLoading = false,
  placeholder = "Digite sua mensagem ou use / para comandos...",
  className,
  initialValue = "",
}: MessageInputProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      // Max height for textarea, e.g., 5 lines of text
      const maxHeight = 5 * 24;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (inputValue.trim()) {
      onSubmit(inputValue.trim());
      setInputValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-end gap-2 p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50",
        className
      )}
    >
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex-shrink-0"
              type="button"
            >
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Anexar arquivo (Não implementado)</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="mb-1">
            <p>Anexar arquivo (Não implementado)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        rows={1}
        className="flex-1 resize-none overflow-y-auto bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:ring-offset-0"
        disabled={isLoading}
      />
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !inputValue.trim()}
              className="flex-shrink-0"
            >
              <SendHorizontal className="h-5 w-5" />
              <span className="sr-only">Enviar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="mb-1 flex items-center">
            <p>Enviar</p>
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <CornerDownLeft size={10} />
            </kbd>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </form>
  );
}
