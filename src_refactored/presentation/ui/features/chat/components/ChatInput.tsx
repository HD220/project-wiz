import { SendHorizontal, Paperclip, Mic } from 'lucide-react'; // Example icons
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

import { Button } from '@/presentation/ui/components/ui/button';
import { Textarea } from '@/presentation/ui/components/ui/textarea';
import { cn } from '@/presentation/ui/lib/utils';

export interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  initialValue?: string;
}

export function ChatInput({
  onSubmit,
  isLoading = false,
  placeholder = 'Message...',
  className,
  initialValue = '',
}: ChatInputProps) {
  const [message, setMessage] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      // Max height for textarea, e.g., 5 lines. Adjust as needed.
      // Assuming line height of ~20-24px. 5 lines ~ 100-120px.
      const maxHeight = 120;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [message]);

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading) {
      onSubmit(trimmedMessage);
      setMessage('');
      // Optionally refocus textarea after send
      // textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isLoading) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={cn("flex items-end p-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 space-x-2", className)}>
      {/* Placeholder for attachment button */}
      <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300" disabled={isLoading}>
        <Paperclip className="h-5 w-5" />
        <span className="sr-only">Attach file</span>
      </Button>

      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 resize-none border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700/50 focus:ring-sky-500 dark:focus:ring-sky-500 focus:border-sky-500 dark:focus:border-sky-500 min-h-[40px] max-h-[120px] overflow-y-auto rounded-lg px-3 py-2 text-sm"
        rows={1} // Start with 1 row, auto-expands
        disabled={isLoading}
      />

      {/* Placeholder for voice input button, or use Send if message is not empty */}
      {message.trim() || isLoading ? (
        <Button
            variant="default"
            size="icon"
            onClick={handleSendMessage}
            disabled={isLoading || !message.trim()}
            className="bg-sky-500 hover:bg-sky-600 text-white"
        >
          <SendHorizontal className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      ) : (
        <Button variant="ghost" size="icon" className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300" disabled={isLoading}>
          <Mic className="h-5 w-5" />
          <span className="sr-only">Record voice message</span>
        </Button>
      )}
    </div>
  );
}

export default ChatInput;
