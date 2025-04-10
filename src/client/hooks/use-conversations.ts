import { useState, useCallback } from "react";
import type { IHistoryService } from "../../core/domain/ports/history-service.port";

export interface Conversation {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export type ExportFormat = "json" | "csv";

interface UseConversationsResult {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  renameConversation: (conversationId: string, newTitle: string) => Promise<void>;
  selectConversation: (conversation: Conversation | null) => void;
  exportHistory: (format: ExportFormat) => Promise<Blob | string | null>;
}

export function useConversations(historyService: IHistoryService): UseConversationsResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await historyService.getConversations();
      setConversations(data);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar conversas");
    } finally {
      setLoading(false);
    }
  }, [historyService]);

  const createConversation = useCallback(async (title?: string) => {
    setLoading(true);
    setError(null);
    try {
      await historyService.createConversation(title);
      await fetchConversations();
    } catch (err: any) {
      setError(err.message || "Erro ao criar conversa");
    } finally {
      setLoading(false);
    }
  }, [historyService, fetchConversations]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await historyService.deleteConversation(conversationId);
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
      await fetchConversations();
    } catch (err: any) {
      setError(err.message || "Erro ao deletar conversa");
    } finally {
      setLoading(false);
    }
  }, [historyService, fetchConversations, selectedConversation]);

  const renameConversation = useCallback(async (conversationId: string, newTitle: string) => {
    setLoading(true);
    setError(null);
    try {
      await historyService.renameConversation(conversationId, newTitle);
      await fetchConversations();
    } catch (err: any) {
      setError(err.message || "Erro ao renomear conversa");
    } finally {
      setLoading(false);
    }
  }, [historyService, fetchConversations]);

  const selectConversation = useCallback((conversation: Conversation | null) => {
    setSelectedConversation(conversation);
  }, []);

  const exportHistory = useCallback(async (format: ExportFormat) => {
    setLoading(true);
    setError(null);
    try {
      const data = await historyService.exportHistory(format);
      return data;
    } catch (err: any) {
      setError(err.message || "Erro ao exportar histórico");
      return null;
    } finally {
      setLoading(false);
    }
  }, [historyService]);

  return {
    conversations,
    selectedConversation,
    loading,
    error,
    fetchConversations,
    createConversation,
    deleteConversation,
    renameConversation,
    selectConversation,
    exportHistory,
  };
}