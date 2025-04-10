import type {
  LlamaModelOptions,
  LlamaContextOptions,
  LLamaChatPromptOptions,
  ModelDownloaderOptions,
  LlamaOptions,
  LlamaChatSessionOptions,
} from 'node-llama-cpp';
import { createModelDownloader, LlamaChatSession } from 'node-llama-cpp';
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
      const downloader = await createModelDownloader({
        ...options,
        dirPath: modelsDir,
      });
      const modelPath = await downloader.download();
      return modelPath;
    } catch (error) {
      console.error('Failed to download model:', error);
      throw error;
    }
  }

  async loadModel(modelPath: string): Promise<void> {
    if (this.model) {
      await this.unloadModel();
    }
    const options: LlamaModelOptions = { modelPath };
    this.model = await this.llama.loadModel(options);
  }

  async unloadModel(): Promise<void> {
    try {
      await this.model?.dispose();
      this.session?.dispose();
      await this.context?.dispose();
    } catch (error) {
      console.error(error);
    }
  }

  async createContext(options?: LlamaContextOptions): Promise<void> {
    if (!this.model) throw new Error('Modelo não carregado');
    this.context = await this.model.createContext(options);
  }

  async initializeSession(options?: Omit<LlamaChatSessionOptions, 'contextSequence'>): Promise<void> {
    if (!this.context) throw new Error('Contexto não carregado');
    this.session = new LlamaChatSession({
      ...options,
      contextSequence: this.context.getSequence(),
    });
  }

  async prompt(prompt: string, signal?: AbortSignal): Promise<string> {
    if (!this.session) throw new Error('Sessão não iniciada');

    if (signal?.aborted) {
      throw new Error('Requisição cancelada');
    }

    return new Promise<string>((resolve, reject) => {
      const onAbort = () => {
        reject(new Error('Requisição cancelada'));
      };

      signal?.addEventListener('abort', onAbort);

      this.session!.prompt(prompt)
        .then(result => {
          signal?.removeEventListener('abort', onAbort);
          if (!signal?.aborted) {
            resolve(result);
          }
        })
        .catch(err => {
          signal?.removeEventListener('abort', onAbort);
          reject(err);
        });
    });
  }

  promptStream(prompt: Prompt, onChunk: (chunk: StreamChunk) => void): { cancel: () => void } {
    let canceled = false;
    let accumulated = '';

    (async () => {
      try {
        if (!this.session) throw new Error('Sessão não iniciada');

        await this.session.prompt(prompt.text, {
          onToken(tokens) {
            if (canceled) return;
            for (const token of tokens) {
              accumulated += String(token);
            }
            onChunk({ content: accumulated, isFinal: false });
          },
        });

        if (!canceled) {
          onChunk({ content: accumulated, isFinal: true });
        }
      } catch (error) {
        console.error('Erro no promptStream:', error);
      }
    })();

    return {
      cancel: () => {
        canceled = true;
      },
    };
  }
}