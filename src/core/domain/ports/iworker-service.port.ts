import {
  LlamaModelOptions,
  LlamaContextOptions,
  LLamaChatPromptOptions,
  ModelDownloaderOptions
} from 'node-llama-cpp';

export interface ModelLoaderPort {
  loadModel(options: LlamaModelOptions): Promise<void>;
  unloadModel(): Promise<void>;
}

export interface ModelDownloaderPort {
  downloadModel(options: ModelDownloaderOptions): Promise<string>;
}

export interface ContextManagerPort {
  createContext(options?: LlamaContextOptions): Promise<void>;
}

export interface PromptExecutorPort {
  prompt(prompt: string, options?: LLamaChatPromptOptions): Promise<string>;
}

export interface WorkerEventPort {
  on(event: 'response', listener: (response: string) => void): void;
  on(event: 'error', listener: (error: Error) => void): void;
  on(event: 'progress', listener: (progress: number) => void): void;
}