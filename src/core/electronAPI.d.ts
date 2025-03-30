import {
  LlamaClientMessageType,
  LlamaWorkerResponseType,
  ModelInfo,
  DownloadProgress,
  CompletionData,
  ErrorData,
} from "./llama/llama-types";

/**
 * Interface para os handlers de eventos do LLM
 */
export interface LlamaEventHandlers {
  onModelLoaded: (modelInfo: ModelInfo) => void;
  onProgress: (data: DownloadProgress) => void;
  onCompletionChunk: (chunk: string) => void;
  onCompletionDone: (data: CompletionData) => void;
  onError: (error: string) => void;
  onDownloadProgress: (requestId: string, progress: number) => void;
  onDownloadComplete: (requestId: string, filePath: string) => void;
  onDownloadError: (requestId: string, error: string) => void;
}

/**
 * API exposta pelo preload para comunicação com o worker LLM
 */
export interface ElectronAPI {
  // Solicita porta de comunicação com o worker
  requestLlamaPort: () => void;

  // Configura handlers para eventos do worker
  setupLlamaHandlers: (
    handlers: LlamaEventHandlers
  ) => (() => void) | undefined;

  // Envia mensagem para o worker
  sendToLlamaWorker: (message: LlamaClientMessageType) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
