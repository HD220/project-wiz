import type { ILlmService } from '../../domain/ports/llm-service.port';
import type { IWorkerService } from '../../domain/ports/iworker-service.port';
import type { IModelManager } from '../../domain/ports/imodel-manager.port';
import type { Prompt } from '../../domain/entities/prompt';
import type { StreamChunk } from '../../domain/entities/stream-chunk';

export class LlmService implements ILlmService {
  private readonly worker: IWorkerService;
  private readonly modelManager: IModelManager;
  private currentModelPath: string | null = null;

  constructor(worker: IWorkerService, modelManager: IModelManager) {
    this.worker = worker;
    this.modelManager = modelManager;
  }

  async loadModel(modelPath: string): Promise<void> {
    await this.modelManager.loadModel(modelPath);
    this.currentModelPath = modelPath;
  }

  async prompt(promptText: string): Promise<string> {
    await this.ensureModelLoaded();
    return this.worker.prompt(promptText);
  }

  async promptStream(prompt: Prompt, onChunk: (chunk: StreamChunk) => void): Promise<void> {
    await this.ensureModelLoaded();

    return new Promise<void>((resolve, reject) => {
      const handleResponse = (response: string) => {
        const chunk: StreamChunk = { content: response, isFinal: false };
        onChunk(chunk);
      };

      const handleError = (error: Error) => {
        // Não é possível remover listeners sem suporte a 'off'
        reject(error);
      };

      // ATENÇÃO: Não há suporte para remover listeners atualmente.
      // Isso pode causar vazamento de memória.
      // Aguardar implementação da melhoria para corrigir.
      this.worker.on('response', handleResponse);
      this.worker.on('error', handleError);

      this.worker.prompt(prompt.text)
        .then((finalResponse) => {
          const finalChunk: StreamChunk = { content: finalResponse, isFinal: true };
          onChunk(finalChunk);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private async ensureModelLoaded(): Promise<void> {
    if (!this.currentModelPath) {
      throw new Error('Nenhum modelo carregado');
    }
    const loaded = this.modelManager.isModelLoaded(this.currentModelPath);
    if (!loaded) {
      await this.modelManager.loadModel(this.currentModelPath);
    }
  }
}