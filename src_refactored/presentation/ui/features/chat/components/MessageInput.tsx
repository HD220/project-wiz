import { Paperclip, Send, CornerDownLeft } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import { Button } from '@/presentation/ui/components/ui/button';
import { Textarea } from '@/presentation/ui/components/ui/textarea'; // Usando Textarea para multi-linha
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/presentation/ui/components/ui/tooltip';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Digite sua mensagem ou use / para comandos..."
}: MessageInputProps) {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(event.target.value);
    adjustTextareaHeight();
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      // Max height for textarea, e.g., 5 lines of text (approx 20px per line for base font size)
      const maxHeight = 5 * 24; // Assuming line-height or effective line height is around 24px
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  // Adjust height on initial render and when inputValue changes (e.g. pasting multi-line text)
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);


  const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      // After sending, reset height, browser might not do it if content is cleared programmatically
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
    // Allow Shift+Enter for new line, which Textarea handles by default
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex-shrink-0" type="button">
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
        rows={1} // Start with a single row
        className="flex-1 resize-none overflow-y-auto bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus-visible:ring-1 focus-visible:ring-sky-500 focus-visible:ring-offset-0"
        disabled={isLoading}
      />
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
             <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="flex-shrink-0">
                <Send className="h-5 w-5" />
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
