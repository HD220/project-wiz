import { useEffect } from "react";
import { useConversations } from "./use-conversations";
import { useMessages } from "./use-messages";
import { useMessageFilter } from "./use-message-filter";
import { IpcHistoryServiceAdapter } from "../services/ipc-history-service-adapter";
import { formatDateTime } from "../lib/utils";
import { exportDataAsFile } from "../lib/export-history";

/**
 * Exports conversation history as a file using the provided exportHistory function.
 * This function is pure and can be used in UI event handlers.
 */
export async function exportHistoryFile(
  exportHistory: (format: string) => Promise<string | Blob | undefined>,
  filename: string = "conversation_history.json"
) {
  const data = await exportHistory("json");
  if (!data) return;
  exportDataAsFile(data, filename, "application/json");
}

export function useActivityLog() {
  const historyService = new IpcHistoryServiceAdapter();

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

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation?.id) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation, fetchMessages]);

  const {
    filter,
    setFilter,
    filteredMessages,
  } = useMessageFilter(messages);

  return {
    conversations,
    selectedConversation,
    messages,
    filteredMessages,
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
    formatDate: formatDateTime,
  };
}