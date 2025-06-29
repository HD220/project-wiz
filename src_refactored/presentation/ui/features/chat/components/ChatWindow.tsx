import { Info, Bot, Hash, MessageSquare } from 'lucide-react'; // Paperclip and Send are now in MessageInput
import React from 'react';

import { Button } from '@/ui/components/ui/button';

import { MessageInput } from './MessageInput'; // Import MessageInput
import { ChatMessage } from './MessageItem';
import { MessageList } from './MessageList';

// Interface para a conversa, pode ser mais detalhada se necessário
interface Conversation {
  id: string;
  name: string;
  type: 'dm' | 'channel';
  avatarUrl?: string;
  participants?: number; // Para canais
}

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: ChatMessage[]; // Usar ChatMessage de MessageItem
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  currentUserId: string; // Necessário para MessageList e MessageItem
}

export function ChatWindow({ conversation, messages, onSendMessage, isLoading, currentUserId }: ChatWindowProps) {
  // const [inputValue, setInputValue] = React.useState(''); // Removed, MessageInput handles its own state

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/30">
         <MessageSquare className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Bem-vindo ao Chat</h2>
        <p className="text-slate-500 dark:text-slate-400">
          Selecione uma conversa na barra lateral para começar.
        </p>
      </div>
    );
  }

  // Removed handleInputChange and handleFormSubmit as MessageInput component now handles this logic.

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          {conversation.type === 'dm' ? (
            conversation.avatarUrl ? (
              <img src={conversation.avatarUrl} alt={conversation.name} className="h-7 w-7 rounded-full" />
            ) : (
              <Bot className="h-6 w-6 text-slate-500" />
            )
          ) : (
            <Hash className="h-5 w-5 text-slate-500" />
          )}
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate">
            {conversation.name}
          </h2>
          {conversation.type === 'channel' && conversation.participants && (
            <span className="text-xs text-slate-500 dark:text-slate-400">({conversation.participants} membros)</span>
          )}
        </div>
        <Button variant="ghost" size="icon" aria-label="Detalhes da Conversa">
          <Info className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </Button>
      </header>

      {/* Message List Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-100 dark:bg-slate-800/30">
        <MessageList messages={messages} isLoading={isLoading} currentUserId={currentUserId} />
      </div>

      {/* Message Input Area */}
      <MessageInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
}
