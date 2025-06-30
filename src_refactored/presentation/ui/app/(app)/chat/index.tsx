import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'; // Removed useRouter
import { Bot, Hash, Loader2, ServerCrash, ArrowLeft } from 'lucide-react'; // Removed MessageSquare
import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/presentation/ui/components/ui/button';
import { ChatWindow } from '@/presentation/ui/features/chat/components/ChatWindow';
// ConversationItemType import removed
import { useIpcMutation } from '@/presentation/ui/hooks/ipc/useIpcMutation';
import { useIpcQuery } from '@/presentation/ui/hooks/ipc/useIpcQuery';
import { useIpcSubscription } from '@/presentation/ui/hooks/ipc/useIpcSubscription';

import { IPC_CHANNELS } from '@/shared/ipc-channels';
import type {
  // ChatMessage import removed
  // Using DM types as placeholders for generic conversation types
  GetDMMessagesRequest as GetConversationMessagesRequest,
  GetDMMessagesResponseData as GetConversationMessagesResponseData,
  DMMessageReceivedEventPayload as ConversationMessageReceivedEventPayload,
  SendDMMessageRequest as SendConversationMessageRequest,
  SendDMMessageResponseData as SendConversationMessageResponseData,
  IPCResponse,
  GetDMConversationsListResponseData, // For fetching sidebar conversations
  DirectMessageItem
} from '@/shared/ipc-types';

// This type is for the data structure ChatWindow expects for a conversation header.
interface ChatWindowConversationHeader {
  id: string;
  name: string;
  type: 'dm' | 'channel' | 'agent'; // Added 'agent'
  avatarUrl?: string;
}

// Mock current user ID - this would ideally come from a global user context/store
const currentUserId = "userJdoe"; // Replace with actual user ID logic

// Schema for route search parameters
const chatSearchSchema = z.object({
  conversationId: z.string().optional(),
});

// ConversationItemUIData interface removed, DirectMessageItem will be used directly.


// Placeholder IPC Channels - these would need to be defined in shared/ipc-channels.ts
// and implemented in the main process if they don't already map to DM channels.
const GET_CONVERSATION_MESSAGES_CHANNEL = IPC_CHANNELS.GET_DM_MESSAGES; // Placeholder
const SEND_CONVERSATION_MESSAGE_CHANNEL = IPC_CHANNELS.SEND_DM_MESSAGE; // Placeholder
const CONVERSATION_MESSAGE_RECEIVED_EVENT_CHANNEL = IPC_CHANNELS.DM_MESSAGE_RECEIVED_EVENT; // Placeholder
// For sidebar, using DM conversations list for now
const GET_SIDEBAR_CONVERSATIONS_CHANNEL = IPC_CHANNELS.GET_DM_CONVERSATIONS_LIST;


