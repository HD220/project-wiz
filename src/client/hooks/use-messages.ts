import { useState, useCallback } from "react";
import type { IHistoryService } from "../../core/domain/ports/history-service.port";

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  [key: string]: any;
}

interface UseMessagesResult {
  messages: Message[];
  loading: boolean;
  error: string | null;
  fetchMessages: (conversationId: string) => Promise<void>;
  addMessage: (conversationId: string, role: "user" | "assistant", content: string) => Promise<void>;
}

export function useMessages(historyService: IHistoryService): UseMessagesResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await historyService.getMessages(conversationId);
      setMessages(data);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar mensagens");
    } finally {
      setLoading(false);
    }
  }, [historyService]);

  const addMessage = useCallback(async (conversationId: string, role: "user" | "assistant", content: string) => {
    setLoading(true);
    setError(null);
    try {
      await historyService.addMessage(conversationId, role, content);
      await fetchMessages(conversationId);
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar mensagem");
    } finally {
      setLoading(false);
    }
  }, [historyService, fetchMessages]);

  return {
    messages,
    loading,
    error,
    fetchMessages,
    addMessage,
  };
}