import type {
  LlamaContextOptions,
  LLamaChatPromptOptions,
  LlamaOptions,
  LlamaChatSessionOptions,
} from 'node-llama-cpp';
import type { WorkerServicePort } from '../../../domain/ports/worker-service.port';
import { MistralGGUFAdapter } from '../../llm/adapters/MistralGGUFAdapter';

export class WorkerServiceAdapter implements WorkerServicePort {
  private mistralAdapter!: MistralGGUFAdapter;

  private constructor() {}

  static async create(options?: LlamaOptions) {
    const instance = new WorkerServiceAdapter();
    instance.mistralAdapter = await MistralGGUFAdapter.create(options);
    return instance;
  }

  async createContext(options?: LlamaContextOptions): Promise<void> {
    return this.mistralAdapter.createContext(options);
  }

  async initializeSession(options?: Omit<LlamaChatSessionOptions, 'contextSequence'>): Promise<void> {
    return this.mistralAdapter.initializeSession(options);
  }

  async prompt(prompt: string, options?: LLamaChatPromptOptions): Promise<string> {
    // Ajuste: MistralGGUFAdapter.prompt aceita apenas 1 argumento
    return this.mistralAdapter.prompt(prompt);
  }

  async getMetrics() {
    // TODO: substituir por coleta real
    return {
      totalTokensProcessed: 12345,
      totalRequests: 678,
      averageResponseTimeMs: 150,
      errorCount: 3,
      memoryUsageMB: 512,
      timestamp: Date.now(),
    };
  }
}