function ChatPage() {
  // router removed as it was unused
  const navigate = useNavigate({ from: Route.fullPath });
  const { conversationId: selectedConversationIdFromSearch } = Route.useSearch();

  // Local state to manage selected conversation ID, synced with URL search param
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(selectedConversationIdFromSearch);

  useEffect(() => {
    setSelectedConversationId(selectedConversationIdFromSearch);
  }, [selectedConversationIdFromSearch]);

  // Fetch conversations for the sidebar (using DM list as placeholder)
  const { data: sidebarConversations, isLoading: isLoadingSidebarConvs, error: sidebarConvsError } =
    useIpcQuery<null, GetDMConversationsListResponseData>(
      GET_SIDEBAR_CONVERSATIONS_CHANNEL,
      null,
      { staleTime: 5 * 60 * 1000 } // Cache for 5 minutes
    );

  // Derive the selected conversation details from the fetched sidebar list
  const selectedConversationDetails = useMemo(() => {
    if (!selectedConversationId || !sidebarConversations) return null;
    // Adapt this find logic if sidebarConversations has a different structure
    return sidebarConversations.find(conv => conv.id === selectedConversationId) || null;
  }, [selectedConversationId, sidebarConversations]);


  // Fetch initial messages and subscribe for real-time updates
  const { data: messages, isLoading: isLoadingMessages, error: messagesError } = useIpcSubscription<
    GetConversationMessagesRequest,
    GetConversationMessagesResponseData,
    ConversationMessageReceivedEventPayload
  >(
    GET_CONVERSATION_MESSAGES_CHANNEL,
    { conversationId: selectedConversationId || '' }, // Request payload
    CONVERSATION_MESSAGE_RECEIVED_EVENT_CHANNEL,
    {
      getSnapshot: (prevMessages, eventPayload) => {
        if (eventPayload.conversationId === selectedConversationId) {
          if (prevMessages?.find(msg => msg.id === eventPayload.message.id)) {
            return prevMessages; // Avoid duplicates
          }
          return [...(prevMessages || []), eventPayload.message];
        }
        return prevMessages || [];
      },
      onError: (err) => {
        toast.error(`Erro na subscrição de mensagens: ${err.message}`);
      },
      // Only enable if a conversation is selected
      enabled: !!selectedConversationId,
    }
  );

  // Mutation for sending messages
  const sendMessageMutation = useIpcMutation<
    SendConversationMessageRequest,
    IPCResponse<SendConversationMessageResponseData>
  >(
    SEND_CONVERSATION_MESSAGE_CHANNEL,
    {
      onSuccess: (response) => {
        if (!response.success) {
          toast.error(`Falha ao enviar mensagem: ${response.error?.message || 'Erro desconhecido.'}`);
        }
        // Message list updates via CONVERSATION_MESSAGE_RECEIVED_EVENT
      },
      onError: (error) => {
        toast.error(`Erro ao enviar mensagem: ${error.message}`);
      },
    }
  );

  const handleSendMessage = (content: string) => {
    if (!selectedConversationId) {
      toast.error("Nenhuma conversa selecionada.");
      return;
    }
    if (sendMessageMutation.isLoading) {
      toast.info("Aguarde o envio da mensagem anterior.");
      return;
    }
    sendMessageMutation.mutate({ conversationId: selectedConversationId, content });
  };

  const handleSelectConversation = (convId: string) => {
    navigate({ search: (prev) => ({ ...prev, conversationId: convId }), replace: true });
  };


  if (isLoadingSidebarConvs) {
    return <div className="flex-1 flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-sky-500"/> Carregando conversas...</div>;
  }

  if (sidebarConvsError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-red-50 dark:bg-red-900/10">
        <ServerCrash className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Erro ao Carregar Lista de Conversas</h2>
        <p className="text-sm text-red-600 dark:text-red-400 mb-1">{sidebarConvsError.message}</p>
        {/* Optional: Button to retry or go back */}
      </div>
    );
  }

  const chatWindowConversationHeader: ChatWindowConversationHeader | null = selectedConversationDetails ? {
    id: selectedConversationDetails.id,
    name: selectedConversationDetails.name,
    // Assuming DirectMessageItem 'type' can be 'agent' or needs mapping
    type: selectedConversationDetails.type === 'agent' ? 'agent' : (selectedConversationDetails.type === 'dm' ? 'dm' : 'channel'),
    avatarUrl: selectedConversationDetails.avatarUrl,
  } : null;


  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Painel Esquerdo: Lista de Conversas/Agentes */}
      <aside className="w-64 md:w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col">
        <header className="p-3 border-b border-slate-200 dark:border-slate-800">
          <Button variant="ghost" size="sm" className="mb-2 w-full justify-start" asChild>
            <Link to="/user"> <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para DMs </Link>
          </Button>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Conversas</h2>
        </header>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {(sidebarConversations || []).map((conv: DirectMessageItem) => ( // Replaced ConversationItemUIData with DirectMessageItem
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
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
        {messagesError && !isLoadingMessages && selectedConversationId && (
          <div className="p-4 text-center bg-red-50 dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">
              Erro ao carregar mensagens: {messagesError.message}. Tentando reconectar...
            </p>
          </div>
        )}
        <ChatWindow
          conversation={chatWindowConversationHeader}
          messages={messages || []}
          onSendMessage={handleSendMessage}
          isLoading={isLoadingMessages && !messagesError} // Show loading only if no error
          currentUserId={currentUserId} // Pass currentUserId
        />
      </main>

      {/* Painel Direito: Informações Contextuais (Opcional) - Kept for structure, can be removed if not planned */}
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
  validateSearch: (search) => chatSearchSchema.parse(search), // Validate search params
});
