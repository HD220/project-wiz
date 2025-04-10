import { contextBridge, ipcRenderer } from "electron";

/**
 * API segura para acessar o serviço de histórico via IPC
 */
contextBridge.exposeInMainWorld("historyAPI", {
  /**
   * Cria uma nova conversa
   */
  createConversation: (title?: string) =>
    ipcRenderer.invoke("history:createConversation", title),

  /**
   * Adiciona uma mensagem a uma conversa
   */
  addMessage: (conversationId: string, role: "user" | "assistant", content: string) =>
    ipcRenderer.invoke("history:addMessage", conversationId, role, content),

  /**
   * Obtém a lista de conversas
   */
  getConversations: (params?: { offset?: number; limit?: number; search?: string }) =>
    ipcRenderer.invoke("history:getConversations", params),

  /**
   * Obtém as mensagens de uma conversa
   */
  getMessages: (conversationId: string) =>
    ipcRenderer.invoke("history:getMessages", conversationId),

  /**
   * Remove uma conversa e suas mensagens
   */
  deleteConversation: (conversationId: string) =>
    ipcRenderer.invoke("history:deleteConversation", conversationId),

  /**
   * Exporta o histórico em JSON ou CSV
   */
  exportHistory: (format: "json" | "csv") =>
    ipcRenderer.invoke("history:exportHistory", format),

  /**
   * Renomeia uma conversa
   */
  renameConversation: (conversationId: string, newTitle: string) =>
    ipcRenderer.invoke("history:renameConversation", conversationId, newTitle),
});

/**
 * API segura para gerenciar o token do GitHub via IPC
 */
contextBridge.exposeInMainWorld("githubTokenAPI", {
  /**
   * Salva o token do GitHub
   */
  saveGitHubToken: (token: string) =>
    ipcRenderer.invoke("githubToken:save", token),

  /**
   * Remove o token do GitHub
   */
  removeGitHubToken: () => ipcRenderer.invoke("githubToken:remove"),

  /**
   * Verifica se há token salvo
   */
  hasGitHubToken: () => ipcRenderer.invoke("githubToken:status"),
});

/**
 * API segura para métricas LLM via IPC
 */
contextBridge.exposeInMainWorld("llmMetricsAPI", {
  /**
   * Obtém métricas do WorkerService
   */
  getMetrics: () => ipcRenderer.invoke("llm:getMetrics"),
});
