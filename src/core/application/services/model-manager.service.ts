import { IModelManager } from '../../domain/ports/imodel-manager.port';
import type { LlamaModelOptions, ModelDownloaderOptions } from 'node-llama-cpp';

export class ModelManager implements IModelManager {
  private workerManager: WorkerManager;
  private lastUsed = 0;
  public currentModel: string | null = null;

  constructor(workerManager: WorkerManager) {
    this.workerManager = workerManager;
  }

  async downloadModel(options: ModelDownloaderOptions): Promise<string> {
    const port = this.workerManager.getWorkerPort();
    // TODO: Implementar lógica de download via IPC
    return options.dirPath 
      ? `${options.dirPath}/${options.modelName}`
      : `./models/${options.modelName}`;
  }

  async loadModel(modelPath: string, options?: LlamaModelOptions): Promise<void> {
    const port = this.workerManager.getWorkerPort();
    // TODO: Implementar lógica de carregamento via IPC
    this.currentModel = modelPath;
    this.lastUsed = Date.now();
  }

  async unloadModel(modelPath: string): Promise<void> {
    const port = this.workerManager.getWorkerPort();
    // TODO: Implementar lógica de descarregamento via IPC
    if (this.currentModel === modelPath) {
      this.currentModel = null;
    }
  }

  isModelLoaded(modelPath: string): boolean {
    return this.currentModel === modelPath;
  }

}