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

export type IpcInvokeFunction = (channel: string, ...args: unknown[]) => Promise<unknown>;

/**
 * Returns the default IPC invoke function from the global window object, if available.
 */
function getDefaultIpcInvoke(): IpcInvokeFunction | undefined {
  // @ts-ignore
  return typeof window !== "undefined" && window.electron?.ipcRenderer?.invoke
    // @ts-ignore
    ? window.electron.ipcRenderer.invoke.bind(window.electron.ipcRenderer)
    : undefined;
}

/**
 * Factory to create a Repository Metrics Service Adapter with injectable IPC invoke dependency.
 * Allows testability by injecting a mock invoke function.
 */
export function createIpcRepositoryMetricsServiceAdapter(
  invoke: IpcInvokeFunction | undefined = getDefaultIpcInvoke()
): {
  getMetrics: () => Promise<RepositoryMetric[]>;
} {
  return {
    async getMetrics(): Promise<RepositoryMetric[]> {
      if (!invoke) {
        throw new Error("IPC invoke function is not available.");
      }
      try {
        // The backend should implement this channel and return the metrics array.
        const result = await invoke("repository:getMetrics");
        // Defensive: ensure result is an array of RepositoryMetric
        if (Array.isArray(result)) {
          return result as RepositoryMetric[];
        }
        throw new Error("Invalid response: expected an array of RepositoryMetric.");
      } catch (error) {
        // Log error with context for traceability
        console.error("[ipcRepositoryMetricsServiceAdapter] Failed to fetch repository metrics:", error);
        throw error;
      }
    },
  };
}

// Default instance for production usage
export const ipcRepositoryMetricsServiceAdapter = createIpcRepositoryMetricsServiceAdapter();