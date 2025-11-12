import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { useConversationsStore } from '@/features/conversations/store';
import { MessageList } from '@/features/messages';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@/lib/types';

export const Route = createFileRoute('/chat/$conversationId')({
  component: ChatPage,
});

function ChatPage() {
  const { conversationId } = Route.useParams();
  const { isAuthenticated, user } = useAuthStore();
  const { conversations, fetchConversations } = useConversationsStore();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (conversations.length === 0 && isAuthenticated) {
      const token = useAuthStore.getState().token;
      if (token) {
        fetchConversations(token);
      }
    }
  }, [conversations.length, isAuthenticated, fetchConversations]);

  useEffect(() => {
    const found = conversations.find((c) => c.id === conversationId);
    setConversation(found || null);
  }, [conversationId, conversations]);

  if (!isAuthenticated || !user) {
    return null;
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Conversation not found</p>
          <Button onClick={() => navigate({ to: '/conversations' })}>
            Back to Conversations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: '/conversations' })}
          >
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {conversation.conversation_type === 'channel' && '#'}
              {conversation.name || 'Unnamed Conversation'}
            </h1>
            {conversation.description && (
              <p className="text-sm text-muted-foreground">
                {conversation.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-hidden">
        <MessageList conversationId={conversationId} currentUserId={user.id} />
      </div>
    </div>
  );
}
