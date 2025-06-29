import { Bot, Hash, UserCircle2, PlusCircle } from 'lucide-react'; // UserCircle2 for generic user, PlusCircle for new chat
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/components/ui/avatar';
import { Button } from '@/presentation/ui/components/ui/button';
import { Input } from '@/presentation/ui/components/ui/input'; // For potential search within conversations
import { ScrollArea } from '@/presentation/ui/components/ui/scroll-area';
import { cn } from '@/presentation/ui/lib/utils';

// Interface for conversation items, can be expanded
export interface ConversationItem {
  id: string;
  name: string;
  type: 'dm' | 'channel' | 'agent'; // Added 'agent' type for clarity
  avatarUrl?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isActive?: boolean; // To highlight the selected conversation
}

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation?: () => void; // Optional: Handler for starting a new chat/conversation
  // Placeholder for search functionality state if managed outside
  // searchTerm?: string;
  // onSearchTermChange?: (term: string) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationListProps) {
  const [internalSearchTerm, setInternalSearchTerm] = React.useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(internalSearchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <header className="p-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Conversas</h2>
          {onNewConversation && (
            <Button variant="ghost" size="icon" onClick={onNewConversation} aria-label="Nova Conversa">
              <PlusCircle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </Button>
          )}
        </div>
        <Input
          type="search"
          placeholder="Buscar conversas..."
          className="mt-2 h-8"
          value={internalSearchTerm}
          onChange={(e) => setInternalSearchTerm(e.target.value)}
        />
      </header>
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-0.5"> {/* Reduced space-y for tighter packing */}
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  "w-full flex items-center space-x-2.5 p-2 rounded-md text-left transition-colors",
                  "hover:bg-slate-200 dark:hover:bg-slate-700/60",
                  conv.id === selectedConversationId
                    ? "bg-sky-100 dark:bg-sky-700/50 text-sky-700 dark:text-sky-300 font-medium"
                    : "text-slate-700 dark:text-slate-300"
                )}
                aria-current={conv.id === selectedConversationId ? "page" : undefined}
              >
                <Avatar className="h-7 w-7 text-xs flex-shrink-0">
                  {conv.avatarUrl ? (
                    <AvatarImage src={conv.avatarUrl} alt={conv.name} />
                  ) : null}
                  <AvatarFallback className={cn(
                     "text-white",
                     conv.type === 'agent' ? "bg-emerald-500" :
                     conv.type === 'dm' ? "bg-purple-500" :
                     "bg-slate-400 dark:bg-slate-600" // Channel or default
                  )}>
                    {conv.type === 'channel' ? <Hash size={14} /> :
                     conv.type === 'agent' ? <Bot size={14} /> :
                     conv.name.substring(0, 1).toUpperCase() || <UserCircle2 size={14} />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <span className="text-sm truncate block leading-tight">{conv.name}</span>
                  {conv.lastMessage && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate block leading-tight">
                      {conv.lastMessage}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end flex-shrink-0 text-xs">
                    {conv.timestamp && <span className="text-slate-400 dark:text-slate-500 mb-0.5">{conv.timestamp}</span>}
                    {conv.unreadCount && conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white font-semibold rounded-full px-1.5 py-0.5 text-[10px] leading-none">
                        {conv.unreadCount}
                        </span>
                    )}
                </div>
              </button>
            ))
          ) : (
            <p className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              {internalSearchTerm ? "Nenhuma conversa encontrada." : "Nenhuma conversa para exibir."}
            </p>
          )}
        </nav>
      </ScrollArea>
      {/* Footer can be added here if needed, e.g., for quick actions or user status */}
    </div>
  );
}
