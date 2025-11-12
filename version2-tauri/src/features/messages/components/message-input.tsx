import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type MessageInputProps = {
  onSend: (content: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
};

export function MessageInput({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(content.trim());
      setContent('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isSending}
        className="min-h-[80px] max-h-[200px] resize-none"
      />
      <Button
        type="submit"
        disabled={!content.trim() || isSending || disabled}
        className="self-end"
      >
        {isSending ? 'Sending...' : 'Send'}
      </Button>
    </form>
  );
}
