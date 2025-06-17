// src/infrastructure/frameworks/electron/electron-ipc.adapter.ts
import { ipcMain, ipcRenderer, IpcMain, IpcRenderer } from "electron";
import type {
  IpcHandler,
  IpcInvoker,
  IpcService,
} from "@/core/application/ports/ipc.interface";
import type { Result } from "@/shared/result";
import { ok, error } from "@/shared/result";

/**
 * Adaptador de IPC para o Electron (processo main)
 */
export class ElectronIpcHandler implements IpcHandler {
  constructor(private readonly ipc: IpcMain = ipcMain) {}

  handle<T = unknown, R = unknown>(
    channel: string,
    handler: (data: T) => Promise<Result<R>>
  ): void {
    this.ipc.handle(channel, async (_, data: T) => {
      try {
        const result = await handler(data);
        if (result.isOk()) {
          return { ok: true, value: result.value };
        } else {
          return { ok: false, message: result.message };
        }
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : String(err),
        };
      }
    });
  }

  removeAllHandlers(channel: string): void {
    this.ipc.removeAllListeners(channel);
  }
}

/**
 * Adaptador de IPC para o Electron (processo renderer)
 */
export class ElectronIpcInvoker implements IpcInvoker {
  constructor(private readonly ipc: IpcRenderer = ipcRenderer) {}

  async invoke<T = unknown, R = unknown>(
    channel: string,
    data?: T
  ): Promise<Result<R>> {
    try {
      const response = await this.ipc.invoke(channel, data);
      if (response?.ok) {
        return ok(response.value);
      } else {
        return error(response?.message || "Unknown error");
      }
    } catch (err) {
      return error(err instanceof Error ? err.message : String(err));
    }
  }

  send<T = unknown>(channel: string, data?: T): void {
    this.ipc.send(channel, data);
  }

  on<T = unknown>(
    channel: string,
    listener: (data: T) => Promise<void>
  ): () => void {
    const ipcListener = async (_: unknown, data: T) => {
      await listener(data);
    };
    this.ipc.on(channel, ipcListener);
    return () => this.ipc.removeListener(channel, ipcListener);
  }
}

/**
 * Adaptador completo para comunicação IPC com Electron
 */
export class ElectronIpcService implements IpcService {
  readonly handler: IpcHandler;
  readonly invoker: IpcInvoker;

  constructor() {
    this.handler = new ElectronIpcHandler();
    this.invoker = new ElectronIpcInvoker();
  }

  handle<T = unknown, R = unknown>(
    channel: string,
    handler: (data: T) => Promise<Result<R>>
  ): void {
    this.handler.handle(channel, handler);
  }

  removeAllHandlers(channel: string): void {
    this.handler.removeAllHandlers(channel);
  }

  async invoke<T = unknown, R = unknown>(
    channel: string,
    data?: T
  ): Promise<Result<R>> {
    return this.invoker.invoke(channel, data);
  }

  send<T = unknown>(channel: string, data?: T): void {
    this.invoker.send(channel, data);
  }

  on<T = unknown>(
    channel: string,
    listener: (data: T) => Promise<void>
  ): () => void {
    return this.invoker.on(channel, listener);
  }
}
