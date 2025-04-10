export interface Prompt {
  text: string;
}

export interface StreamChunk {
  content: string;
  isFinal: boolean;
}

export class LlmService {
  private static readonly DEFAULT_TIMEOUT_MS = 60000; // 60 segundos padrão

  private readonly worker: any;
  private readonly modelManager: any;
  private currentModelPath: string | null = null;

  constructor(worker: any, modelManager: any) {
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
      const responseHandler = this.createResponseHandler(onChunk);
      const errorHandler = this.createErrorHandler(reject);

      const cleanup = () => {
        clearTimeout(timeoutId);
        this.worker.off('response', responseHandler);
        this.worker.off('error', errorHandler);
      };

      const timeoutId = setTimeout(() => {
        console.warn(`[LlmService] Timeout após ${LlmService.DEFAULT_TIMEOUT_MS}ms para promptStream`);
        cleanup();
        reject(new Error('Timeout na resposta do modelo'));
      }, LlmService.DEFAULT_TIMEOUT_MS);

      const wrappedResolve = () => {
        console.debug('[LlmService] promptStream finalizado com sucesso');
        cleanup();
        resolve();
      };

      const wrappedReject = (error: unknown) => {
        console.error('[LlmService] promptStream finalizado com erro:', error);
        cleanup();
        reject(error);
      };

      this.worker.on('response', responseHandler);
      this.worker.on('error', errorHandler);

      this.sendPromptAndHandleFinalResponse(
        prompt,
        onChunk,
        wrappedResolve,
        wrappedReject
      );
    });
  }

  private createResponseHandler(onChunk: (chunk: StreamChunk) => void) {
    return (response: string) => {
      const chunk: StreamChunk = { content: response, isFinal: false };
      onChunk(chunk);
    };
  }

  private createErrorHandler(reject: (reason?: any) => void) {
    return (error: Error) => {
      reject(error);
    };
  }

  private registerWorkerListeners(
    responseHandler: (response: string) => void,
    errorHandler: (error: Error) => void
  ) {
    this.worker.on('response', responseHandler);
    this.worker.on('error', errorHandler);
  }

  private sendPromptAndHandleFinalResponse(
    prompt: Prompt,
    onChunk: (chunk: StreamChunk) => void,
    resolve: () => void,
    reject: (reason?: any) => void
  ) {
    this.worker
      .prompt(prompt.text)
      .then((finalResponse: string) => {
        const finalChunk: StreamChunk = { content: finalResponse, isFinal: true };
        onChunk(finalChunk);
        resolve();
      })
      .catch((error: unknown) => {
        reject(error);
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