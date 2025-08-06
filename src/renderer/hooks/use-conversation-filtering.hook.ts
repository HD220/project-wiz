import { useMemo } from "react";

// Generic conversation type with archive capability
interface ConversationWithArchive {
  archivedAt: Date | null;
}

export function useConversationFiltering<T extends ConversationWithArchive>(conversations: T[], showArchived: boolean) {
  const activeConversations = useMemo(() => conversations.filter(conv => !conv.archivedAt), [conversations]);
  const archivedConversations = useMemo(() => conversations.filter(conv => conv.archivedAt), [conversations]);
  
  const displayConversations = useMemo(() => {
    return showArchived 
      ? [...activeConversations, ...archivedConversations]
      : activeConversations;
  }, [showArchived, activeConversations, archivedConversations]);

  return { activeConversations, archivedConversations, displayConversations };
}
