// ===========================
// CONVERSATION UI STORE
// ===========================
// Zustand store for UI state ONLY (no server data)

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ConversationUIState } from "../types";

interface ConversationUIActions {
  // Conversation selection
  selectConversation: (conversationId: string | null) => void;
  clearSelection: () => void;

  // Dialog management
  openCreateDialog: () => void;
  closeCreateDialog: () => void;

  // Utility
  reset: () => void;
}

type ConversationUIStore = ConversationUIState & ConversationUIActions;

/**
 * UI-only store for conversation interface state
 * NO server data - that's handled by TanStack Query
 */
export const useConversationUIStore = create<ConversationUIStore>()(
  persist(
    (set) => ({
      // ===========================
      // STATE
      // ===========================
      selectedConversationId: null,
      showCreateDialog: false,

      // ===========================
      // ACTIONS
      // ===========================

      selectConversation: (conversationId) => {
        set({ selectedConversationId: conversationId });
      },

      clearSelection: () => {
        set({ selectedConversationId: null });
      },

      openCreateDialog: () => {
        set({ showCreateDialog: true });
      },

      closeCreateDialog: () => {
        set({ showCreateDialog: false });
      },

      reset: () => {
        set({
          selectedConversationId: null,
          showCreateDialog: false,
        });
      },
    }),
    {
      name: "conversation-ui-storage",
      // Only persist selection, not dialog state
      partialize: (state) => ({
        selectedConversationId: state.selectedConversationId,
      }),
    },
  ),
);
