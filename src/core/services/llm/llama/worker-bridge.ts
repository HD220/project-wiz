import { MessageChannelMain, MessagePortMain } from "electron";
import { EventEmitter } from "stream";
import type { LlamaWorker } from "./worker.js";

type LlamaWorkerBridgeEvents<T> = {
  [K in keyof T as `${string & K}`]: T[K] extends (...args: any) => any
    ? Parameters<T[K]>
    : never;
};

type Expand<T> = T extends object ? { [K in keyof T]: T[K] } : T;

type MethodToMessage<T> = {
  [K in keyof T]: T[K] extends (params: infer P) => any
    ? Expand<{ type: K } & P>
    : never;
}[keyof T];

type LlamaWorkerBridgeMessages = MethodToMessage<LlamaWorker>;

class IPCEventBridge<
  T extends Record<keyof T, any[]> | [never]
> extends EventEmitter<T> {
  private port: MessagePortMain;

  constructor(port: MessagePortMain) {
    super();
    this.port = port;
    this.port.start();
  }
}

const channel = new MessageChannelMain();
const a = new IPCEventBridge<LlamaWorkerBridgeEvents<LlamaWorker>>(
  channel.port1
);

a.emit("", {});

class LlamaWorkerBridge {
  private port: MessagePortMain;
  private emmiter = new EventEmitter<LlamaWorkerBridgeEvents<LlamaWorker>>();

  constructor(port: MessagePortMain) {
    this.port = port;
    this.port.start();

    this.port.on("message", (message) => {
      const data = message.data as LlamaWorkerBridgeMessages;

      switch (data.type) {
        case "loadModel": {
          const { type, ...params } = data;
          break;
        }
        case "createContext": {
          const { type, ...params } = data;
          break;
        }
        case "initializeSession": {
          const { type, ...params } = data;
        }
        default:
          break;
      }
    });
  }
}
