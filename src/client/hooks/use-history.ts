import { useState, useCallback } from "react";

export interface Conversation {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  [key: string]: any;
}

type ExportFormat = "json" | "csv";

interface UseHistoryResult {
  conversations: Conversation[];
  messages: Message[];
  selectedConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  createConversation: (title?: string) => Promise<void>;
  addMessage: (conversationId: string, role: "user" | "assistant", content: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  renameConversation: (conversationId: string, newTitle: string) => Promise<void>;
  exportHistory: (format: ExportFormat) => Promise<Blob | string | null>;
}


export function useHistory(): UseHistoryResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.historyAPI.getConversations();
      setConversations(data as Conversation[]);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar conversas");
    } finally {
      setLoading(false);
    }
  }, []);

  
  const selectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages([]); 
  }, []);

  
  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.historyAPI.getMessages(conversationId);
      setMessages(data as Message[]);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar mensagens");
    } finally {
      setLoading(false);
    }
  }, []);

  
  const createConversation = useCallback(async (title?: string) => {
    setLoading(true);
    setError(null);
    try {
      await window.historyAPI.createConversation(title);
      await fetchConversations();
    } catch (err: any) {
      setError(err.message || "Erro ao criar conversa");
    } finally {
      setLoading(false);
    }
  }, [fetchConversations]);

  
  const addMessage = useCallback(async (conversationId: string, role: "user" | "assistant", content: string) => {
    setLoading(true);
    setError(null);
    try {
      await window.historyAPI.addMessage(conversationId, role, content);
      await fetchMessages(conversationId);
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar mensagem");
    } finally {
      setLoading(false);
    }
  }, [fetchMessages]);

  
  const deleteConversation = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);
    try {
      await window.historyAPI.deleteConversation(conversationId);
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      await fetchConversations();
    } catch (err: any) {
      setError(err.message || "Erro ao deletar conversa");
    } finally {
      setLoading(false);
    }
  }, [fetchConversations, selectedConversation]);

  
  const renameConversation = useCallback(async (conversationId: string, newTitle: string) => {
    setLoading(true);
    setError(null);
    try {
      await window.historyAPI.renameConversation(conversationId, newTitle);
      await fetchConversations();
    } catch (err: any) {
      setError(err.message || "Erro ao renomear conversa");
    } finally {
      setLoading(false);
    }
  }, [fetchConversations]);

  
  const exportHistory = useCallback(async (format: ExportFormat) => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.historyAPI.exportHistory(format);
      return data;
    } catch (err: any) {
      setError(err.message || "Erro ao exportar histórico");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    conversations,
    messages,
    selectedConversation,
    loading,
    error,
    fetchConversations,
    selectConversation,
    fetchMessages,
    createConversation,
    addMessage,
    deleteConversation,
    renameConversation,
    exportHistory,
  };
}