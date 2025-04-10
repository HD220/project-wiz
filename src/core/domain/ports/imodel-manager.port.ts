import type {
  LlamaModelOptions,
  ModelDownloaderOptions
} from 'node-llama-cpp';

export interface ModelManagementPort {
  downloadModel(options: ModelDownloaderOptions): Promise<string>;
  loadModel(modelPath: string, options?: LlamaModelOptions): Promise<void>;
  unloadModel(modelPath: string): Promise<void>;
  isModelLoaded(modelPath: string): boolean;
}
