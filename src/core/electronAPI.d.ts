export interface LlamaAPI {
  init(options?: {
    debug?: boolean;
    gpu?: "auto" | "cuda" | "metal" | "vulkan" | "off";
    numThreads?: number;
  }): void;

  loadModel(
    modelPath: string,
    options?: {
      gpuLayers?: number;
      contextSize?: number;
      batchSize?: number;
      seed?: number;
      ignoreMemorySafetyChecks?: boolean;
    }
  ): void;

  createContext(): void;

  generateCompletion(
    prompt: string,
    options?: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      stopSequences?: string[];
      streamResponse?: boolean;
    }
  ): void;

  generateChatCompletion(
    messages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }>,
    options?: {
      maxTokens?: number;
      temperature?: number;
      topP?: number;
      stopSequences?: string[];
      streamResponse?: boolean;
    }
  ): void;

  downloadModel(
    modelId: string,
    progressCallback: (progress: number) => void
  ): Promise<void>;

  abortDownload(): Promise<void>;

  abort(): void;

  onModelLoaded(callback: (modelInfo: any) => void): () => void;
  onProgress(callback: (data: any) => void): () => void;
  onCompletionChunk(callback: (chunk: string) => void): () => void;
  onCompletionDone(callback: (data: any) => void): () => void;
  onError(callback: (data: any) => void): () => void;
}

declare global {
  interface Window {
    electronAPI: {
      llm: LlamaAPI;
    };
  }
}
