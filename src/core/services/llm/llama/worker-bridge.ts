import { MessagePortMain } from "electron";
import { EventEmitter } from "stream";
import { LlamaWorker } from "./worker";

type LlamaWorkerBridgeEvents<T> = {
  [K in keyof T as `${string & K}`]: T[K] extends (...args: any) => any
    ? Parameters<T[K]>
    : never;
};

type Expand<T> = T extends object ? { [K in keyof T]: T[K] } : T;

type MethodToMessage<T> = {
  [K in keyof T]: T[K] extends (prompt: string, options?: any) => any
    ? Expand<{ type: K; prompt: string; options?: any }>
    : T[K] extends (params: infer P) => any
    ? Expand<{ type: K } & P>
    : never;
}[keyof T];

type LlamaWorkerMessages = MethodToMessage<LlamaWorker>;

interface PromptConfigMessages {
  type: "savePrompts" | "loadPrompts";
  modelId: string;
  prompts?: { [key: string]: string };
}

type LlamaWorkerBridgeMessages = LlamaWorkerMessages | PromptConfigMessages;

class LlamaWorkerBridge {
  private port: MessagePortMain;
  private emmiter = new EventEmitter<LlamaWorkerBridgeEvents<LlamaWorker>>();
  private worker!: LlamaWorker;
  private llama: any;

  constructor(port: MessagePortMain) {
    this.port = port;
    this.port.start();
  }

  async initialize() {
    const { Llama } = require("node-llama-cpp");
    this.llama = new Llama({});
    this.worker = await LlamaWorker.create(this.llama);

    this.port.on("message", async (message) => {
      const data = message.data as LlamaWorkerBridgeMessages;

      switch (data.type) {
        case "loadModel": {
          if (isLlamaWorkerMessage(data)) {
            const { type, ...params } = data;
            await this.worker.loadModel(params);
          }
          break;
        }
        case "createContext": {
          if (isLlamaWorkerMessage(data)) {
            const { type, ...params } = data;
            await this.worker.createContext(params);
          }
          break;
        }
        case "initializeSession": {
          if (isLlamaWorkerMessage(data)) {
            const { type, ...params } = data;
            await this.worker.initializeSession(params);
          }
          break;
        }
        case "prompt": {
          if (isLlamaWorkerMessage(data)) {
            const { type, prompt, options } = data;
            const response = await this.worker.prompt(prompt, options);
            this.port.postMessage({ type: "response", response });
          }
          break;
        }
        case "downloadModel": {
          if (isLlamaWorkerMessage(data)) {
            const { type, ...params } = data;
            const response = await this.worker.downloadModel(params);
            this.port.postMessage({ type: "response", response });
          }
          break;
        }
        case "unloadModel": {
          if (isLlamaWorkerMessage(data)) {
            const { type } = data;
            await this.worker.unloadModel();
          }
          break;
        }
        case "savePrompts": {
          if (isPromptConfigMessage(data) && data.prompts) {
            const { modelId, prompts } = data;
            await this.worker.savePrompts(prompts);
          }
          break;
        }
        case "loadPrompts": {
          if (isPromptConfigMessage(data)) {
            const { modelId } = data;
            const prompts = await this.worker.loadPrompts();
            this.port.postMessage({ type: "response", prompts });
          }
          break;
        }
        default:
          break;
      }
    });
  }
}

function isLlamaWorkerMessage(
  data: LlamaWorkerBridgeMessages
): data is LlamaWorkerMessages {
  return (
    (data as PromptConfigMessages).type !== "savePrompts" &&
    (data as PromptConfigMessages).type !== "loadPrompts"
  );
}

function isPromptConfigMessage(
  data: LlamaWorkerBridgeMessages
): data is PromptConfigMessages {
  return (
    (data as PromptConfigMessages).type === "savePrompts" ||
    (data as PromptConfigMessages).type === "loadPrompts"
  );
}

let bridge: LlamaWorkerBridge | null = null;

process.parentPort.on("message", async (event) => {
  if (event.data.type === "port") {
    const port = event.data.port as MessagePortMain;
    bridge = new LlamaWorkerBridge(port);
    await bridge.initialize();
  }
});
