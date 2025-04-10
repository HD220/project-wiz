import React from "react";
import { ConversationItem } from "./conversation-item";
import { ExportButton } from "./export-button";
import type { Conversation } from "../../hooks/use-history";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation?: Conversation;
  loading: boolean;
  error?: string;
  onSelectConversation: (conv: Conversation) => void;
  onExport: () => void;
  fetchMessages: (conversationId: string) => void;
  formatDate: (dateString?: string) => string;
}

export function ConversationList({
  conversations,
  selectedConversation,
  loading,
  error,
  onSelectConversation,
  onExport,
  fetchMessages,
  formatDate,
}: ConversationListProps) {
  return (
    <div className="w-full md:w-1/4 border rounded p-2 space-y-2 overflow-y-auto max-h-[80vh]">
      <h2 className="font-bold text-lg mb-2">Conversas</h2>
      {loading && <p>Carregando conversas...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          id={conv.id}
          title={conv.title}
          createdAt={conv.createdAt}
          updatedAt={conv.updatedAt}
          selected={selectedConversation?.id === conv.id}
          onSelect={() => {
            onSelectConversation(conv);
            fetchMessages(conv.id);
          }}
          formatDate={formatDate}
        />
      ))}
      {conversations.length === 0 && !loading && <p>Nenhuma conversa encontrada.</p>}
      <ExportButton onExport={onExport} />
    </div>
  );
}