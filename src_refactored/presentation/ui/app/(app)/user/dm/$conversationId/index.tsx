import { createFileRoute, useParams, useRouter } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react'; // For a potential back button
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { ChatWindow } from '@/presentation/ui/features/chat/components/ChatWindow';
import { ConversationItem } from '@/presentation/ui/features/chat/components/ConversationList';
import { ChatMessage } from '@/presentation/ui/features/chat/components/MessageItem';
// Assuming ConversationItem might be useful for context, though ChatWindow takes a simpler Conversation type


// --- Mock Data ---
// This should ideally be fetched or come from a global state/cache based on conversationId
// For now, we'll use a simplified version of mockConversations and mockMessages from the main ChatPage.

interface DMConversation extends ConversationItem { // Extending for potential extra DM specific details
    participantsDetails?: { id: string, name: string, avatarUrl?: string, type: 'user' | 'agent' }[];
}

const mockDMConversationsDb: Record<string, DMConversation> = {
  'userAlice': { id: 'userAlice', name: 'Alice (Designer)', type: 'dm', avatarUrl: '/avatars/01.png', lastMessage: "Você viu o novo layout?", timestamp: "Ontem", participantsDetails: [{id: 'userAlice', name: 'Alice (Designer)', avatarUrl: '/avatars/01.png', type: 'user'}, {id: 'currentUser', name: 'J.Doe', type: 'user'}] },
  'agent001': { id: 'agent001', name: 'CoderBot-Alpha', type: 'agent', avatarUrl: '/avatars/agent-coder.png', lastMessage: "Script finalizado.", timestamp: "09:15", participantsDetails: [{id: 'agent001', name: 'CoderBot-Alpha', avatarUrl: '/avatars/agent-coder.png', type: 'agent'}, {id: 'currentUser', name: 'J.Doe', type: 'user'}] },
};

const mockDmMessagesDb: Record<string, ChatMessage[]> = {
  'userAlice': [
    { id: 'dm_m1', sender: {id: 'userJdoe', name: 'J.Doe', type: 'user'}, content: "Oi Alice, tudo bem?", timestamp: "Ontem 14:30" },
    { id: 'dm_m2', sender: {id: 'userAlice', name: 'Alice (Designer)', type: 'user', avatarUrl: '/avatars/01.png'}, content: "Tudo sim! E com você? Viu o novo layout?", timestamp: "Ontem 14:32" },
    { id: 'dm_m3', sender: {id: 'userJdoe', name: 'J.Doe', type: 'user'}, content: "Vi sim, ficou ótimo!", timestamp: "Ontem 14:35" },
  ],
  'agent001': [
    { id: 'dm_ag_m1', sender: { id: 'userJdoe', name: 'J.Doe', type: 'user' }, content: 'Preciso de um script que automatize X, Y e Z.', timestamp: '10:28' },
    { id: 'dm_ag_m2', sender: { id: 'agent001', name: 'CoderBot-Alpha', type: 'agent', avatarUrl: '/avatars/agent-coder.png' }, content: 'Entendido. Posso começar a trabalhar nisso agora. Alguma preferência de linguagem?', timestamp: '10:29' },
    { id: 'dm_ag_m3', sender: { id: 'userJdoe', name: 'J.Doe', type: 'user' }, content: 'Python seria ideal.', timestamp: '10:30' },
    { id: 'dm_ag_m4', sender: { id: 'agent001', name: 'CoderBot-Alpha', type: 'agent', avatarUrl: '/avatars/agent-coder.png' }, content: 'Perfeito. Script finalizado e enviado para seu repositório.', timestamp: '11:15' },
  ],
};
// --- End Mock Data ---


function DirectMessagePage() {
  const params = useParams({ from: '/(app)/user/dm/$conversationId/' });
  const conversationId = params.conversationId;
  const router = useRouter();

  const [conversation, setConversation] = useState<DMConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock current user ID for ChatWindow
  const currentUserId = "userJdoe"; // Or fetch from auth context

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call to fetch conversation details and messages
    setTimeout(() => {
      const foundConversation = mockDMConversationsDb[conversationId];
      const foundMessages = mockDmMessagesDb[conversationId] || [];

      if (foundConversation) {
        setConversation(foundConversation);
        setMessages(foundMessages);
      } else {
        toast.error(`Conversa DM com ID "${conversationId}" não encontrada.`);
        // Optionally redirect or show a more specific "not found" UI
      }
      setIsLoading(false);
    }, 300);
  }, [conversationId]);

  const handleSendMessage = (content: string) => {
    if (!conversation) return;

    console.log(`Sending DM to ${conversation.name}: ${content}`);
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: { id: currentUserId, name: 'J.Doe', type: 'user' },
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);
    // Also update the mockDmMessagesDb for persistence across re-renders/navigation (for demo)
    const currentMockConvMessages = mockDmMessagesDb[conversation.id] || [];
    mockDmMessagesDb[conversation.id] = [...currentMockConvMessages, newMessage];
  };


  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center p-8">Carregando conversa...</div>;
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <h2 className="text-xl font-semibold mb-2">Conversa não encontrada</h2>
        <Button onClick={() => router.history.back()} variant="outline" className="mt-4"> {/* Changed to router.history.back() */}
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>
    );
  }

  // Adapt DMConversation to the simpler Conversation type expected by ChatWindow if necessary
  // Or update ChatWindow to accept DMConversation. For now, assuming ChatWindow's Conversation type is compatible enough.
  const chatWindowConversation = {
      id: conversation.id,
      name: conversation.name,
      type: conversation.type as 'dm' | 'channel', // Cast if DMConversation type is more specific
      avatarUrl: conversation.avatarUrl,
      // participants: conversation.participantsDetails?.length // Example if ChatWindow needs participant count
  };

  return (
    <ChatWindow
      conversation={chatWindowConversation}
      messages={messages}
      onSendMessage={handleSendMessage}
      isLoading={isLoading} // Could be a different loading state for sending messages
      currentUserId={currentUserId}
    />
  );
}

export const Route = createFileRoute('/(app)/user/dm/$conversationId')({
  component: DirectMessagePage,
});
