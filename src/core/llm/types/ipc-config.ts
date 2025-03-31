import type {
  LlamaOptions,
  LlamaModelOptions,
  LlamaContextOptions,
  LlamaChatSessionOptions,
  LLamaChatPromptOptions,
} from "node-llama-cpp";

export interface InitializeLlamaPayload {
  options?: LlamaOptions;
}

export interface LoadModelPayload {
  options: LlamaModelOptions;
}

export interface CreateContextPayload {
  options?: LlamaContextOptions;
}

export interface InitializeSessionPayload {
  options?: Omit<LlamaChatSessionOptions, "contextSequence">;
}

export interface ProcessRequestPayload {
  prompt: string;
  options?: LLamaChatPromptOptions;
}

export interface ProcessRequestResponse {
  response: string;
  tokensUsed: number;
}

export type IPCMessage<T = unknown> = {
  id: string;
  channel: string;
  payload?: T;
  error?: string;
};

export type WorkerChannels = {
  initializeLlama: InitializeLlamaPayload;
  loadModel: LoadModelPayload;
  createContext: CreateContextPayload;
  initializeSession: InitializeSessionPayload;
  processRequest: ProcessRequestPayload;
};

export type HandlerFunction<T extends keyof WorkerChannels, R = unknown> = (
  payload: WorkerChannels[T]
) => Promise<R> | R;

export type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeout: NodeJS.Timeout;
};
