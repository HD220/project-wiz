// UserCircle2 for generic user, PlusCircle for new chat
import { PlusCircle } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
// For potential search within conversations
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ConversationListItem } from "./ConversationListItem";

// Interface for conversation items, can be expanded
export interface ConversationItem {
  id: string;
  name: string;
  // Added 'agent' type for clarity
  type: "dm" | "channel" | "agent";
  avatarUrl?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  // To highlight the selected conversation
  isActive?: boolean;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  // Optional: Handler for starting a new chat/conversation
  onNewConversation?: () => void;
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
  const [internalSearchTerm, setInternalSearchTerm] = React.useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(internalSearchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full">
      <header className="p-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Conversas
          </h2>
          {onNewConversation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewConversation}
              aria-label="Nova Conversa"
            >
              <PlusCircle className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </Button>
          )}
        </div>
        <Input
          type="search"
          placeholder="Buscar conversas..."
          className="mt-2 h-8"
          value={internalSearchTerm}
          onChange={(event) => setInternalSearchTerm(event.target.value)}
        />
      </header>
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-0.5">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <ConversationListItem
                key={conv.id}
                conv={conv}
                selectedConversationId={selectedConversationId}
                onSelectConversation={onSelectConversation}
              />
            ))
          ) : (
            <p className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              {internalSearchTerm
                ? "Nenhuma conversa encontrada."
                : "Nenhuma conversa para exibir."}
            </p>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}

