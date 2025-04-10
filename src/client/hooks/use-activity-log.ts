import { useState, useEffect } from "react";
import { useConversations } from "./use-conversations";
import { useMessages } from "./use-messages";
import { HistoryService } from "../../core/infrastructure/history/history-service";

export function useActivityLog() {
  const historyService = new HistoryService();

  const {
    conversations,
    selectedConversation,
    fetchConversations,
    createConversation,
    deleteConversation,
    renameConversation,
    selectConversation,
    exportHistory,
    loading: loadingConversations,
    error: errorConversations,
  } = useConversations(historyService);

  const {
    messages,
    fetchMessages,
    addMessage,
    loading: loadingMessages,
    error: errorMessages,
  } = useMessages(historyService);

  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation?.id) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages]);

  const filteredMessages = messages.filter(
    (msg) =>
      msg.content.toLowerCase().includes(filter.toLowerCase()) ||
      msg.role.toLowerCase().includes(filter.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return (
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " " +
      date.toLocaleDateString([], { month: "short", day: "numeric" })
    );
  };

  const handleExport = async () => {
    const data = await exportHistory("json");
    if (!data) return;
    const blob =
      data instanceof Blob ? data : new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "historico_conversas.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    conversations,
    selectedConversation,
    messages,
    fetchConversations,
    fetchMessages,
    createConversation,
    deleteConversation,
    renameConversation,
    addMessage,
    selectConversation,
    exportHistory,
    loading: loadingConversations || loadingMessages,
    error: errorConversations || errorMessages,
    filter,
    setFilter,
    filteredMessages,
    formatDate,
    handleExport,
  };
}