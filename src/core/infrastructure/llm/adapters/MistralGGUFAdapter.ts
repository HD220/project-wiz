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

  // Métricas
  private totalTokensProcessed = 0;
  private totalRequests = 0;
  private errorCount = 0;
  private responseTimeSumMs = 0;

  private constructor() {}

  static async create(options?: LlamaOptions) {
    const instance = new MistralGGUFAdapter();
    await instance.initializeLlama(options);
    return instance;
  }

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

  private async initializeLlama(options?: LlamaOptions) {
    const { getLlama } = await import('node-llama-cpp');
    this.llama = await getLlama(options);
  }

  // Implementação obrigatória da interface LlmServicePort
  async loadModel(modelPath: string): Promise<void> {
    // TODO: Implementar carregamento real do modelo se necessário
    // Exemplo: await this.llama.loadModel(modelPath);
    return;
  }

  promptStream(
    prompt: Prompt,
    onChunk: (chunk: StreamChunk) => void
  ): { cancel: () => void } {
    // TODO: Implementar streaming real se necessário
    return {
      cancel: () => {
        // noop
      },
    };
  }

  async downloadModel(options: ModelDownloaderOptions): Promise<string> {
    try {
      const { createModelDownloader } = await this.loadLlamaCpp();
      const downloader = await createModelDownloader({
        ...options,
        dirPath: modelsDir,
      });
      // Retorna uma string representando o resultado
      return typeof downloader === 'string'
        ? downloader
        : JSON.stringify(downloader);
    } catch (error) {
      throw new Error('Failed to download model: ' + error);
    }
  }

  async startChatSession(options: LlamaChatSessionOptions): Promise<void> {
    const { LlamaChatSession } = await this.loadLlamaCpp();
    // Corrigido: passar options diretamente
    this.session = new LlamaChatSession(options);
  }

  // Stubs para compatibilidade com WorkerServiceAdapter
  async createContext(options?: LlamaContextOptions): Promise<void> {
    // TODO: Implementar se necessário
    return;
  }

  async initializeSession(options?: Omit<LlamaChatSessionOptions, 'contextSequence'>): Promise<void> {
    // TODO: Implementar se necessário
    return;
  }

  // Implementação do prompt com coleta de métricas
  async prompt(prompt: string): Promise<string> {
    this.totalRequests++;
    const start = Date.now();
    try {
      // O método real pode variar conforme a API do node-llama-cpp
      // Supondo que this.llama.chat retorna { response: string, tokens: number }
      // ou similar. Ajuste conforme necessário.
      const result = await (this.llama as any).chat
        ? await (this.llama as any).chat(prompt)
        : await (this.llama as any).prompt(prompt);

      const end = Date.now();
      this.responseTimeSumMs += end - start;

      // Tenta extrair tokens processados do resultado, se disponível
      if (result && typeof result.tokens === 'number') {
        this.totalTokensProcessed += result.tokens;
      } else if (result && typeof result === 'string') {
        // Fallback: conta tokens por espaços (simples, pode ser ajustado)
        this.totalTokensProcessed += result.split(/\s+/).length;
      }

      return typeof result.response === 'string' ? result.response : result;
    } catch (error) {
      this.errorCount++;
      throw error;
    }
  }

  // Exposição das métricas
  async getMetrics() {
    const averageResponseTimeMs =
      this.totalRequests > 0
        ? Math.round(this.responseTimeSumMs / this.totalRequests)
        : 0;

    return {
      totalTokensProcessed: this.totalTokensProcessed,
      totalRequests: this.totalRequests,
      averageResponseTimeMs,
      errorCount: this.errorCount,
      timestamp: Date.now(),
    };
  }
}