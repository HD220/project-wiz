import { ipcMain, IpcMainInvokeEvent, BrowserWindow } from "electron";
import { JsonLogger } from "../services/logger/json-logger.service";
import { Result } from "../../shared/result";
import { v4 as uuidv4 } from "uuid";

interface IpcMessage<T = any> {
  type: string;
  payload?: T;
  meta?: {
    timestamp: number;
    correlationId?: string;
    source?: string;
  };
}

type IpcHandler<T = any, R = any> = (
  event: IpcMainInvokeEvent,
  payload: T
) => Promise<Result<R>>;

interface IpcHandlerOptions {
  timeout?: number;
  retryPolicy?: {
    maxRetries: number;
    delay: number;
  };
}

export class IpcManager {
  private readonly logger: JsonLogger;
  private readonly handlers: Map<string, IpcHandler> = new Map();
  private readonly windows: BrowserWindow[];

  constructor(windows: BrowserWindow[] = [], logger?: JsonLogger) {
    this.windows = windows;
    this.logger = logger || new JsonLogger("ipc-manager");
  }

  registerHandler<T, R>(
    channel: string,
    handler: IpcHandler<T, R>,
    options?: IpcHandlerOptions
  ): void {
    if (this.handlers.has(channel)) {
      throw new Error(`Handler already registered for channel: ${channel}`);
    }

    const wrappedHandler = this.createWrappedHandler(handler, channel, options);
    this.handlers.set(channel, wrappedHandler);

    ipcMain.handle(channel, wrappedHandler);
    this.logger.info(`Registered IPC handler for channel: ${channel}`);
  }

  private createWrappedHandler<T, R>(
    handler: IpcHandler<T, R>,
    channel: string,
    options?: IpcHandlerOptions
  ): IpcHandler<T, R> {
    return async (event: IpcMainInvokeEvent, payload: T) => {
      const correlationId = uuidv4();
      const startTime = Date.now();

      try {
        this.logger.info(`IPC request started`, {
          channel,
          correlationId,
          payload,
        });

        const handlerResult = await this.executeWithRetry(
          () => handler(event, payload),
          options?.retryPolicy
        );

        // Padroniza o retorno para sempre usar { data }
        const result = handlerResult.success
          ? { ...handlerResult, data: { data: handlerResult.data } }
          : handlerResult;

        this.logger.info(`IPC request completed`, {
          channel,
          correlationId,
          duration: Date.now() - startTime,
          success: result.success,
          data: result.success ? result.data : undefined,
          error: !result.success ? result.error : undefined,
        });

        return result;
      } catch (error) {
        this.logger.error(`IPC request failed`, {
          channel,
          correlationId,
          error,
          duration: Date.now() - startTime,
        });
        throw error;
      }
    };
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retryPolicy?: { maxRetries: number; delay: number }
  ): Promise<T> {
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= (retryPolicy?.maxRetries || 0)) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        attempt++;
        if (attempt <= (retryPolicy?.maxRetries || 0)) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryPolicy?.delay || 1000)
          );
        }
      }
    }

    throw lastError;
  }

  emitEvent<T>(channel: string, payload?: T): void {
    const message: IpcMessage<T> = {
      type: channel,
      payload,
      meta: {
        timestamp: Date.now(),
        correlationId: uuidv4(),
      },
    };

    this.windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, message);
      }
    });

    this.logger.info(`Event emitted`, {
      channel,
      correlationId: message.meta!.correlationId,
      payload,
    });
  }
}
