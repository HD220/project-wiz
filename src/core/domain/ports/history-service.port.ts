export type ExportFormat = 'json' | 'csv';

export interface ConversationHistoryPort {
  getConversations(): Promise<import('../../../client/hooks/use-conversations').Conversation[]>;
  createConversation(title?: string): Promise<void>;
  deleteConversation(conversationId: string): Promise<void>;
  renameConversation(conversationId: string, newTitle: string): Promise<void>;
}

export interface MessageHistoryPort {
  getMessages(conversationId: string): Promise<import('../../../client/hooks/use-messages').Message[]>;
  addMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<void>;
}

export interface HistoryExportPort {
  exportHistory(format: ExportFormat): Promise<Blob | string | null>;
}