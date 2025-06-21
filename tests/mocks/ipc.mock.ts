import { Result, OK, NOK } from "../../src/shared/result";
import { JsonLogger } from "../../src/infrastructure/services/logger/json-logger.service";
import { deepSerialize, deepDeserialize } from "../../src/shared/serializer";

type IpcHandler<T = any> = (
  channel: string,
  ...args: any[]
) => Promise<Result<T>>;
type EventHandler = (event: any, ...args: any[]) => void;

interface MockIpcRendererOptions {
  defaultDelay?: number;
  failPattern?: {
    channel: RegExp;
    failCount?: number;
    error?: Error;
  };
  retryPolicy?: {
    maxRetries?: number;
    baseDelay?: number;
    retryableErrors?: Array<RegExp | string>;
  };
}

export class MockIpcRenderer {
  private handlers = new Map<string, IpcHandler>();
  private eventListeners = new Map<string, Set<EventHandler>>();
  private callHistory: Array<{
    channel: string;
    args: any[];
    timestamp: number;
  }> = [];
  private failCounters = new Map<string, number>();
  private logger: JsonLogger;

  constructor(
    private options: MockIpcRendererOptions = {},
    logger?: JsonLogger
  ) {
    this.logger = logger || new JsonLogger("mock-ipc");
  }

  async invoke(channel: string, ...args: any[]): Promise<any> {
    const callTimestamp = Date.now();
    this.callHistory.push({ channel, args, timestamp: callTimestamp });
    this.logger.debug(`IPC invoke: ${channel}`, { args });

    try {
      // Handle serialization/deserialization
      const deserializedArgs = args.map((arg) => deepDeserialize(arg));

      // Check if should fail
      if (this.options.failPattern?.channel.test(channel)) {
        const failCount = this.failCounters.get(channel) || 0;
        if (failCount < (this.options.failPattern.failCount || 1)) {
          this.failCounters.set(channel, failCount + 1);
          throw (
            this.options.failPattern.error ||
            new Error(`Simulated failure for ${channel}`)
          );
        }
      }

      if (!this.handlers.has(channel)) {
        throw new Error(`No handler registered for channel: ${channel}`);
      }

      const handler = this.handlers.get(channel)!;
      const result = await handler(channel, ...deserializedArgs);
      return deepSerialize(result);
    } catch (error) {
      this.logger.error(`IPC handler error: ${channel}`, { error });
      throw error;
    }
  }

  on(channel: string, listener: EventHandler): void {
    if (!this.eventListeners.has(channel)) {
      this.eventListeners.set(channel, new Set());
    }
    this.eventListeners.get(channel)!.add(listener);
  }

  removeListener(channel: string, listener: EventHandler): void {
    this.eventListeners.get(channel)?.delete(listener);
  }

  // Mock configuration methods
  registerHandler<T>(channel: string, handler: IpcHandler<T>): void {
    this.handlers.set(channel, handler);
  }

  registerSuccessHandler<T>(channel: string, data: T): void {
    this.registerHandler(channel, async () => OK(data));
  }

  registerErrorHandler(channel: string, error: Error | string): void {
    const err = typeof error === "string" ? new Error(error) : error;
    this.registerHandler(channel, async () => NOK(err));
  }

  registerRetryableErrorHandler(
    channel: string,
    error: Error | string,
    failCount = 1
  ): void {
    const err = typeof error === "string" ? new Error(error) : error;
    let attempts = 0;

    this.registerHandler(channel, async () => {
      if (attempts < failCount) {
        attempts++;
        return NOK(err);
      }
      return OK({ success: true });
    });
  }

  emitEvent(channel: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(channel);
    if (listeners) {
      const serializedArgs = args.map((arg) => deepSerialize(arg));
      listeners.forEach((listener) => listener({} as any, ...serializedArgs));
    }
  }

  clear(): void {
    this.handlers.clear();
    this.eventListeners.clear();
    this.callHistory = [];
    this.failCounters.clear();
  }

  getCallCount(channel?: string): number {
    return channel
      ? this.callHistory.filter((call) => call.channel === channel).length
      : this.callHistory.length;
  }

  getLastCall(channel?: string): { channel: string; args: any[] } | undefined {
    const calls = channel
      ? this.callHistory.filter((call) => call.channel === channel)
      : this.callHistory;

    return calls.length > 0 ? calls[calls.length - 1] : undefined;
  }
}

export function createMockIpcRenderer(
  options?: MockIpcRendererOptions,
  logger?: JsonLogger
): MockIpcRenderer {
  return new MockIpcRenderer(options, logger);
}
