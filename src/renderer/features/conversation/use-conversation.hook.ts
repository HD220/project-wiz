import { useCallback } from "react";
import { useConversationStore } from "./conversation.store";

/**
 * Custom hook for conversation-related operations
 * Provides higher-level functions and computed values
 */
export function useConversation() {
  const store = useConversationStore();

  // Helper to get conversation display info
  const getConversationInfo = useCallback((conversationId: string) => {
    const conversation = store.conversations.find(c => c.id === conversationId);
    if (!conversation) return null;

    const displayName = store.getConversationDisplayName(conversation);
    const otherParticipantIds = store.getOtherParticipants(conversation);
    const otherParticipants = store.availableUsers.filter(user => 
      otherParticipantIds.includes(user.id)
    );
    const lastMessage = store.getLastMessage(conversationId);

    return {
      conversation,
      displayName,
      otherParticipants,
      lastMessage,
      isGroup: otherParticipants.length > 1,
    };
  }, [store]);

  // Helper to check if user can send messages
  const canSendMessage = useCallback(() => {
    return !!store.selectedConversation && !store.isSendingMessage;
  }, [store.selectedConversation, store.isSendingMessage]);

  // Helper to get unread count (mock implementation)
  const getUnreadCount = useCallback((conversationId: string) => {
    // This would be implemented with real backend data
    // For now, return 0 as we don't have read status tracking
    return 0;
  }, []);

  // Helper to start a new conversation with specific users
  const startConversation = useCallback(async (participantIds: string[]) => {
    try {
      const conversationId = await store.createConversation(participantIds);
      await store.selectConversation(conversationId);
      return conversationId;
    } catch (error) {
      console.error("Failed to start conversation:", error);
      throw error;
    }
  }, [store]);

  // Helper to search conversations
  const searchConversations = useCallback((query: string) => {
    if (!query.trim()) return store.conversations;
    
    const lowerQuery = query.toLowerCase();
    return store.conversations.filter(conversation => {
      const displayName = store.getConversationDisplayName(conversation);
      return displayName.toLowerCase().includes(lowerQuery);
    });
  }, [store]);

  return {
    // Store state
    ...store,
    
    // Helper functions
    getConversationInfo,
    canSendMessage,
    getUnreadCount,
    startConversation,
    searchConversations,
    
    // Computed values
    hasConversations: store.conversations.length > 0,
    isLoaded: !store.isLoading && store.conversations.length >= 0,
  };
}