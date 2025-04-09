declare global {
  interface HistoryAPI {
    createConversation(title?: string): Promise<any>;
    addMessage(conversationId: string, role: "user" | "assistant", content: string): Promise<any>;
    getConversations(params?: { offset?: number; limit?: number; search?: string }): Promise<any[]>;
    getMessages(conversationId: string): Promise<any[]>;
    deleteConversation(conversationId: string): Promise<void>;
    exportHistory(format: "json" | "csv"): Promise<Blob | string>;
    renameConversation(conversationId: string, newTitle: string): Promise<void>;
  }

  interface Window {
    api: false;
    historyAPI: HistoryAPI;
  }
}

export {};
