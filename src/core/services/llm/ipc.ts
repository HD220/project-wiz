import { MessagePortMain } from "electron";
import { EventEmitter } from "stream";

interface IPCMessage {
  type: string;
  payload?: any;
  requestId?: string;
}

export class IPCManager {
  private listeners = new EventEmitter();
  private port: MessagePortMain;
  private pendingRequests = new Map<string, (value: any) => void>();

  constructor(port: MessagePortMain) {
    this.port = port;
    this.port.start();
    this.port.on("message", ({ data }) => this._onMessage(data));
    this.port.on("close", () => this._onClose());
    this.listeners.setMaxListeners(100);
  }

  public requestResponse = <T = any, R = any>(
    type: string,
    payload: T
  ): Promise<R> => {
    return new Promise((resolve) => {
      const requestId = Math.random().toString(36).substring(2, 9);
      this.pendingRequests.set(requestId, resolve);
      this.port.postMessage({ type, payload, requestId });
    });
  };

  private _onMessage(message: IPCMessage) {
    if (!message?.type) throw new Error("type property not defined on message");

    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      this.respond(message.requestId, message.payload);
      return;
    }

    this.listeners.emit(message.type, message.payload);
  }

  private respond(requestId: string, response: any) {
    const resolver = this.pendingRequests.get(requestId);
    if (resolver) resolver(response);
    this.pendingRequests.delete(requestId);
  }

  private _onClose() {
    this._onMessage({ type: "close" });
    this.port.close();
    this.removeAllListeners();
  }

  public removeAllListeners() {
    this.listeners.removeAllListeners();
  }
}
