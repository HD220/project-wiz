export type SessionStatus = "running" | "paused" | "cancelled";

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
 * Factory to create a Session Service Adapter with injectable IPC invoke dependency.
 * Allows testability by injecting a mock invoke function.
 */
export function createIpcSessionServiceAdapter(
  invoke: IpcInvokeFunction | undefined = getDefaultIpcInvoke()
): {
  pauseSession: () => Promise<void>;
  cancelSession: () => Promise<void>;
  saveSession: () => Promise<void>;
  restoreSession: () => Promise<void>;
  getSessionStatus: () => Promise<SessionStatus>;
} {
  function ensureInvokeAvailable() {
    if (!invoke) {
      throw new Error("IPC invoke function is not available.");
    }
  }

  function contextualizeError(operation: string, error: unknown): Error {
    const originalMessage =
      error instanceof Error ? error.message : String(error);
    return new Error(
      `[IpcSessionServiceAdapter] Error in "${operation}": ${originalMessage}`
    );
  }

  return {
    async pauseSession(): Promise<void> {
      ensureInvokeAvailable();
      try {
        await invoke!("session:pause");
      } catch (error) {
        throw contextualizeError("pauseSession", error);
      }
    },
    async cancelSession(): Promise<void> {
      ensureInvokeAvailable();
      try {
        await invoke!("session:cancel");
      } catch (error) {
        throw contextualizeError("cancelSession", error);
      }
    },
    async saveSession(): Promise<void> {
      ensureInvokeAvailable();
      try {
        await invoke!("session:save");
      } catch (error) {
        throw contextualizeError("saveSession", error);
      }
    },
    async restoreSession(): Promise<void> {
      ensureInvokeAvailable();
      try {
        await invoke!("session:restore");
      } catch (error) {
        throw contextualizeError("restoreSession", error);
      }
    },
    async getSessionStatus(): Promise<SessionStatus> {
      ensureInvokeAvailable();
      try {
        const result = await invoke!("session:getStatus");
        if (
          result === "running" ||
          result === "paused" ||
          result === "cancelled"
        ) {
          return result;
        }
        throw new Error("Invalid response: expected a valid SessionStatus.");
      } catch (error) {
        throw contextualizeError("getSessionStatus", error);
      }
    },
  };
}

/**
 * Default instance for production usage.
 */
export const ipcSessionServiceAdapter = createIpcSessionServiceAdapter();