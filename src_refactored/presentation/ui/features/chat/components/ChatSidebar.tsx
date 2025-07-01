import { Link } from '@tanstack/react-router';
import { Bot, Hash, Loader2, ServerCrash, ArrowLeft } from 'lucide-react';
import React from 'react';

import { Button } from '@/presentation/ui/components/ui/button';

import type { DirectMessageItem } from '@/shared/ipc-types';

interface ChatSidebarProps {
  conversations: DirectMessageItem[] | null | undefined;
  selectedConversationId: string | undefined;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
  error: Error | null;
}

export function ChatSidebar({ conversations, selectedConversationId, onSelectConversation, isLoading, error }: ChatSidebarProps) {
  if (isLoading) {
    return (
      <aside className="w-64 md:w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Carregando conversas...</p>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-64 md:w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-red-50 dark:bg-red-900/10 flex flex-col items-center justify-center p-4">
        <ServerCrash className="h-8 w-8 text-red-500 dark:text-red-400 mb-2" />
        <p className="text-sm text-red-600 dark:text-red-400 text-center">Erro ao carregar conversas.</p>
        {/* TODO: Add a retry button? */}
      </aside>
    );
  }

  return (
    <aside className="w-64 md:w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col">
      <header className="p-3 border-b border-slate-200 dark:border-slate-800">
        <Button variant="ghost" size="sm" className="mb-2 w-full justify-start" asChild>
          <Link to="/user"> <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para DMs </Link>
        </Button>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Conversas</h2>
      </header>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {(conversations || []).map((conv: DirectMessageItem) => (
          <button
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
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
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Usuário: J.Doe</p>
      </footer>
    </aside>
  );
}
