import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/presentation/ui/components/ui/avatar';
import { cn } from '@/presentation/ui/lib/utils'; // For conditional class names

// Definindo a interface aqui temporariamente, idealmente viria de um arquivo de tipos compartilhado
export interface ChatMessageSender {
  id: string;
  name: string;
  type: 'user' | 'agent';
  avatarUrl?: string;
}
export interface ChatMessage {
  id: string;
  sender: ChatMessageSender;
  content: string;
  timestamp: string | Date; // Pode ser string formatada ou objeto Date
  type?: 'text' | 'tool_call' | 'tool_response' | 'error' | 'system'; // Adicionado 'system'
  isContinuation?: boolean; // Para agrupar mensagens do mesmo sender
}

interface MessageItemProps {
  message: ChatMessage;
  isCurrentUser: boolean; // Para alinhar a mensagem
}

export function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const senderName = message.sender.type === 'user' ? 'Você' : message.sender.name;
  const time = message.timestamp instanceof Date
    ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : message.timestamp;

  // System messages might have a different layout
  if (message.type === 'system') {
    return (
      <div className="py-2 px-4 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">{message.content}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isCurrentUser ? "justify-end" : "justify-start",
        message.isContinuation ? "mt-1" : "mt-3" // Less margin if it's a continuation
      )}
    >
      {!isCurrentUser && !message.isContinuation && (
        <Avatar className="h-7 w-7">
          <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />
          <AvatarFallback>{message.sender.name.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      {!isCurrentUser && message.isContinuation && (
        <div className="w-7 h-7 flex-shrink-0" /> // Spacer for alignment
      )}

      <div
        className={cn(
          "max-w-[70%] p-2.5 rounded-lg shadow-sm",
          isCurrentUser
            ? "bg-sky-600 text-white rounded-br-none"
            : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none",
           message.type === 'error' ? "bg-red-100 dark:bg-red-800/50 border border-red-500/50" : ""
        )}
      >
        {!message.isContinuation && (
          <p className={cn(
            "text-xs font-semibold mb-0.5",
            isCurrentUser ? "text-sky-100" : "text-slate-600 dark:text-slate-300"
          )}>
            {senderName}
          </p>
        )}
        {/* TODO: Implement Markdown rendering for message.content */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
          {message.type === 'error' && <span className="text-red-500 dark:text-red-400 ml-1">(Erro)</span>}
        </p>
        <p className={cn(
            "text-xs mt-1 text-right",
            isCurrentUser ? "text-sky-200/80" : "text-slate-400 dark:text-slate-500"
        )}>
          {time}
        </p>
      </div>

      {isCurrentUser && !message.isContinuation && (
         <Avatar className="h-7 w-7">
           {/* Assuming current user has no avatar or it's handled differently */}
          <AvatarFallback className="bg-sky-600 text-white">
            {/* Could be user initials if available */}
            {message.sender.name.substring(0,1).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
       {isCurrentUser && message.isContinuation && (
        <div className="w-7 h-7 flex-shrink-0" /> // Spacer for alignment
      )}
    </div>
  );
}
