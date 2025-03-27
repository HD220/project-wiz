export enum LlamaMessageType {
  INIT = "llama:init",
  LOAD_MODEL = "llama:load-model",
  DOWNLOAD_MODEL = "llama:download-model",
  CREATE_CONTEXT = "llama:create-context",
  GENERATE_COMPLETION = "llama:generate-completion",
  GENERATE_CHAT_COMPLETION = "llama:generate-chat-completion",
  CREATE_EMBEDDING = "llama:create-embedding",
  ABORT = "llama:abort",
  SHUTDOWN = "llama:shutdown",

  MODEL_LOADED = "llama:model-loaded",
  PROGRESS = "llama:progress",
  COMPLETION_CHUNK = "llama:completion-chunk",
  COMPLETION_DONE = "llama:completion-done",
  ERROR = "llama:error",
  INFO = "llama:info",
}

export interface LlamaBaseMessage {
  type: LlamaMessageType;
}

export interface LlamaInitMessage extends LlamaBaseMessage {
  type: LlamaMessageType.INIT;
  options?: {
    debug?: boolean;
    gpu?: "auto" | "cuda" | "metal" | "vulkan" | "off";
    numThreads?: number;
  };
}

export interface LlamaLoadModelMessage extends LlamaBaseMessage {
  type: LlamaMessageType.LOAD_MODEL;
  modelPath: string;
  options?: {
    gpuLayers?: number;
    contextSize?: number;
    batchSize?: number;
    seed?: number;
    ignoreMemorySafetyChecks?: boolean;
  };
}

export interface LlamaCreateContextMessage extends LlamaBaseMessage {
  type: LlamaMessageType.CREATE_CONTEXT;
}

export interface LlamaGenerateCompletionMessage extends LlamaBaseMessage {
  type: LlamaMessageType.GENERATE_COMPLETION;
  prompt: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stopSequences?: string[];
    streamResponse?: boolean;
  };
}

export interface LlamaGenerateChatCompletionMessage extends LlamaBaseMessage {
  type: LlamaMessageType.GENERATE_CHAT_COMPLETION;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  options?: {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    stopSequences?: string[];
    streamResponse?: boolean;
  };
}

export interface LlamaCreateEmbeddingMessage extends LlamaBaseMessage {
  type: LlamaMessageType.CREATE_EMBEDDING;
  text: string;
}

export interface LlamaDownloadModelMessage extends LlamaBaseMessage {
  type: LlamaMessageType.DOWNLOAD_MODEL;
  modelId: string;
  modelUrl?: string;
  outputPath?: string;
}

export interface LlamaAbortMessage extends LlamaBaseMessage {
  type: LlamaMessageType.ABORT;
}

export interface LlamaShutdownMessage extends LlamaBaseMessage {
  type: LlamaMessageType.SHUTDOWN;
}

export interface LlamaModelLoadedMessage extends LlamaBaseMessage {
  type: LlamaMessageType.MODEL_LOADED;
  modelInfo: {
    name: string;
    size: number;
  };
}

export interface LlamaProgressMessage extends LlamaBaseMessage {
  type: LlamaMessageType.PROGRESS;
  operation: "download" | "load" | "inference";
  progress: number;
}

export interface LlamaCompletionChunkMessage extends LlamaBaseMessage {
  type: LlamaMessageType.COMPLETION_CHUNK;
  text: string;
}

export interface LlamaCompletionDoneMessage extends LlamaBaseMessage {
  type: LlamaMessageType.COMPLETION_DONE;
  fullText: string;
  stats?: {
    tokensPerSecond: number;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
  };
}

export interface LlamaErrorMessage extends LlamaBaseMessage {
  type: LlamaMessageType.ERROR;
  error: string;
  details?: any;
}

export interface LlamaInfoMessage extends LlamaBaseMessage {
  type: LlamaMessageType.INFO;
  message: string;
}

export type LlamaMessage =
  | LlamaInitMessage
  | LlamaLoadModelMessage
  | LlamaDownloadModelMessage
  | LlamaCreateContextMessage
  | LlamaGenerateCompletionMessage
  | LlamaGenerateChatCompletionMessage
  | LlamaCreateEmbeddingMessage
  | LlamaAbortMessage
  | LlamaShutdownMessage
  | LlamaModelLoadedMessage
  | LlamaProgressMessage
  | LlamaCompletionChunkMessage
  | LlamaCompletionDoneMessage
  | LlamaErrorMessage
  | LlamaInfoMessage;
