import type { Conversation } from '../../../client/hooks/use-conversations';
import type { Message } from '../../../client/hooks/use-messages';

export type ExportFormat = "json" | "csv";

export interface IHistoryService {
  getConversations(): Promise<Conversation[]>;
  createConversation(title?: string): Promise<void>;
  deleteConversation(conversationId: string): Promise<void>;
  renameConversation(conversationId: string, newTitle: string): Promise<void>;
  exportHistory(format: ExportFormat): Promise<Blob | string | null>;
  getMessages(conversationId: string): Promise<Message[]>;
  addMessage(conversationId: string, role: "user" | "assistant", content: string): Promise<void>;
}