import * as React from "react";

// Types for reducer - input moved to local state
export type ChatState = {
  messages: unknown[];
  loading: boolean;
  typing: boolean;
  history: string[];
  historyIndex: number;
  autoScroll: boolean;
  pendingMessages: Set<string | number>;
};

// Utility types to reduce duplication - input actions removed
export type ChatActions = {
  addMessage: (message: unknown) => void;
  updateMessage: (
    id: string | number,
    updates: Record<string, unknown>,
  ) => void;
  removeMessage: (id: string | number) => void;
  setMessages: (messages: unknown[] | ((prev: unknown[]) => unknown[])) => void;
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  setAutoScroll: (autoScroll: boolean) => void;
  addPendingMessage: (id: string | number) => void;
  removePendingMessage: (id: string | number) => void;
  send: (input: string) => void;
  clear: () => void;
  navigateHistory: (direction: "up" | "down") => void;
  scrollToBottom: () => void;
  isPending: (id: string | number) => boolean;
};

export type ChatRefs = {
  messagesRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
};

// Utility types para ChatStatus - DRY principle
export type ChatStatusUI = { loading: boolean; typing: boolean };
export type ChatStatusStats = {
  messageCount: number;
  hasMessages: boolean;
  pendingCount: number;
};
export type ChatStatusControl = { autoScroll: boolean };
export type ChatStatusHistory = { index: number; length: number };

export type ChatAction =
  | { type: "ADD_MESSAGE"; payload: unknown }
  | {
      type: "UPDATE_MESSAGE";
      payload: {
        id: string | number;
        updates: Record<string, unknown>;
      };
    }
  | {
      type: "REMOVE_MESSAGE";
      payload: {
        id: string | number;
        };
    }
  | { type: "SET_MESSAGES"; payload: unknown[] }
  | { type: "SET_PROPERTY"; payload: { key: keyof ChatState; value: any } }
  | { type: "ADD_PENDING"; payload: string | number }
  | { type: "REMOVE_PENDING"; payload: string | number }
  | { type: "CLEAR"; payload?: undefined }
  | { type: "NAVIGATE_HISTORY"; payload: "up" | "down" };

export type ChatContextValue = {
  state: ChatState;
  actions: ChatActions;
  refs: ChatRefs;
  keyFn: (item: unknown, index: number) => string | number;
};
