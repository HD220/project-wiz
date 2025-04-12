import { useState, useCallback } from "react";
import { IpcHistoryServiceAdapter } from "../services/ipc-history-service-adapter";
import { Conversation } from "../types/history";
import { IHistoryService } from "../types/history-service";
import { useAsyncAction } from "./use-async-action";

/**
 * Hook to manage conversations: list, create, delete, rename.
 * Allows optional injection of a history service for testability.
 */
export function useConversations(historyService?: IHistoryService) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const [execute, loading, error, setError] = useAsyncAction();

  // Use injected service or default to IPC adapter
  const service = historyService ?? new IpcHistoryServiceAdapter();

  const fetchConversations = useCallback(
    execute(async () => {
      try {
        const data = await service.getAllConversations();
        if (!Array.isArray(data)) throw new Error("Invalid conversations data");
        setConversations(data as Conversation[]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch conversations");
      }
    }),
    [service]
  );

  const createConversation = useCallback(
    execute(async (title?: string) => {
      if (title !== undefined && typeof title !== "string") {
        throw new Error("Title must be a string");
      }
      try {
        await service.createConversation(title);
        await fetchConversations();
      } catch (err: any) {
        setError(err.message || "Failed to create conversation");
      }
    }),
    [service, fetchConversations]
  );

  const deleteConversation = useCallback(
    execute(async (conversationId: string) => {
      if (!conversationId || typeof conversationId !== "string") {
        throw new Error("Invalid conversation ID");
      }
      try {
        await service.deleteConversation(conversationId);
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
        }
        await fetchConversations();
      } catch (err: any) {
        setError(err.message || "Failed to delete conversation");
      }
    }),
    [service, fetchConversations, selectedConversation]
  );

  const renameConversation = useCallback(
    execute(async (conversationId: string, newTitle: string) => {
      if (!conversationId || typeof conversationId !== "string") {
        throw new Error("Invalid conversation ID");
      }
      if (!newTitle || typeof newTitle !== "string") {
        throw new Error("Invalid new title");
      }
      try {
        await service.renameConversation(conversationId, newTitle);
        await fetchConversations();
      } catch (err: any) {
        setError(err.message || "Failed to rename conversation");
      }
    }),
    [service, fetchConversations]
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