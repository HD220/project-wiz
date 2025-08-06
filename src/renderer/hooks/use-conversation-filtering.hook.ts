import { useMemo } from "react";
import type { ConversationWithLastMessage } from "@/renderer/types/chat.types";

export function useConversationFiltering(conversations: ConversationWithLastMessage[], showArchived: boolean) {
  const activeConversations = useMemo(() => conversations.filter(conv => !conv.archivedAt), [conversations]);
  const archivedConversations = useMemo(() => conversations.filter(conv => conv.archivedAt), [conversations]);
  
  const displayConversations = useMemo(() => {
    return showArchived 
      ? [...activeConversations, ...archivedConversations]
      : activeConversations;
  }, [showArchived, activeConversations, archivedConversations]);

  return { activeConversations, archivedConversations, displayConversations };
}
