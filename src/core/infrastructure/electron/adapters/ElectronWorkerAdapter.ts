import type { Prompt } from '../../../domain/value-objects/prompt';
import type { StreamChunk } from '../../../domain/value-objects/stream-chunk';

/**
 * Erro lançado quando o worker atinge timeout.
 */
export class WorkerTimeoutError extends Error {
  constructor(message = 'Timeout na resposta do worker') {
    super(message);
    this.name = 'WorkerTimeoutError';
  }
}

/**
 * Erro genérico para falhas no serviço LLM.
 */
export class LLMServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LLMServiceError';
  }
}

interface IpcClient {
  sendPromptRequest(prompt: Prompt): Promise<void>;
  onStreamChunk(callback: (chunk: StreamChunk) => void): void;
  onError(callback: (error: Error) => void): void;
  removeAllListeners(): void;
}

class ElectronIpcClient implements IpcClient {
  private ipcRenderer: any;

  constructor(ipcRenderer: any) {
    this.ipcRenderer = ipcRenderer;
  }

  async sendPromptRequest(prompt: Prompt): Promise<void> {
    this.ipcRenderer.send('llm-prompt-request', JSON.stringify(prompt));
  }

  onStreamChunk(callback: (chunk: StreamChunk) => void): void {
    this.ipcRenderer.on('llm-prompt-stream', (_event: any, data: string) => {
      try {
        const chunk = JSON.parse(data);
        callback(chunk);
      } catch (e) {
        console.error('Erro ao parsear chunk do IPC', e);
      }
    });
  }

  onError(callback: (error: Error) => void): void {
    this.ipcRenderer.on('llm-prompt-error', (_event: any, data: string) => {
      try {
        const errObj = JSON.parse(data);
        callback(new Error(errObj.message || 'Erro desconhecido no worker'));
      } catch (e) {
        callback(new Error('Erro desconhecido no worker'));
      }
    });
  }

  removeAllListeners(): void {
    this.ipcRenderer.removeAllListeners('llm-prompt-stream');
    this.ipcRenderer.removeAllListeners('llm-prompt-error');
  }
}

export class ElectronWorkerAdapter {
  async loadModel(options: any): Promise<void> {
    return;
  }

  async unloadModel(): Promise<void> {
    return;
  }

  async createContext(options?: any): Promise<void> {
    return;
  }

  async prompt(prompt: string, options?: any): Promise<string> {
    return '';
  }

  async downloadModel(options: any): Promise<string> {
    return '';
  }

  on(event: 'response' | 'error' | 'progress', listener: (...args: any[]) => void): void {
  }

  async executePrompt(
    prompt: Prompt,
    onChunk: (chunk: StreamChunk) => void,
    timeoutMs = 10000
  ): Promise<void> {
    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts) {
      try {
        attempt++;

        const stream = this.ipcPromptStream(prompt, timeoutMs);

        for await (const chunk of stream) {
          onChunk(chunk);
        }

        return;
      } catch (error: any) {
        if (error instanceof WorkerTimeoutError) {
          if (attempt < maxAttempts) {
            continue;
          } else {
            throw new LLMServiceError('Timeout do worker após múltiplas tentativas');
          }
        } else {
          throw new LLMServiceError(error.message || 'Erro desconhecido no serviço LLM');
        }
      }
    }
  }

  private async *ipcPromptStream(prompt: Prompt, timeoutMs = 10000): AsyncGenerator<StreamChunk> {
    const ipcClient = new ElectronIpcClient((window as any).electronAPI || (window as any).ipcRenderer);

    let firstChunkReceived = false;
    let isFinalReceived = false;
    let errorReceived: Error | null = null;

    const chunkQueue: StreamChunk[] = [];
    const resolveQueue: (() => void)[] = [];

    const pushChunk = (chunk: StreamChunk) => {
      chunkQueue.push(chunk);
      resolveQueue.forEach((resolve) => resolve());
      resolveQueue.length = 0;
    };

    const waitForChunk = async () => {
      if (chunkQueue.length > 0) {
        return;
      }
      return new Promise<void>((resolve) => {
        resolveQueue.push(resolve);
      });
    };

    ipcClient.onStreamChunk((chunk) => {
      firstChunkReceived = true;
      pushChunk(chunk);
      if (chunk.isFinal) {
        isFinalReceived = true;
      }
    });

    ipcClient.onError((err) => {
      errorReceived = err;
      resolveQueue.forEach((resolve) => resolve());
      resolveQueue.length = 0;
    });

    await ipcClient.sendPromptRequest(prompt);

    const timeoutPromise = new Promise<void>((_, reject) => {
      const timer = setTimeout(() => {
        if (!firstChunkReceived) {
          reject(new WorkerTimeoutError());
        }
      }, timeoutMs);
      const clear = () => clearTimeout(timer);
      timeoutPromise.finally(clear);
    });

    try {
      while (!isFinalReceived && !errorReceived) {
        await Promise.race([
          waitForChunk(),
          timeoutPromise
        ]);

        while (chunkQueue.length > 0) {
          const chunk = chunkQueue.shift()!;
          yield chunk;
        }
      }

      if (errorReceived) {
        throw errorReceived;
      }
    } finally {
      ipcClient.removeAllListeners();
    }
  }
}