import { create } from 'zustand';
import { api } from '@/lib/tauri-api';
import type {
  Message,
  CreateMessageInput,
  UpdateMessageInput,
  ListMessagesInput,
  SearchMessagesInput,
} from '@/lib/types';

type MessagesState = {
  messages: Record<string, Message[]>; // conversationId -> messages
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
};

type MessagesActions = {
  fetchMessages: (
    input: ListMessagesInput,
    token: string
  ) => Promise<void>;
  createMessage: (
    input: CreateMessageInput,
    token: string
  ) => Promise<Message>;
  updateMessage: (
    input: UpdateMessageInput,
    token: string
  ) => Promise<Message>;
  deleteMessage: (id: string, conversationId: string, token: string) => Promise<void>;
  searchMessages: (
    input: SearchMessagesInput,
    token: string
  ) => Promise<Message[]>;
  getMessageHistory: (
    conversationId: string,
    lastN: number,
    token: string
  ) => Promise<Message[]>;
  sendStreamingMessage: (
    conversationId: string,
    content: string,
    agentId: string,
    token: string,
    onChunk: (chunk: string) => void
  ) => Promise<Message>;
  clearError: () => void;
  clearMessages: (conversationId: string) => void;
};

type MessagesStore = MessagesState & MessagesActions;

export const useMessagesStore = create<MessagesStore>((set, get) => ({
  // State
  messages: {},
  isLoading: false,
  isSending: false,
  error: null,

  // Actions
  fetchMessages: async (input: ListMessagesInput, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await api.messages.list(input, token);
      set((state) => ({
        messages: {
          ...state.messages,
          [input.conversation_id]: messages,
        },
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch messages',
        isLoading: false,
      });
      throw error;
    }
  },

  createMessage: async (input: CreateMessageInput, token: string) => {
    set({ isSending: true, error: null });
    try {
      const message = await api.messages.create(input, token);
      set((state) => ({
        messages: {
          ...state.messages,
          [input.conversation_id]: [
            ...(state.messages[input.conversation_id] || []),
            message,
          ],
        },
        isSending: false,
      }));
      return message;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create message',
        isSending: false,
      });
      throw error;
    }
  },

  updateMessage: async (input: UpdateMessageInput, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMessage = await api.messages.update(input, token);

      // Find the conversation that contains this message
      const state = get();
      let conversationId = '';

      for (const [cid, msgs] of Object.entries(state.messages)) {
        if (msgs.some(m => m.id === input.id)) {
          conversationId = cid;
          break;
        }
      }

      if (conversationId) {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId].map((message) =>
              message.id === input.id ? updatedMessage : message
            ),
          },
          isLoading: false,
        }));
      }

      return updatedMessage;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update message',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteMessage: async (id: string, conversationId: string, token: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.messages.delete(id, token);
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId]?.filter(
            (message) => message.id !== id
          ) || [],
        },
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete message',
        isLoading: false,
      });
      throw error;
    }
  },

  searchMessages: async (input: SearchMessagesInput, token: string) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await api.messages.search(input, token);
      set({ isLoading: false });
      return messages;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to search messages',
        isLoading: false,
      });
      throw error;
    }
  },

  getMessageHistory: async (
    conversationId: string,
    lastN: number,
    token: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await api.messages.getHistory(conversationId, lastN, token);
      set({ isLoading: false });
      return messages;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to get message history',
        isLoading: false,
      });
      throw error;
    }
  },

  sendStreamingMessage: async (
    conversationId: string,
    content: string,
    agentId: string,
    token: string,
    onChunk: (chunk: string) => void
  ) => {
    set({ isSending: true, error: null });
    try {
      const message = await api.messages.sendStreaming(
        conversationId,
        content,
        agentId,
        token,
        onChunk
      );

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [
            ...(state.messages[conversationId] || []),
            message,
          ],
        },
        isSending: false,
      }));

      return message;
    } catch (error: any) {
      set({
        error: error.message || 'Failed to send streaming message',
        isSending: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  clearMessages: (conversationId: string) => {
    set((state) => {
      const newMessages = { ...state.messages };
      delete newMessages[conversationId];
      return { messages: newMessages };
    });
  },
}));
