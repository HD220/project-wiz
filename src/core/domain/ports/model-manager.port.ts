import type { LlamaModelOptions, ModelDownloaderOptions } from 'node-llama-cpp';

export interface ModelManagerPort {
  downloadModel(options: ModelDownloaderOptions): Promise<string>;

  loadModel(modelPath: string, options?: LlamaModelOptions): Promise<void>;

  unloadModel(modelPath: string): Promise<void>;
}