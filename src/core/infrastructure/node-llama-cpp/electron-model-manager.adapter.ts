import type { LlamaModelOptions } from 'node-llama-cpp';
import { IModelManager } from 'src/core/domain/ports/imodel-manager.port';

export class ElectronModelManagerAdapter implements IModelManager {
  constructor(private workerManager: WorkerManager) {}

  async downloadModel(options: ModelDownloaderOptions): Promise<string> {
    const port = this.workerManager.getWorkerPort();
    return options.dirPath 
      ? `${options.dirPath}/${options.modelName}`
      : `./models/${options.modelName}`;
  }

  async loadModel(modelPath: string, options?: LlamaModelOptions): Promise<void> {
    const port = this.workerManager.getWorkerPort();
    // TODO: Implementar lógica de carregamento via IPC
  }

  async unloadModel(modelPath: string): Promise<void> {
    const port = this.workerManager.getWorkerPort();
    // TODO: Implementar lógica de descarregamento via IPC
  }

  isModelLoaded(modelPath: string): boolean {
    return false; // TODO: Implementar verificação real
  }

  getModelStats() {
    return {
      loadedModels: 0,
      memoryUsage: 0,
      lastUsed: {}
    };
  }

  configureCache(): void {
    // Não faz nada na versão inicial
  }
}