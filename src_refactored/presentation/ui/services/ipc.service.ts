// src_refactored/presentation/ui/services/ipc.service.ts

import { IElectronIPC, IPCResult } from './ipc.types';
import { IPCChannel } from '@/shared/ipc-channels';
import {
  ChatSendMessagePayload,
  ChatStreamEventPayload,
  ChatStreamTokenPayload,
  ChatStreamEndPayload,
} from '@/shared/ipc-chat.types';
import { ProjectListItem } from '@/shared/ipc-project.types'; // Assuming this file and type exist

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
      if (channel === IPCChannel.CHAT_SEND_MESSAGE) {
        // Simulate sending message, no specific data needed for void promise
        return undefined as any;
      }
      throw new Error(`MockIPC: Channel '${channel}' not implemented.`);
    };

    const mockOn = (channel: string, listener: (...args: any[]) => void): (() => void) => {
      console.warn(`[MockIPC] Listener registered for channel: '${channel}'`, listener);
      if (channel === IPCChannel.CHAT_STREAM_EVENT) {
        // Simulate some stream events for chat for testing purposes
        setTimeout(() => listener({ type: 'token', data: 'Hello' } as ChatStreamTokenPayload), 100);
        setTimeout(() => listener({ type: 'token', data: ' world' } as ChatStreamTokenPayload), 200);
        setTimeout(() => listener({ type: 'end' } as ChatStreamEndPayload), 300);
      }
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

  public async invoke<TData = any>(
    channel: string,
    ...args: any[]
  ): Promise<IPCResult<TData>> {
    if (!this.api) {
      return { success: false, error: { message: 'IPC API not available' } };
    }
    try {
      const result = await this.api.invoke<TData>(channel, ...args);
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

  public on(channel: string, listener: (...args: any[]) => void): () => void {
    if (!this.api || !this.api.on) {
      console.error('[IPCService] API not initialized for on.');
      return () => { /* no-op */ };
    }
    // Assuming the listener passed to preload's `on` will handle the (event, ...data) signature
    // and call our listener with just the data. If not, this wrapper is needed:
    // const wrappedListener = (event: any, ...data: any[]) => listener(...data);
    // For now, assume direct pass-through or that preload handles it.
    return this.api.on(channel, listener);
  }

  public send(channel: string, ...args: any[]): void {
    if (!this.api || !this.api.send) {
      console.error('[IPCService] API not initialized for send.');
      return;
    }
    this.api.send(channel, ...args);
  }

  // --- Chat Specific Methods ---

  /**
   * Sends a chat message to the main process.
   * @param payload The chat message payload.
   * @returns A promise that resolves with an IPCResult (void on success, or error).
   *          The main process might return a job ID or some other acknowledgement.
   *          For now, typed as Promise<IPCResult<void>> assuming no specific data on success.
   */
  public async sendChatMessage(payload: ChatSendMessagePayload): Promise<IPCResult<void>> {
    return this.invoke<void>(IPCChannel.CHAT_SEND_MESSAGE, payload);
  }

  /**
   * Subscribes to chat stream events from the main process.
   * @param listener The callback function to execute when a chat stream event is received.
   *                 The listener will be called with the ChatStreamEventPayload.
   * @returns An unsubscribe function.
   */
  public onChatStreamEvent(listener: (payload: ChatStreamEventPayload) => void): () => void {
    // The generic 'on' method's listener signature is (...args: any[]) => void.
    // The actual data passed by Electron's ipcRenderer.on is (event, ...argsFromMain).
    // The IElectronIPC interface's 'on' method is expected to be implemented in preload
    // such that it calls the provided listener with only the relevant data payload(s),
    // not the 'event' object, or that it expects a listener that can handle the event object.
    //
    // If preload does: contextBridge.exposeInMainWorld('electronIPC', { on: (ch, cb) => ipcRenderer.on(ch, (evt, data) => cb(data)) } )
    // then our listener here will receive `data` as the first arg.
    //
    // If preload does: contextBridge.exposeInMainWorld('electronIPC', { on: (ch, cb) => ipcRenderer.on(ch, cb) } )
    // then our listener here will receive `(event, data)`.
    //
    // The current IElectronIPC.on is typed as: (channel: string, listener: (...args: any[]) => void).
    // To be safe and ensure our typed listener gets the correct payload, we wrap it.
    const wrappedListener = (_event: any, payload: ChatStreamEventPayload) => {
      // This assumes the main process sends the payload as the first argument after the event.
      // If the main process sends multiple arguments, this would need to be adjusted.
      // For chat stream, it's typical to send a single payload object.
      listener(payload);
    };

    // If the `this.api.on` is already designed to pass only the payload, then `listener` can be passed directly.
    // Given the generic nature of `this.api.on`, a wrapper is safer until preload is defined.
    // However, if `window.electronIPC.on` is defined as `(channel, listener) => ipcRenderer.on(channel, (event, data) => listener(data))`,
    // then our `listener` here would correctly receive just `data`.
    // Let's assume the preload script will be written to simplify this for the renderer,
    // meaning it calls the listener with only the data payload.
    return this.on(IPCChannel.CHAT_STREAM_EVENT, listener as (...args: any[]) => void);
  }
  // --- Project Specific Methods ---

  /**
   * Fetches the list of projects from the main process.
   * @returns A promise that resolves with an IPCResult containing ProjectListItem[] or an error.
   */
  public async listProjects(): Promise<IPCResult<ProjectListItem[]>> {
    return this.invoke<ProjectListItem[]>(IPCChannel.PROJECT_LIST_QUERY);
  }
}

export const ipcService = new IPCService();
