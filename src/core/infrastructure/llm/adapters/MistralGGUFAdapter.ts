import type {
  LlamaModelOptions,
  LlamaContextOptions,
  LLamaChatPromptOptions,
  ModelDownloaderOptions,
  LlamaOptions,
  LlamaChatSessionOptions,
} from 'node-llama-cpp';
import path from 'node:path';
import type { Prompt } from '../../../domain/value-objects/prompt';
import type { StreamChunk } from '../../../domain/value-objects/stream-chunk';
import type { LlmServicePort } from '../../../domain/ports/llm-service.port';

const modelsDir = path.join(__dirname, '../models');

export class MistralGGUFAdapter implements LlmServicePort {
  private llama!: import('node-llama-cpp').Llama;
  private model?: import('node-llama-cpp').LlamaModel;
  private context?: import('node-llama-cpp').LlamaContext;
  private session?: import('node-llama-cpp').LlamaChatSession;

  private _llamaCppModule: typeof import('node-llama-cpp') | null = null;

  private async loadLlamaCpp() {
    if (!this._llamaCppModule) {
      try {
        this._llamaCppModule = await import('node-llama-cpp');
      } catch (error) {
        throw new Error('Failed to load node-llama-cpp module: ' + error);
      }
    }
    return this._llamaCppModule;
  }

  private constructor() {}

  static async create(options?: LlamaOptions) {
    const instance = new MistralGGUFAdapter();
    await instance.initializeLlama(options);
    return instance;
  }

  private async initializeLlama(options?: LlamaOptions) {
    const { getLlama } = await import('node-llama-cpp');
    this.llama = await getLlama(options);
  }

  async downloadModel(options: ModelDownloaderOptions): Promise<string> {
    try {
      const { createModelDownloader } = await this.loadLlamaCpp();
      const downloader = await createModelDownloader({
        ...options,
        dirPath: modelsDir,
      });
      return downloader;
    } catch (error) {
      throw new Error('Failed to download model: ' + error);
    }
  }

  async startChatSession(options: LlamaChatSessionOptions): Promise<void> {
    const { LlamaChatSession } = await this.loadLlamaCpp();
    this.session = new LlamaChatSession(this.context!, options);
  }

  // Other methods of LlmServicePort...
}