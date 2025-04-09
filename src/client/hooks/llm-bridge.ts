import type { Prompt } from '../../core/domain/entities/prompt';
import type { StreamChunk } from '../../core/domain/entities/stream-chunk';

/**
 * Interface da ponte de comunicação com o serviço LLM via MessagePort
 */
export interface ILlmBridge {
  loadModel(modelPath: string): Promise<void>;

  prompt(prompt: string): Promise<string>;

  /**
   * Geração via streaming
   * @param prompt objeto Prompt
   * @param onChunk callback para cada pedaço recebido
   * @returns objeto com método cancel()
   */
  promptStream(
    prompt: Prompt,
    onChunk: (chunk: StreamChunk) => void
  ): { cancel: () => void };
}

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

interface StreamHandler {
  onChunk: (chunk: StreamChunk) => void;
  canceled: boolean;
}

export class LlmBridge implements ILlmBridge {
  private port: MessagePort;
  private requestIdCounter = 0;
  private pendingRequests = new Map<number, PendingRequest>();
  private streamHandlers = new Map<number, StreamHandler>();

  constructor(port: MessagePort) {
    this.port = port;
    this.port.onmessage = this.handleMessage.bind(this);
  }

  async loadModel(modelPath: string): Promise<void> {
    return this.sendRequest('loadModel', { modelPath });
  }

  async prompt(prompt: string): Promise<string> {
    return this.sendRequest('prompt', { prompt });
  }

  promptStream(prompt: Prompt, onChunk: (chunk: StreamChunk) => void): { cancel: () => void } {
    const requestId = this.requestIdCounter++;
    const handler: StreamHandler = { onChunk, canceled: false };
    this.streamHandlers.set(requestId, handler);

    this.port.postMessage({
      type: 'promptStream',
      payload: { prompt },
      requestId,
    });

    return {
      cancel: () => {
        handler.canceled = true;
        this.streamHandlers.delete(requestId);
        this.port.postMessage({
          type: 'cancelStream',
          requestId,
        });
      },
    };
  }

  private async sendRequest(type: string, payload: any): Promise<any> {
    const requestId = this.requestIdCounter++;
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });
      this.port.postMessage({ type, payload, requestId });
    });
  }

  private handleMessage(event: MessageEvent) {
    const message = event.data;
    const { type, requestId, payload } = message;

    if (type === 'response') {
      const pending = this.pendingRequests.get(requestId);
      if (pending) {
        pending.resolve(payload);
        this.pendingRequests.delete(requestId);
      }
    } else if (type === 'error') {
      const pending = this.pendingRequests.get(requestId);
      if (pending) {
        pending.reject(payload);
        this.pendingRequests.delete(requestId);
      }
    } else if (type === 'streamChunk') {
      const handler = this.streamHandlers.get(requestId);
      if (handler && !handler.canceled) {
        handler.onChunk(payload as StreamChunk);
      }
    } else if (type === 'streamEnd') {
      this.streamHandlers.delete(requestId);
    }
  }
}