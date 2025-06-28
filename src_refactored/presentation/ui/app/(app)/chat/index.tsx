import { createFileRoute } from '@tanstack/react-router';
import { MessageSquare, Bot, Hash, Info } from 'lucide-react'; // Users, Settings removed
import React, { useState } from 'react';

import { Button } from '@/presentation/ui/components/ui/button'; // Button imported

// Placeholder components - these will be created in subsequent steps
import { ChatWindow } from '@/presentation/ui/features/chat/components/ChatWindow';
import { ConversationList, ConversationItem } from '@/presentation/ui/features/chat/components/ConversationList'; // Import ConversationList and its type

// Mock data for conversations/agents
// Renamed MockConversation to ConversationItem to match the type from ConversationList.tsx
interface ConversationItemUIData extends ConversationItem { // Keep this, ChatWindow might use a more detailed type later
  id: string;
  name: string;
  type: 'dm' | 'channel'; // Direct Message or Project Channel
  avatarUrl?: string; // For DMs
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  participants?: number;
  // isActive is part of ConversationItem for UI state, not core data here
}

// Mock messages for the ChatWindow
interface MockMessage {
  id: string;
  sender: { name: string; type: 'user' | 'agent'; avatarUrl?: string };
  content: string;
  timestamp: string;
}

const mockMessages: Record<string, MockMessage[]> = {
  'agent-001': [
    { id: 'm1', sender: { name: 'J.Doe', type: 'user' }, content: 'Olá CoderBot, pode me ajudar com um script Python?', timestamp: '10:28' },
    { id: 'm2', sender: { name: 'CoderBot-Alpha', type: 'agent', avatarUrl: '/avatars/agent-coder.png' }, content: 'Claro! Qual é o problema ou requisito?', timestamp: '10:29' },
    { id: 'm3', sender: { name: 'CoderBot-Alpha', type: 'agent', avatarUrl: '/avatars/agent-coder.png' }, content: 'Ok, estou analisando o código agora...', timestamp: '10:30' },
  ],
  'proj-phoenix-general': [
     { id: 'm4', sender: { name: 'Alice', type: 'user', avatarUrl: '/avatars/01.png' }, content: 'Reunião de planejamento às 14h.', timestamp: '09:15' },
  ]
};


const mockConversations: MockConversation[] = [
  { id: 'agent-001', name: 'CoderBot-Alpha', type: 'dm', avatarUrl: '/avatars/agent-coder.png', lastMessage: "Ok, estou analisando o código agora...", timestamp: "10:30", unreadCount: 1 },
  { id: 'user-alice', name: 'Alice (Designer)', type: 'dm', avatarUrl: '/avatars/01.png', lastMessage: "Você viu o novo layout?", timestamp: "Ontem" },
  { id: 'proj-phoenix-general', name: '# geral (Projeto Phoenix)', type: 'channel', lastMessage: "Reunião de planejamento às 14h.", timestamp: "09:15", participants: 12 },
  { id: 'agent-002', name: 'TestMaster-7000', type: 'dm', avatarUrl: '/avatars/agent-qa.png', lastMessage: "Todos os testes passaram!", timestamp: "08:50" },
  { id: 'proj-quimera-dev', name: '# dev (Operação Quimera)', type: 'channel', lastMessage: "Nova PR aberta para o microsserviço X.", timestamp: "Segunda", participants: 5 },
];


function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(mockConversations[0]?.id || null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentMessages, setCurrentMessages] = useState<MockMessage[]>([]); // Will be populated by ChatWindow/MessageList

  const selectedConversation = mockConversations.find(conv => conv.id === selectedConversationId);

  const handleSendMessage = (content: string) => {
    // This is a placeholder. In a real app, this would send the message via IPC/API
    // and then update the local message list optimistically or upon confirmation.
    console.log(`Sending message to ${selectedConversation?.name}: ${content}`);
    const newMessage: MockMessage = {
      id: `msg-${Date.now()}`,
      sender: { name: 'J.Doe', type: 'user' }, // Assuming current user is J.Doe
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    // For UI testing, you might temporarily add to a local state managed here or in ChatWindow
    // For now, just log it. MessageList will use its own mock or passed messages.
    if (selectedConversationId) {
        // This is just for local echo test, ChatWindow would handle its own state or receive updates
        setCurrentMessages(prev => [...prev, newMessage]);
        // In a real scenario, ChatWindow's messages prop would be updated via a central store or query refetch
        const targetMessages = mockMessages[selectedConversationId] || [];
        targetMessages.push(newMessage); // This mutates mockMessages, for demo only
    }
  };


  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Painel Esquerdo: Lista de Conversas/Agentes */}
      <aside className="w-64 md:w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col">
        <header className="p-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Conversas</h2>
          {/* Pode ter um input de busca aqui */}
        </header>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {mockConversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedConversationId(conv.id)}
              className={`w-full flex items-center space-x-3 p-2 rounded-md text-left hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors
                ${selectedConversationId === conv.id ? 'bg-sky-100 dark:bg-sky-700/50 text-sky-700 dark:text-sky-300 font-medium' : 'text-slate-700 dark:text-slate-300'}`}
            >
              {conv.type === 'dm' ? (
                conv.avatarUrl ? <img src={conv.avatarUrl} alt={conv.name} className="h-8 w-8 rounded-full" /> : <Bot className="h-7 w-7 text-slate-500" />
              ) : (
                <Hash className="h-5 w-5 text-slate-500" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm truncate block">{conv.name}</span>
                {conv.lastMessage && <span className="text-xs text-slate-500 dark:text-slate-400 truncate block">{conv.lastMessage}</span>}
              </div>
              {conv.unreadCount && conv.unreadCount > 0 && (
                <span className="ml-auto text-xs bg-red-500 text-white font-semibold rounded-full px-1.5 py-0.5">
                  {conv.unreadCount}
                </span>
              )}
            </button>
          ))}
        </nav>
        <footer className="p-2 border-t border-slate-200 dark:border-slate-800">
          {/* Pode ter info do usuário ou status aqui */}
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Usuário: J.Doe</p>
        </footer>
      </aside>

      {/* Painel Central: Janela de Chat */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow
          conversation={selectedConversation || null}
          messages={mockMessages[selectedConversationId || ''] || []} // Pass appropriate messages
          onSendMessage={handleSendMessage}
          isLoading={false} // Placeholder
        />
      </main>

      {/* Painel Direito: Informações Contextuais (Opcional) */}
      {/*
      <aside className="w-64 md:w-72 flex-shrink-0 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 hidden lg:block">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Contexto</h3>
        {selectedConversation ? (
          <div>
            <p className="text-sm">Detalhes sobre: <span className="font-medium">{selectedConversation.name}</span></p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tipo: {selectedConversation.type}</p>
            {selectedConversation.type === 'channel' && selectedConversation.participants && (
               <p className="text-xs text-slate-500 dark:text-slate-400">{selectedConversation.participants} membros</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma conversa selecionada.</p>
        )}
      </aside>
      */}
    </div>
  );
}

export const Route = createFileRoute('/(app)/chat/')({
  component: ChatPage,
});
