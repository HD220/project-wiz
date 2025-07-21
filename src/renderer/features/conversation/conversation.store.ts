import { create } from "zustand";

import type {
  ConversationWithParticipants,
  ConversationWithMessagesAndParticipants,
  AuthenticatedUser,
  MessageWithLlmData,
} from "./conversation.types";

import { conversationApi } from "./conversation.api";
import { useAuthStore } from "@/renderer/store/auth.store";

// Helper function to get current user ID
const getCurrentUserId = (): string => {
  const authState = useAuthStore.getState();
  if (!authState.user?.id) {
    throw new Error("User not authenticated");
  }
  return authState.user.id;
};

interface ConversationState {
  // State
  conversations: ConversationWithParticipants[];
  selectedConversation: ConversationWithMessagesAndParticipants | null;
  availableUsers: AuthenticatedUser[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  isCreatingConversation: boolean;
  error: string | null;

  // Actions
  loadConversations: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  loadAvailableUsers: () => Promise<void>;
  createConversation: (participantIds: string[]) => Promise<string>; // Returns new conversation ID
  sendMessage: (content: string) => Promise<void>;
  clearError: () => void;
  clearSelectedConversation: () => void;

  // Computed helpers
  getConversationDisplayName: (conversation: ConversationWithParticipants) => string;
  getLastMessage: (conversationId: string) => MessageWithLlmData | null;
  getOtherParticipants: (conversation: ConversationWithParticipants) => string[];
}

export const useConversationStore = create<ConversationState>()((set, get) => ({
  // Initial state
  conversations: [],
  selectedConversation: null,
  availableUsers: [],
  isLoading: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  isCreatingConversation: false,
  error: null,

  // Load all DM conversations for current user
  loadConversations: async () => {
    set({ isLoading: true, error: null });

    try {
      const conversations = await conversationApi.getUserConversations();
      
      // Sort by last updated (most recent first)
      conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      set({
        conversations,
        isLoading: false,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load conversations",
      });
      throw error;
    }
  },

  // Select and load a conversation with its messages
  selectConversation: async (conversationId: string) => {
    set({ isLoadingMessages: true, error: null });

    try {
      const conversationWithMessages = await conversationApi.getConversationWithMessages(conversationId);
      
      if (!conversationWithMessages) {
        throw new Error("Conversation not found");
      }

      set({
        selectedConversation: conversationWithMessages,
        isLoadingMessages: false,
      });
    } catch (error) {
      set({
        isLoadingMessages: false,
        error: error instanceof Error ? error.message : "Failed to load conversation",
      });
      throw error;
    }
  },

  // Load available users for creating new conversations
  loadAvailableUsers: async () => {
    try {
      const users = await conversationApi.getAvailableUsers();
      const currentUserId = getCurrentUserId();
      
      // Filter out current user from available users
      const availableUsers = users.filter(user => user.id !== currentUserId);
      
      set({ availableUsers });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load users",
      });
      throw error;
    }
  },

  // Create new conversation
  createConversation: async (participantIds: string[]): Promise<string> => {
    set({ isCreatingConversation: true, error: null });

    try {
      const newConversation = await conversationApi.createConversation(participantIds);
      
      // Add to conversations list at the beginning (most recent)
      const currentConversations = get().conversations;
      set({
        conversations: [newConversation, ...currentConversations],
        isCreatingConversation: false,
      });

      return newConversation.id;
    } catch (error) {
      set({
        isCreatingConversation: false,
        error: error instanceof Error ? error.message : "Failed to create conversation",
      });
      throw error;
    }
  },

  // Send message to current conversation
  sendMessage: async (content: string) => {
    const selectedConversation = get().selectedConversation;
    if (!selectedConversation) {
      throw new Error("No conversation selected");
    }

    set({ isSendingMessage: true, error: null });

    try {
      const currentUserId = getCurrentUserId();
      const message = await conversationApi.sendMessage({
        conversationId: selectedConversation.id,
        authorId: currentUserId,
        content,
      });

      // Add message to current conversation
      const updatedConversation = {
        ...selectedConversation,
        messages: [...selectedConversation.messages, message],
        updatedAt: message.createdAt,
      };

      // Update conversations list to reflect new last message time
      const currentConversations = get().conversations;
      const updatedConversations = currentConversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, updatedAt: message.createdAt }
          : conv
      );

      // Re-sort by updated time
      updatedConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      set({
        selectedConversation: updatedConversation,
        conversations: updatedConversations,
        isSendingMessage: false,
      });
    } catch (error) {
      set({
        isSendingMessage: false,
        error: error instanceof Error ? error.message : "Failed to send message",
      });
      throw error;
    }
  },

  // Clear error state
  clearError: () => {
    set({ error: null });
  },

  // Clear selected conversation
  clearSelectedConversation: () => {
    set({ selectedConversation: null });
  },

  // Helper: Get display name for conversation
  getConversationDisplayName: (conversation: ConversationWithParticipants): string => {
    if (conversation.name) {
      return conversation.name;
    }

    // Fallback: get other participants' names
    const currentUserId = getCurrentUserId();
    const otherParticipants = conversation.participants.filter(
      p => p.participantId !== currentUserId
    );

    if (otherParticipants.length === 1) {
      // 1:1 conversation - try to get the other user's name
      const participantId = otherParticipants[0].participantId;
      const user = get().availableUsers.find(u => u.id === participantId);
      return user?.name || "Unknown User";
    } else if (otherParticipants.length > 1) {
      // Group conversation
      return `Group ${otherParticipants.length + 1}`;
    }

    return "New Conversation";
  },

  // Helper: Get last message for a conversation
  getLastMessage: (conversationId: string): MessageWithLlmData | null => {
    const selectedConversation = get().selectedConversation;
    
    if (selectedConversation?.id === conversationId && selectedConversation.messages.length > 0) {
      const messages = selectedConversation.messages;
      return messages[messages.length - 1];
    }

    return null;
  },

  // Helper: Get other participants (excluding current user)
  getOtherParticipants: (conversation: ConversationWithParticipants): string[] => {
    const currentUserId = getCurrentUserId();
    return conversation.participants
      .filter(p => p.participantId !== currentUserId)
      .map(p => p.participantId);
  },
}));