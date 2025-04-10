import type { LlamaOptions, ModelDownloaderOptions } from 'node-llama-cpp';
import type { ModelManagerPort } from '../../../domain/ports/model-manager.port';
import { MistralGGUFAdapter } from '../../llm/adapters/MistralGGUFAdapter';

export class ModelManagerAdapter implements ModelManagerPort {
  private mistralAdapter!: MistralGGUFAdapter;

  private constructor() {}

  static async create(options?: LlamaOptions) {
    const instance = new ModelManagerAdapter();
    instance.mistralAdapter = await MistralGGUFAdapter.create(options);
    return instance;
  }

  async downloadModel(options: ModelDownloaderOptions): Promise<string> {
    return this.mistralAdapter.downloadModel(options);
  }

  async loadModel(modelPath: string): Promise<void> {
    return this.mistralAdapter.loadModel(modelPath);
  }

  async unloadModel(): Promise<void> {
    return this.mistralAdapter.unloadModel();
  }
}