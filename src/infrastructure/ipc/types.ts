import { Result } from "../../shared/result";
import { IpcMainInvokeEvent } from "electron";

export interface IpcMessage<T = any> {
  type: string;
  payload?: T;
  meta: {
    timestamp: number;
    correlationId: string;
    source?: string;
    serialized?: boolean; // Indica se o payload foi serializado
  };
}

export type SerializedPayload = {
  __serialized: true;
  type: string;
  value: unknown;
};

export function isSerializedPayload(
  value: unknown
): value is SerializedPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "__serialized" in value &&
    "type" in value &&
    "value" in value
  );
}

export type IpcChannel =
  | `query:${string}:${string}`
  | `command:${string}:${string}`
  | `event:${string}:${string}`;

export interface IpcHandler<T = any, R = any> {
  (event: IpcMainInvokeEvent, payload: T): Promise<Result<R>>;
  channel: IpcChannel;
  description: string;
}

export interface IpcHandlerOptions {
  timeout?: number;
  /**
   * Configuração da política de retry para chamadas IPC
   * - Aplica retry automático apenas para erros de rede/timeout
   * - Usa backoff exponencial (base 2) entre tentativas
   */
  retryPolicy?: {
    /** Número máximo de tentativas (padrão: 3) */
    maxRetries?: number;
    /** Delay base em ms para cálculo do backoff (padrão: 1000ms) */
    baseDelay?: number;
  };
}

export interface AgentIpcChannels {
  // Queries
  "query:agent:list": void;
  "query:agent:get": { id: string };

  // Commands
  "command:agent:create": { name: string; personaId: string };
  "command:agent:execute": { agentId: string; task: string };

  // Events
  "event:agent:created": { id: string; name: string };
  "event:agent:updated": { id: string; status: string };

  // Agent routing channels
  "command:agent:route": IpcMessage;
  "command:agent:middleware:add": {
    middleware: (event: IpcMainInvokeEvent, message: IpcMessage, next: () => Promise<Result<any>>) => Promise<Result<any>>;
  };
  "query:agent:metrics": void;

  // LLM Service channels
  "command:llm:execute": {
    agentId: string;
    task: {
      prompt: string;
      context?: Record<string, any>;
      options?: {
        temperature?: number;
        maxTokens?: number;
      };
    };
  };
  "query:llm:metrics": {
    agentId?: string;
  };

  // Chat channels
  "query:chat:history": {
    conversationId: string;
    limit?: number;
    before?: number;
  };
  "command:chat:send": {
    id: string;
    content: string;
    sender: {
      id: string;
      type: 'user' | 'agent';
      name: string;
    };
    timestamp: number;
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
    metadata?: {
      isMarkdown?: boolean;
      files?: Array<{
        name: string;
        type: string;
        url: string;
      }>;
    };
  };
  "event:chat:message": {
    id: string;
    content: string;
    sender: {
      id: string;
      type: 'user' | 'agent';
      name: string;
    };
    timestamp: number;
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  };
  "event:chat:status": {
    messageId: string;
    status: 'delivered' | 'read' | 'failed';
    timestamp: number;
  };
}
