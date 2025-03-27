import { MessagePortMain } from "electron";
import { LlamaMessage, LlamaMessageType } from "./LlamaMessageTypes";

export abstract class LlamaMessageService {
  protected port: MessagePortMain;
  private listeners: Map<
    LlamaMessageType,
    Array<(message: LlamaMessage) => void>
  > = new Map();

  constructor(port: MessagePortMain) {
    this.port = port;
    this.setupPortListeners();
  }

  private setupPortListeners() {
    this.port.on("message", (event) => {
      const message = event.data as LlamaMessage;
      this.handleMessage(message);
    });

    this.port.start();
  }

  private handleMessage(message: LlamaMessage) {
    const typeListeners = this.listeners.get(message.type);
    if (typeListeners) {
      typeListeners.forEach((listener) => listener(message));
    }
  }

  public on<T extends LlamaMessage>(
    type: LlamaMessageType,
    callback: (message: T) => void
  ): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }

    const listener = callback as (message: LlamaMessage) => void;
    this.listeners.get(type)!.push(listener);

    return () => {
      const typeListeners = this.listeners.get(type);
      if (typeListeners) {
        const index = typeListeners.indexOf(listener);
        if (index >= 0) {
          typeListeners.splice(index, 1);
        }
      }
    };
  }

  protected sendMessage(message: LlamaMessage) {
    this.port.postMessage(message);
  }

  public close() {
    this.port.close();
    this.listeners.clear();
  }
}

export class LlamaServiceMessageHandler extends LlamaMessageService {
  public sendProgress(
    operation: "download" | "load" | "inference",
    progress: number
  ) {
    this.sendMessage({
      type: LlamaMessageType.PROGRESS,
      operation,
      progress,
    });
  }

  public sendModelLoaded(modelInfo: { name: string; size: number }) {
    this.sendMessage({
      type: LlamaMessageType.MODEL_LOADED,
      modelInfo,
    });
  }

  public sendCompletionChunk(text: string) {
    this.sendMessage({
      type: LlamaMessageType.COMPLETION_CHUNK,
      text,
    });
  }

  public sendCompletionDone(
    fullText: string,
    stats?: {
      tokensPerSecond: number;
      totalTokens: number;
      promptTokens: number;
      completionTokens: number;
    }
  ) {
    this.sendMessage({
      type: LlamaMessageType.COMPLETION_DONE,
      fullText,
      stats,
    });
  }

  public sendError(error: string, details?: any) {
    this.sendMessage({
      type: LlamaMessageType.ERROR,
      error,
      details,
    });
  }

  public sendInfo(message: string) {
    this.sendMessage({
      type: LlamaMessageType.INFO,
      message,
    });
  }
}

export class LlamaClientMessageHandler extends LlamaMessageService {
  public initLlama(options?: {
    debug?: boolean;
    gpu?: "auto" | "cuda" | "metal" | "vulkan" | "off";
    numThreads?: number;
  }) {
    this.sendMessage({
      type: LlamaMessageType.INIT,
      options,
    });
  }

  public loadModel(
    modelPath: string,
    options?: {
      gpuLayers?: number;
      contextSize?: number;
      batchSize?: number;
      seed?: number;
      ignoreMemorySafetyChecks?: boolean;
    }
  ) {
    this.sendMessage({
      type: LlamaMessageType.LOAD_MODEL,
      modelPath,
      options,
    });
  }

  public createContext() {
    this.sendMessage({
      type: LlamaMessageType.CREATE_CONTEXT,
    });
  }

  public generateCompletion(
    prompt: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      stopSequences?: string[];
      streamResponse?: boolean;
    }
  ) {
    this.sendMessage({
      type: LlamaMessageType.GENERATE_COMPLETION,
      prompt,
      options,
    });
  }

  public generateChatCompletion(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options?: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      stopSequences?: string[];
      streamResponse?: boolean;
    }
  ) {
    this.sendMessage({
      type: LlamaMessageType.GENERATE_CHAT_COMPLETION,
      messages,
      options,
    });
  }

  public createEmbedding(text: string) {
    this.sendMessage({
      type: LlamaMessageType.CREATE_EMBEDDING,
      text,
    });
  }

  public downloadModel(
    modelId: string,
    modelUrl?: string,
    outputPath?: string
  ) {
    this.sendMessage({
      type: LlamaMessageType.DOWNLOAD_MODEL,
      modelId,
      modelUrl,
      outputPath,
    });
  }

  public abort() {
    this.sendMessage({
      type: LlamaMessageType.ABORT,
    });
  }

  public shutdown() {
    this.sendMessage({
      type: LlamaMessageType.SHUTDOWN,
    });
  }
}
