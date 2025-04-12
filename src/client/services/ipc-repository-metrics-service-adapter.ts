/* 
 * IPC Repository Metrics Service Adapter
 * Provides a method to fetch repository metrics via IPC.
 * NOTE: The backend (main process) must implement the "repository:getMetrics" channel.
 */

export interface RepositoryMetric {
  label: string;
  value: number;
  progress: number;
  icon: string;
}

export const ipcRepositoryMetricsServiceAdapter = {
  async getMetrics(): Promise<RepositoryMetric[]> {
    // The backend should implement this channel and return the metrics array.
    // For now, returns an empty array if the channel is not implemented.
    try {
      if (window?.electron?.ipcRenderer?.invoke) {
        return await window.electron.ipcRenderer.invoke("repository:getMetrics");
      }
      return [];
    } catch (error) {
      // Optionally log error
      return [];
    }
  },
};