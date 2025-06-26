// src_refactored/presentation/ui/services/ipc.service.ts

import { IElectronIPC, IPCResult } from './ipc.types';

const electronIPC = window.electronIPC;

const isElectronEnvironment = (): boolean => {
  return !!electronIPC;
};

/**
 * A wrapper around Electron's IPC communication, providing typed methods
 * for interacting with the main process from the renderer.
 */
class IPCService {
  private api: IElectronIPC | null = null;

  constructor() {
    if (isElectronEnvironment() && electronIPC) {
      this.api = electronIPC;
    } else {
      // Provide a mock API for non-Electron environments or if preload fails
      console.warn(
        '[IPCService] Electron IPC API not found. Using mock implementation. ' +
        'Ensure preload script is correctly configured and loaded if running in Electron.',
      );
      this.api = this.createMockAPI();
    }
  }

  private createMockAPI(): IElectronIPC {
    const mockInvoke = async <T>(channel: string, ...args: any[]): Promise<T> => {
      console.warn(`[MockIPC] Invoke: '${channel}' with args:`, args);
      // Simulate an error or specific responses for known channels during development
      if (channel === 'app:get-version') {
        return '0.0.0-mock' as any;
      }
      // Default mock error response
      throw new Error(`MockIPC: Channel '${channel}' not implemented.`);
    };

    const mockOn = (channel: string, listener: (...args: any[]) => void): (() => void) => {
      console.warn(`[MockIPC] Listener registered for channel: '${channel}'`, listener);
      return () => {
        console.warn(`[MockIPC] Listener removed for channel: '${channel}'`, listener);
      };
    };

    const mockSend = (channel: string, ...args: any[]): void => {
      console.warn(`[MockIPC] Send: '${channel}' with args:`, args);
    };

    return {
      invoke: mockInvoke,
      on: mockOn,
      send: mockSend,
      removeListener: (channel: string, listener) => {
        console.warn(`[MockIPC] removeListener called for '${channel}'`, listener);
      },
      removeAllListeners: (channel: string) => {
        console.warn(`[MockIPC] removeAllListeners called for '${channel}'`);
      },
    };
  }

  /**
   * Invokes an IPC channel in the main process and expects a response.
   * @param channel The channel to invoke.
   * @param args Arguments to send.
   * @returns A promise that resolves with the IPCResult.
   */
  public async invoke<TData = any, TError = any>(
    channel: string,
    ...args: any[]
  ): Promise<IPCResult<TData>> {
    if (!this.api) {
      // Should have been caught by constructor, but as a safeguard
      console.error('[IPCService] API not initialized for invoke.');
      return { success: false, error: { message: 'IPC API not available' } };
    }
    try {
      const result = await this.api.invoke<TData>(channel, ...args);
      // Assuming the main process returns an IPCResult-like structure or just data
      // If it just returns data on success, and throws error on failure:
      return { success: true, data: result };
    } catch (error: any) {
      console.error(`[IPCService] Error invoking channel '${channel}':`, error);
      return {
        success: false,
        error: {
          message: error.message || 'An unknown IPC error occurred',
          name: error.name,
          stack: error.stack,
        },
      };
    }
  }

  /**
   * Subscribes to messages from an IPC channel.
   * @param channel The channel to listen on.
   * @param listener The callback function to execute when a message is received.
   * @returns An unsubscribe function.
   */
  public on(channel: string, listener: (...args: any[]) => void): () => void {
    if (!this.api || !this.api.on) {
      console.error('[IPCService] API not initialized for on.');
      return () => { /* no-op */ };
    }
    return this.api.on(channel, listener);
  }

  /**
   * Sends a one-way message to an IPC channel in the main process.
   * @param channel The channel to send the message to.
   * @param args Arguments to send.
   */
  public send(channel: string, ...args: any[]): void {
    if (!this.api || !this.api.send) {
      console.error('[IPCService] API not initialized for send.');
      return;
    }
    this.api.send(channel, ...args);
  }
}

// Export a singleton instance of the service
export const ipcService = new IPCService();
