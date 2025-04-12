import { useState, useCallback } from "react";
import { IpcHistoryServiceAdapter } from "../services/ipc-history-service-adapter";
import { Conversation, Message, ExportFormat } from "../types/history";
import { useAsyncAction } from "./use-async-action";

/**
 * Singleton instance of the history service.
 */
const historyService = new IpcHistoryServiceAdapter();

/**
 * Hook to manage conversations: list, create, delete, rename.
 */
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const [execute, loading, error, setError] = useAsyncAction();

  const fetchConversations = useCallback(
    execute(async () => {
      const data = await historyService.getAllConversations();
      setConversations(data as Conversation[]);
    }),
    []
  );

  const createConversation = useCallback(
    execute(async (title?: string) => {
      await historyService.createConversation(title);
      await fetchConversations();
    }),
    [fetchConversations]
  );

  const deleteConversation = useCallback(
    execute(async (conversationId: string) => {
      await historyService.deleteConversation(conversationId);
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
      await fetchConversations();
    }),
    [fetchConversations, selectedConversation]
  );

  const renameConversation = useCallback(
    execute(async (conversationId: string, newTitle: string) => {
      await historyService.renameConversation(conversationId, newTitle);
      await fetchConversations();
    }),
    [fetchConversations]
  );

  const selectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
  }, []);

  return {
    conversations,
    selectedConversation,
    loading,
    error,
    setError,
    fetchConversations,
    createConversation,
    deleteConversation,
    renameConversation,
    selectConversation,
  };
}

/**
 * Hook to manage messages of a conversation.
 */
export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [execute, loading, error, setError] = useAsyncAction();

  const fetchMessages = useCallback(
    execute(async (conversationId: string) => {
      const data = await historyService.getMessages(conversationId);
      setMessages(data as Message[]);
    }),
    []
  );

  const addMessage = useCallback(
    execute(async (conversationId: string, role: "user" | "assistant", content: string) => {
      await historyService.addMessage(conversationId, role, content);
      await fetchMessages(conversationId);
    }),
    [fetchMessages]
  );

  return {
    messages,
    loading,
    error,
    setError,
    fetchMessages,
    addMessage,
  };
}

/**
 * Utility to export conversation history.
 */
export async function exportHistory(format: ExportFormat): Promise<Blob | string | null> {
  try {
    return await historyService.exportHistory(format);
  } catch (err: any) {
    // Error message should be handled by the caller and integrated with i18n if needed
    throw new Error(err.message || "Error exporting history");
  }
}