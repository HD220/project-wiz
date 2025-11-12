import { useEffect, useRef } from 'react';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';
import { useMessagesStore } from '../store';
import { useAuthStore } from '@/features/auth/store';
import type { Message } from '@/lib/types';

type MessageListProps = {
  conversationId: string;
  currentUserId: string;
};

export function MessageList({
  conversationId,
  currentUserId,
}: MessageListProps) {
  const { token } = useAuthStore();
  const {
    messages,
    fetchMessages,
    createMessage,
    deleteMessage,
    isLoading,
    isSending,
  } = useMessagesStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationMessages = messages[conversationId] || [];

  useEffect(() => {
    if (token && conversationId) {
      fetchMessages(
        {
          conversation_id: conversationId,
          limit: 100,
        },
        token
      );
    }
  }, [conversationId, token, fetchMessages]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length]);

  const handleSendMessage = async (content: string) => {
    if (!token) return;

    await createMessage(
      {
        conversation_id: conversationId,
        content,
      },
      token
    );
  };

  const handleDeleteMessage = async (message: Message) => {
    if (!token) return;

    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(message.id, conversationId, token);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  if (isLoading && conversationMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {conversationMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.author_id === currentUserId}
                authorName={message.author_id === currentUserId ? 'You' : 'Agent'}
                onDelete={handleDeleteMessage}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <div className="border-t p-4">
        <MessageInput
          onSend={handleSendMessage}
          disabled={isSending}
          placeholder="Type a message... (Ctrl+Enter to send)"
        />
      </div>
    </div>
  );
}
