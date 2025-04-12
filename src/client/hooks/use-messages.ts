import { useState, useCallback } from "react";
import { IpcHistoryServiceAdapter } from "../services/ipc-history-service-adapter";
import { Message } from "../types/history";
import { IHistoryService } from "../types/history-service";
import { useAsyncAction } from "./use-async-action";

/**
 * Hook to manage messages of a conversation.
 * Allows optional injection of a history service for testability.
 */
export function useMessages(historyService?: IHistoryService) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [execute, loading, error, setError] = useAsyncAction();

  // Use injected service or default to IPC adapter
  const service = historyService ?? new IpcHistoryServiceAdapter();

  const fetchMessages = useCallback(
    execute(async (conversationId: string) => {
      if (!conversationId || typeof conversationId !== "string") {
        throw new Error("Invalid conversation ID");
      }
      try {
        const data = await service.getMessages(conversationId);
        if (!Array.isArray(data)) throw new Error("Invalid messages data");
        setMessages(data as Message[]);
      } catch (err: any) {
        setError(err.message || "Failed to fetch messages");
      }
    }),
    [service]
  );

  const addMessage = useCallback(
    execute(async (conversationId: string, role: "user" | "assistant", content: string) => {
      if (!conversationId || typeof conversationId !== "string") {
        throw new Error("Invalid conversation ID");
      }
      if (role !== "user" && role !== "assistant") {
        throw new Error("Invalid role");
      }
      if (!content || typeof content !== "string") {
        throw new Error("Invalid content");
      }
      try {
        await service.addMessage(conversationId, role, content);
        await fetchMessages(conversationId);
      } catch (err: any) {
        setError(err.message || "Failed to add message");
      }
    }),
    [service, fetchMessages]
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