import { createFileRoute, useParams, useRouter, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/presentation/ui/components/ui/button';
import { ChatWindow } from '@/presentation/ui/features/chat/components/ChatWindow';
import { ChatMessage } from '@/presentation/ui/features/chat/components/MessageItem';
// Using DirectMessageItem for the conversation details from UserSidebar context
import { DirectMessageItem } from '@/presentation/ui/features/user/components/layout/UserSidebar';


// --- Mock Data ---
// This data would typically be fetched based on conversationId or managed in a global store/cache.
// For now, we'll use a simplified version of mockConversations and mockMessages.

// This type is for the data structure ChatWindow expects for a conversation.
// It might be simpler than DirectMessageItem if DirectMessageItem has extra UI-specific fields.
interface ChatWindowConversation {
  id: string;
  name: string;
  type: 'dm' | 'channel' | 'agent'; // ChatWindow might handle these types slightly differently in its header
  avatarUrl?: string;
  participants?: number;
}


const mockDMConversationsDbForPage: Record<string, DirectMessageItem> = {
  userAlice: { id: 'userAlice', name: 'Alice (Designer)', type: 'user', avatarUrl: '/avatars/01.png', lastMessage: "Você viu o novo layout?", timestamp: "Ontem" },
  agent001: { id: 'agent001', name: 'CoderBot-Alpha', type: 'agent', avatarUrl: '/avatars/agent-coder.png', lastMessage: "Script finalizado.", timestamp: "09:15" },
  userBob: { id: 'userBob', name: 'Bob (Backend Dev)', type: 'user', avatarUrl: '/avatars/02.png', lastMessage: "Ajuda com API!" , timestamp: "Terça"},
  agent002: { id: 'agent002', name: 'TestMaster-7000', type: 'agent', avatarUrl: '/avatars/agent-qa.png', lastMessage: "All green!", timestamp: "Segunda" },
};

const mockDmMessagesDbForPage: Record<string, ChatMessage[]> = {
  userAlice: [
    { id: 'dm_m1', sender: {id: 'userJdoe', name: 'J.Doe', type: 'user'}, content: "Oi Alice, tudo bem?", timestamp: "Ontem 14:30" },
    { id: 'dm_m2', sender: {id: 'userAlice', name: 'Alice (Designer)', type: 'user', avatarUrl: '/avatars/01.png'}, content: "Tudo sim! E com você? Viu o novo layout?", timestamp: "Ontem 14:32" },
    { id: 'dm_m3', sender: {id: 'userJdoe', name: 'J.Doe', type: 'user'}, content: "Vi sim, ficou ótimo!", timestamp: "Ontem 14:35" },
  ],
  agent001: [
    { id: 'dm_ag_m1', sender: { id: 'userJdoe', name: 'J.Doe', type: 'user' }, content: 'Preciso de um script que automatize X, Y e Z.', timestamp: '10:28' },
    { id: 'dm_ag_m2', sender: { id: 'agent001', name: 'CoderBot-Alpha', type: 'agent', avatarUrl: '/avatars/agent-coder.png' }, content: 'Entendido. Posso começar a trabalhar nisso agora. Alguma preferência de linguagem?', timestamp: '10:29' },
    { id: 'dm_ag_m3', sender: { id: 'userJdoe', name: 'J.Doe', type: 'user' }, content: 'Python seria ideal.', timestamp: '10:30' },
    { id: 'dm_ag_m4', sender: { id: 'agent001', name: 'CoderBot-Alpha', type: 'agent', avatarUrl: '/avatars/agent-coder.png' }, content: 'Perfeito. Script finalizado e enviado para seu repositório.', timestamp: '11:15' },
  ],
  userBob: [],
  agent002: [],
};
// --- End Mock Data ---


function DirectMessagePage() {
  const params = useParams({ from: '/(app)/user/dm/$conversationId/' });
  const conversationId = params.conversationId;
  const router = useRouter();

  const [conversationDetails, setConversationDetails] = useState<DirectMessageItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = "userJdoe"; // Mock current user ID

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const foundConversation = mockDMConversationsDbForPage[conversationId];
      const foundMessages = mockDmMessagesDbForPage[conversationId] || [];

      if (foundConversation) {
        setConversationDetails(foundConversation);
        setMessages(foundMessages);
      } else {
        toast.error(`Conversa DM com ID "${conversationId}" não encontrada.`);
      }
      setIsLoading(false);
    }, 300);
  }, [conversationId]);

  const handleSendMessage = (content: string) => {
    if (!conversationDetails) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: { id: currentUserId, name: 'J.Doe', type: 'user' },
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);

    const currentMockConvMessages = mockDmMessagesDbForPage[conversationDetails.id] || [];
    mockDmMessagesDbForPage[conversationDetails.id] = [...currentMockConvMessages, newMessage];
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900">Carregando conversa...</div>;
  }

  if (!conversationDetails) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900">
        <h2 className="text-xl font-semibold mb-2">Conversa não encontrada</h2>
        <Button onClick={() => router.navigate({ to: "/user/"})} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para DMs
        </Button>
      </div>
    );
  }

  // Adapt DirectMessageItem to ChatWindowConversation for ChatWindow component
  const chatWindowConversation: ChatWindowConversation = {
      id: conversationDetails.id,
      name: conversationDetails.name,
      // ChatWindow expects 'dm' or 'channel'. 'agent' type from DirectMessageItem can be mapped to 'dm'.
      type: conversationDetails.type === 'agent' ? 'dm' : conversationDetails.type,
      avatarUrl: conversationDetails.avatarUrl,
      // participants: undefined, // DMs typically don't show participant count in header like channels
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden">
        <ChatWindow
        conversation={chatWindowConversation}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={false}
        currentUserId={currentUserId}
        />
    </div>
  );
}

export const Route = createFileRoute('/(app)/user/dm/$conversationId')({
  component: DirectMessagePage,
});
