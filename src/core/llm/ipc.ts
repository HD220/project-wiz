import { randomUUID } from "crypto";
import { MessagePort } from "worker_threads";
import {
  HandlerFunction,
  IPCMessage,
  PendingRequest,
  WorkerChannels,
} from "./types/ipc-config";

export class IPCManager {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private handlers: Map<keyof WorkerChannels, HandlerFunction<any, any>> =
    new Map();
  private port: MessagePort;

  constructor(port: MessagePort) {
    this.port = port;
    this.setupMessageHandler();
  }

  private setupMessageHandler() {
    this.port.on("message", (message: IPCMessage) => {
      if (message.channel.startsWith("response")) {
        this.handleResponse(message);
      } else {
        this.handleRequest(message).catch((error) => {
          this.sendResponse(message.channel, {
            id: message.id,
            error: error instanceof Error ? error.message : String(error),
            payload: undefined,
          });
        });
      }
    });
  }

  private async handleRequest(message: IPCMessage) {
    const handler = this.handlers.get(message.channel as keyof WorkerChannels);
    if (!handler) {
      throw new Error(`No handler registered for channel: ${message.channel}`);
    }

    const response = await handler(message.payload as any);
    this.sendResponse(message.channel, {
      id: message.id,
      payload: response,
    });
  }

  private handleResponse(message: IPCMessage) {
    const pendingRequest = this.pendingRequests.get(message.id);
    if (!pendingRequest) return;

    clearTimeout(pendingRequest.timeout);
    this.pendingRequests.delete(message.id);

    if (message.error) {
      pendingRequest.reject(new Error(message.error));
    } else {
      pendingRequest.resolve(message.payload);
    }
  }

  private sendResponse(channel: string, response: Omit<IPCMessage, "channel">) {
    this.port.postMessage({
      ...response,
      channel: `response:${channel}`,
    });
  }

  registerHandler<T extends keyof WorkerChannels, R>(
    channel: T,
    handler: HandlerFunction<T, R>
  ) {
    this.handlers.set(channel, handler);
  }

  send<T extends keyof WorkerChannels>(channel: T, payload: WorkerChannels[T]) {
    const message: IPCMessage = {
      id: randomUUID(),
      channel,
      payload,
    };

    this.port.postMessage(message);
  }

  async requestResponse<T extends keyof WorkerChannels, R = unknown>(
    channel: T,
    payload: WorkerChannels[T]
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      const id = randomUUID();
      const message: IPCMessage<WorkerChannels[T]> = {
        id,
        channel,
        payload,
      };

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`IPC request timeout for channel: ${channel}`));
      }, 30_000);

      this.pendingRequests.set(id, {
        resolve,
        reject,
        timeout,
      });

      this.port.postMessage(message);
    });
  }
}
