import * as React from "react";
import { ChatState } from "./chat.reducer";

// Types for context
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

export type ChatContextValue = {
  state: ChatState;
  actions: ChatActions;
  refs: ChatRefs;
  keyFn: (item: unknown, index: number) => string | number;
};

export const ChatContext = React.createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const context = React.useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a <Chat /> component");
  }
  return context;
}
