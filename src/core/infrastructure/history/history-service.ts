import type { IHistoryService, ExportFormat } from '../../../core/domain/ports/history-service.port';
import type { Conversation } from '../../../client/hooks/use-conversations';
import type { Message } from '../../../client/hooks/use-messages';

export class HistoryService implements IHistoryService {
  async getConversations(): Promise<Conversation[]> {
    return window.historyAPI.getConversations();
  }

  async createConversation(title?: string): Promise<void> {
    return window.historyAPI.createConversation(title);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    return window.historyAPI.deleteConversation(conversationId);
  }

  async renameConversation(conversationId: string, newTitle: string): Promise<void> {
    return window.historyAPI.renameConversation(conversationId, newTitle);
  }

  async exportHistory(format: ExportFormat): Promise<Blob | string | null> {
    return window.historyAPI.exportHistory(format);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return window.historyAPI.getMessages(conversationId);
  }

  async addMessage(conversationId: string, role: "user" | "assistant", content: string): Promise<void> {
    return window.historyAPI.addMessage(conversationId, role, content);
  }
}