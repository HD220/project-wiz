import { LlamaModelOptions, LlamaContextOptions, LLamaChatPromptOptions, ModelDownloaderOptions } from "node-llama-cpp";

export interface IWorkerService {
  loadModel(options: LlamaModelOptions): Promise<void>;
  unloadModel(): Promise<void>;
  createContext(options?: LlamaContextOptions): Promise<void>;
  prompt(prompt: string, options?: LLamaChatPromptOptions): Promise<string>;
  downloadModel(options: ModelDownloaderOptions): Promise<string>;
  
  // Eventos para comunicação bidirecional
  on(event: 'response', listener: (response: string) => void): void;
  on(event: 'error', listener: (error: Error) => void): void;
  on(event: 'progress', listener: (progress: number) => void): void;
}