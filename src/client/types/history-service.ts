import { Conversation, Message, ExportFormat } from "./history";

/**
 * Interface for the history service, to manage conversations and messages.
 */
export interface IHistoryService {
  getAllConversations(): Promise<Conversation[]>;
  createConversation(title?: string): Promise<Conversation>;
  deleteConversation(conversationId: string): Promise<void>;
  renameConversation(conversationId: string, newTitle: string): Promise<void>;
  getMessages(conversationId: string): Promise<Message[]>;
  addMessage(conversationId: string, role: "user" | "assistant", content: string): Promise<Message>;
  exportHistory(format: ExportFormat): Promise<Blob | string | null>;
}