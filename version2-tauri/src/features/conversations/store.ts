import { create } from 'zustand';
import { api } from '@/lib/tauri-api';
import type {
  Conversation,
  CreateConversationInput,
  UpdateConversationInput,
  ParticipantInput,
} from '@/lib/types';

type ConversationsState = {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
};

type ConversationsActions = {
  fetchConversations: (token: string) => Promise<void>;
  createConversation: (
    input: CreateConversationInput,
    token: string
  ) => Promise<Conversation>;
  updateConversation: (
    input: UpdateConversationInput,
    token: string
  ) => Promise<Conversation>;
  archiveConversation: (id: string, token: string) => Promise<void>;
  deleteConversation: (id: string, token: string) => Promise<void>;
  addParticipant: (input: ParticipantInput, token: string) => Promise<void>;
  removeParticipant: (input: ParticipantInput, token: string) => Promise<void>;
  clearError: () => void;
};

type ConversationsStore = ConversationsState & ConversationsActions;

export const useConversationsStore = create<ConversationsStore>((set) => ({
  // State
  conversations: [],
  isLoading: false,
  error: null,

  // Actions
  fetchConversations: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const conversations = await api.conversations.list(token);
      set({ conversations, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch conversations',
        isLoading: false,
      });
      throw error;
    }
  },

  createConversation: async (
    input: CreateConversationInput,
    token: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const conversation = await api.conversations.create(input, token);
      set((state) => ({
        conversations: [...state.conversations, conversation],
        isLoading: false,
      }));
      return conversation;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create conversation',
        isLoading: false,
      });
      throw error;
    }
  },

  updateConversation: async (
    input: UpdateConversationInput,
    token: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const updatedConversation = await api.conversations.update(input, token);
      set((state) => ({
        conversations: state.conversations.map((conversation) =>
          conversation.id === input.id ? updatedConversation : conversation
        ),
        isLoading: false,
      }));
      return updatedConversation;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update conversation',
        isLoading: false,
      });
      throw error;
    }
  },

  archiveConversation: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.conversations.archive(id, token);
      set((state) => ({
        conversations: state.conversations.map((conversation) =>
          conversation.id === id
            ? { ...conversation, archived_at: Date.now() }
            : conversation
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to archive conversation',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteConversation: async (id: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.conversations.delete(id, token);
      set((state) => ({
        conversations: state.conversations.filter(
          (conversation) => conversation.id !== id
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete conversation',
        isLoading: false,
      });
      throw error;
    }
  },

  addParticipant: async (input: ParticipantInput, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.conversations.addParticipant(input, token);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to add participant',
        isLoading: false,
      });
      throw error;
    }
  },

  removeParticipant: async (input: ParticipantInput, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.conversations.removeParticipant(input, token);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to remove participant',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
