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
    const metrics = await this.mistralAdapter.getMetrics();
    // Uso de memória do processo em MB
    const memoryUsageMB = Math.round(process.memoryUsage().rss / 1024 / 1024);

    return {
      ...metrics,
      memoryUsageMB,
    };
  }
}