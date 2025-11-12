import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConversationCard } from './conversation-card';
import { ConversationForm } from './conversation-form';
import { useConversationsStore } from '../store';
import { useAuthStore } from '@/features/auth/store';
import type { Conversation } from '@/lib/types';

type ConversationListProps = {
  onSelectConversation?: (conversation: Conversation) => void;
  selectedConversationId?: string;
};

export function ConversationList({
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const {
    conversations,
    fetchConversations,
    archiveConversation,
    deleteConversation,
    isLoading,
  } = useConversationsStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConversation, setEditingConversation] =
    useState<Conversation | null>(null);

  useEffect(() => {
    if (token) {
      fetchConversations(token);
    }
  }, [token, fetchConversations]);

  const handleArchive = async (conversation: Conversation) => {
    if (!token) return;

    if (confirm(`Are you sure you want to archive ${conversation.name}?`)) {
      try {
        await archiveConversation(conversation.id, token);
      } catch (error) {
        console.error('Failed to archive conversation:', error);
      }
    }
  };

  const handleDelete = async (conversation: Conversation) => {
    if (!token) return;

    if (
      confirm(
        `Are you sure you want to permanently delete ${conversation.name}? This action cannot be undone.`
      )
    ) {
      try {
        await deleteConversation(conversation.id, token);
      } catch (error) {
        console.error('Failed to delete conversation:', error);
      }
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEditSuccess = () => {
    setEditingConversation(null);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    if (onSelectConversation) {
      onSelectConversation(conversation);
    } else {
      // Navigate to chat page
      navigate({
        to: '/chat/$conversationId',
        params: { conversationId: conversation.id },
      });
    }
  };

  const activeConversations = conversations.filter(
    (c) => c.archived_at === null
  );
  const archivedConversations = conversations.filter(
    (c) => c.archived_at !== null
  );

  const channels = activeConversations.filter(
    (c) => c.conversation_type === 'channel'
  );
  const dms = activeConversations.filter((c) => c.conversation_type === 'dm');

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conversations</h2>
          <p className="text-muted-foreground">
            Manage your channels and direct messages
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Conversation</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Conversation</DialogTitle>
            </DialogHeader>
            <ConversationForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-4">No conversations yet</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create Your First Conversation
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="channels" className="w-full">
          <TabsList>
            <TabsTrigger value="channels">Channels ({channels.length})</TabsTrigger>
            <TabsTrigger value="dms">DMs ({dms.length})</TabsTrigger>
            <TabsTrigger value="archived">
              Archived ({archivedConversations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="mt-6">
            {channels.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No channels</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {channels.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    onSelect={handleSelectConversation}
                    onEdit={setEditingConversation}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    isSelected={conversation.id === selectedConversationId}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dms" className="mt-6">
            {dms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No direct messages</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dms.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    onSelect={handleSelectConversation}
                    onEdit={setEditingConversation}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    isSelected={conversation.id === selectedConversationId}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            {archivedConversations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No archived conversations</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {archivedConversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    onSelect={handleSelectConversation}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <Dialog
        open={editingConversation !== null}
        onOpenChange={(open) => !open && setEditingConversation(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Conversation</DialogTitle>
          </DialogHeader>
          {editingConversation && (
            <ConversationForm
              conversation={editingConversation}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingConversation(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
