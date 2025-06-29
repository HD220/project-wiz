// src_refactored/presentation/ui/services/ipc.service.ts

import { IPCChannel } from '@/shared/ipc-channels';
import {
  ChatSendMessagePayload,
  ChatStreamEventPayload,
  ChatStreamTokenPayload,
  ChatStreamEndPayload,
} from '@/shared/ipc-chat.types';
import { ProjectListItem } from '@/shared/ipc-project.types'; // Assuming this file and type exist

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
      console.warn(
        '[IPCService] Electron IPC API not found. Using mock implementation. ' +
        'Ensure preload script is correctly configured and loaded if running in Electron.',
      );
      this.api = this.createMockAPI();
    }
  }

  private createMockAPI(): IElectronIPC {
    const mockInvoke = async <T>(channel: string, ...args: unknown[]): Promise<T> => {
      console.warn(`[MockIPC] Invoke: '${channel}' with args:`, args);
      if (channel === IPCChannel.CHAT_SEND_MESSAGE) {
        // Simulate sending message, no specific data needed for void promise
        return undefined as unknown as T; // Use unknown
      }
      // For other channels, you might want to return specific mock data based on the channel
      // For example: if (channel === 'app:get-version') return { version: 'mock-0.1.0' } as unknown as T;
      throw new Error(`MockIPC: Channel '${channel}' not implemented for invoke.`);
    };

    const mockOn = (channel: string, listener: (...args: unknown[]) => void): (() => void) => {
      console.warn(`[MockIPC] Listener registered for channel: '${channel}'`, listener);
      if (channel === IPCChannel.CHAT_STREAM_EVENT) {
        // Simulate some stream events for chat for testing purposes
        setTimeout(() => listener({ type: 'token', data: 'Hello' } as ChatStreamTokenPayload), 100);
        setTimeout(() => listener({ type: 'token', data: ' world' } as ChatStreamTokenPayload), 200);
        setTimeout(() => listener({ type: 'end' } as ChatStreamEndPayload), 300);
      }
      // Add more mock event emissions here if needed for other channels during development without Electron
      return () => {
        console.warn(`[MockIPC] Listener removed for channel: '${channel}'`, listener);
      };
    };

    const mockSend = (channel: string, ...args: unknown[]): void => {
      console.warn(`[MockIPC] Send: '${channel}' with args:`, args);
    };

    return {
      invoke: mockInvoke,
      on: mockOn,
      send: mockSend,
      removeListener: (channel: string, listener: (...args: unknown[]) => void) => { // listener args to unknown[]
        console.warn(`[MockIPC] removeListener called for '${channel}'`, listener);
      },
      removeAllListeners: (channel: string) => {
        console.warn(`[MockIPC] removeAllListeners called for '${channel}'`);
      },
    };
  }

  public async invoke<TData = unknown>( // Default TData to unknown
    channel: string,
    ...args: unknown[] // Args to unknown[]
  ): Promise<IPCResult<TData>> {
    if (!this.api) {
      return { success: false, error: { message: 'IPC API not available' } };
    }
    try {
      // Assuming this.api.invoke is correctly typed or we trust its behavior
      const result = await this.api.invoke<TData>(channel, ...args);
      return { success: true, data: result };
    } catch (error: unknown) { // Catch error as unknown
      console.error(`[IPCService] Error invoking channel '${channel}':`, error);
      const typedError = error as Error; // Type assertion
      return {
        success: false,
        error: {
          message: typedError.message || 'An unknown IPC error occurred',
          name: typedError.name,
          stack: typedError.stack,
        },
      };
    }
  }

  public on(channel: string, listener: (...args: unknown[]) => void): () => void { // listener args to unknown[]
    if (!this.api || !this.api.on) {
      console.error('[IPCService] API not initialized for on.');
      return () => { /* no-op */ };
    }
    // The type of listener in IElectronIPC is `(...args: any[]) => void`.
    // Casting our more specific `(...args: unknown[]) => void` to `any` here is acceptable
    // as `unknown[]` can be spread into `any[]`.
    // Ideally, IElectronIPC would also use `unknown[]`.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.api.on(channel, listener as (...args: any[]) => void);
  }

  public send(channel: string, ...args: unknown[]): void { // Args to unknown[]
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
    // const wrappedListener = (_event: unknown, payload: ChatStreamEventPayload) => { // REMOVED - Unused
    //   // This assumes the main process sends the payload as the first argument after the event.
    //   // If the main process sends multiple arguments, this would need to be adjusted.
    //   // For chat stream, it's typical to send a single payload object.
    //   listener(payload);
    // };

    // If the `this.api.on` is already designed to pass only the payload, then `listener` can be passed directly.
    // Given the generic nature of `this.api.on`, a wrapper is safer until preload is defined.
    // However, if `window.electronIPC.on` is defined as `(channel, listener) => ipcRenderer.on(channel, (event, data) => listener(data))`,
    // then our `listener` here would correctly receive just `data`.
    // Let's assume the preload script will be written to simplify this for the renderer,
    // meaning it calls the listener with only the data payload.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
