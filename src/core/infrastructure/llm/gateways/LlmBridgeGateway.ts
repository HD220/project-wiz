import type { Prompt } from '../../../../core/domain/value-objects/prompt';
import type { StreamChunk } from '../../../../core/domain/value-objects/stream-chunk';
import type { LlmServicePort } from '../../../../core/domain/ports/llm-service.port';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  timeoutId?: NodeJS.Timeout;
}

interface StreamHandler {
  onChunk: (chunk: StreamChunk) => void;
  canceled: boolean;
  inactivityTimeoutId?: NodeJS.Timeout;
}

export class LlmBridgeGateway implements LlmServicePort {
  private port: MessagePort;
  private requestIdCounter = 0;
  private pendingRequests = new Map<number, PendingRequest>();
  private streamHandlers = new Map<number, StreamHandler>();

  private requestTimeoutMs: number;
  private streamInactivityTimeoutMs: number;

  constructor(
    port: MessagePort,
    options?: {
      requestTimeoutMs?: number;
      streamInactivityTimeoutMs?: number;
    }
  ) {
    this.port = port;
    this.port.onmessage = this.handleMessage.bind(this);
    this.port.onmessageerror = this.handlePortError.bind(this);
    

    this.requestTimeoutMs = options?.requestTimeoutMs ?? 30000;
    this.streamInactivityTimeoutMs = options?.streamInactivityTimeoutMs ?? 30000;
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
    console.log(`[LlmBridgeGateway] promptStream criado requestId=${requestId}, total streamHandlers=${this.streamHandlers.size}`);

    const resetInactivityTimeout = () => {
      if (handler.inactivityTimeoutId) {
        clearTimeout(handler.inactivityTimeoutId);
      }
      handler.inactivityTimeoutId = setTimeout(() => {
        if (!handler.canceled) {
          console.warn(`[LlmBridgeGateway] Timeout de inatividade no stream requestId=${requestId}, cancelando automaticamente`);
          handler.canceled = true;
          this.streamHandlers.delete(requestId);
          this.port.postMessage({
            type: 'cancelStream',
            requestId,
          });
        }
      }, this.streamInactivityTimeoutMs);
    };

    resetInactivityTimeout();

    this.port.postMessage({
      type: 'promptStream',
      payload: { prompt },
      requestId,
    });

    return {
      cancel: () => {
        handler.canceled = true;
        if (handler.inactivityTimeoutId) {
          clearTimeout(handler.inactivityTimeoutId);
        }
        const deleted = this.streamHandlers.delete(requestId);
        console.log(`[LlmBridgeGateway] promptStream cancelado requestId=${requestId}, removido=${deleted}, total streamHandlers=${this.streamHandlers.size}`);
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
      const timeoutId = setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          console.warn(`[LlmBridgeGateway] Timeout na requisição '${type}' requestId=${requestId}, rejeitando automaticamente`);
          reject(new Error(`Timeout na requisição '${type}'`));
        }
      }, this.requestTimeoutMs);

      this.pendingRequests.set(requestId, { resolve, reject, timeoutId });
      console.log(`[LlmBridgeGateway] sendRequest '${type}' criado requestId=${requestId}, total pendingRequests=${this.pendingRequests.size}`);
      this.port.postMessage({ type, payload, requestId });
    });
  }

  private handleMessage(event: MessageEvent) {
    const message = event.data;
    const { type, requestId, payload } = message;

    if (type === 'response') {
      const pending = this.pendingRequests.get(requestId);
      if (pending) {
        clearTimeout(pending.timeoutId);
        pending.resolve(payload);
        this.pendingRequests.delete(requestId);
        console.log(`[LlmBridgeGateway] response recebido requestId=${requestId}, total pendingRequests=${this.pendingRequests.size}`);
      }
    } else if (type === 'error') {
      const pending = this.pendingRequests.get(requestId);
      if (pending) {
        clearTimeout(pending.timeoutId);
        pending.reject(payload);
        this.pendingRequests.delete(requestId);
        console.log(`[LlmBridgeGateway] error recebido requestId=${requestId}, total pendingRequests=${this.pendingRequests.size}`);
      }
    } else if (type === 'streamChunk') {
      const handler = this.streamHandlers.get(requestId);
      if (handler && !handler.canceled) {
        handler.onChunk(payload as StreamChunk);
        if (handler.inactivityTimeoutId) {
          clearTimeout(handler.inactivityTimeoutId);
        }
        handler.inactivityTimeoutId = setTimeout(() => {
          if (!handler.canceled) {
            console.warn(`[LlmBridgeGateway] Timeout de inatividade no stream requestId=${requestId}, cancelando automaticamente`);
            handler.canceled = true;
            this.streamHandlers.delete(requestId);
            this.port.postMessage({
              type: 'cancelStream',
              requestId,
            });
          }
        }, this.streamInactivityTimeoutMs);
      }
    } else if (type === 'streamEnd') {
      const handler = this.streamHandlers.get(requestId);
      if (handler && handler.inactivityTimeoutId) {
        clearTimeout(handler.inactivityTimeoutId);
      }
      const deleted = this.streamHandlers.delete(requestId);
      console.log(`[LlmBridgeGateway] streamEnd recebido requestId=${requestId}, removido=${deleted}, total streamHandlers=${this.streamHandlers.size}`);
    }
  }

  private handlePortError(error: any) {
    console.error('[LlmBridgeGateway] Falha de comunicação detectada, limpando todos os mapas', error);
    for (const [requestId, pending] of this.pendingRequests.entries()) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error('Falha de comunicação com o worker'));
    }
    this.pendingRequests.clear();

    for (const [requestId, handler] of this.streamHandlers.entries()) {
      if (handler.inactivityTimeoutId) {
        clearTimeout(handler.inactivityTimeoutId);
      }
    }
    this.streamHandlers.clear();
  }
}