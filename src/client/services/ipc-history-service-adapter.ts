export class IpcHistoryServiceAdapter {
  async getAllConversations(params?: { offset?: number; limit?: number; search?: string }) {
    return window.electron.ipcRenderer.invoke("history:getConversations", params);
  }

  async getMessages(conversationId: string) {
    return window.electron.ipcRenderer.invoke("history:getMessages", conversationId);
  }

  async createConversation(title?: string) {
    return window.electron.ipcRenderer.invoke("history:createConversation", title);
  }

  async addMessage(conversationId: string, role: "user" | "assistant", content: string) {
    return window.electron.ipcRenderer.invoke("history:addMessage", conversationId, role, content);
  }

  async deleteConversation(conversationId: string) {
    return window.electron.ipcRenderer.invoke("history:deleteConversation", conversationId);
  }

  async renameConversation(conversationId: string, newTitle: string) {
    return window.electron.ipcRenderer.invoke("history:renameConversation", conversationId, newTitle);
  }

  async exportHistory(format: "json" | "csv") {
    return window.electron.ipcRenderer.invoke("history:exportHistory", format);
  }
}