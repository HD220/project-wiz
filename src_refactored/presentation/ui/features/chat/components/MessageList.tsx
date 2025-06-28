import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

import { ChatMessage, MessageItem } from './MessageItem'; // Assuming ChatMessage is also exported from MessageItem.tsx

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  currentUserId: string; // To determine if a message is from the current user
}

export function MessageList({ messages, isLoading, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { // Removed underscore from callback parameter
    scrollToBottom();
  }, [messages]); // Scroll to bottom when new messages arrive

  // Pre-process messages to add `isContinuation` flag
  const processedMessages = messages.map((message, index, array) => {
    if (index > 0 && message.sender.id === array[index - 1].sender.id && message.type === array[index - 1].type) {
      // Basic continuation: same sender and not a system message (system messages usually stand alone)
      // More complex logic could involve timestamps (e.g., if within 1-2 minutes)
      return { ...message, isContinuation: message.type !== 'system' };
    }
    return { ...message, isContinuation: false };
  });

  if (isLoading && processedMessages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <p className="ml-2 text-slate-500 dark:text-slate-400">Carregando mensagens...</p>
      </div>
    );
  }

  if (!isLoading && processedMessages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">
          Nenhuma mensagem ainda. Envie uma mensagem para começar!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-1 pr-1"> {/* Reduced space-y for tighter packing with continuations */}
      {processedMessages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isCurrentUser={message.sender.id === currentUserId}
        />
      ))}
      <div ref={messagesEndRef} /> {/* Anchor for scrolling to bottom */}
      {/* Optional: Show a "typing..." indicator here if isLoading is more granular */}
    </div>
  );
}
