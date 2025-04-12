/* 
 * IPC Available Models Service Adapter
 * Provides a method to fetch available models via IPC.
 * NOTE: The backend (main process) must implement the "models:getAvailable" channel.
 */

export interface AvailableModel {
  id: number;
  name: string;
  modelId: string;
  size: string;
  status: string;
  lastUsed: string | null;
  description: string;
}

export const ipcAvailableModelsServiceAdapter = {
  async getAvailableModels(): Promise<AvailableModel[]> {
    try {
      if (window?.electron?.ipcRenderer?.invoke) {
        return await window.electron.ipcRenderer.invoke("models:getAvailable");
      }
      return [];
    } catch (error) {
      // Optionally log error
      return [];
    }
  },
};