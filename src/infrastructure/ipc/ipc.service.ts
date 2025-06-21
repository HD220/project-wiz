import {
  IpcMessage,
  IpcChannel,
  AgentIpcChannels,
  isSerializedPayload,
} from "./types";
import { JsonLogger } from "../services/logger/json-logger.service";
import { v4 as uuidv4 } from "uuid";
import { Result, OK, NOK } from "../../shared/result";
import { deepSerialize, deepDeserialize } from "../../shared/serializer";

declare global {
  interface Window {
    ipcRenderer: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      on: (channel: string, listener: (...args: any[]) => void) => void;
      removeListener: (
        channel: string,
        listener: (...args: any[]) => void
      ) => void;
    };
  }
}

interface RetryPolicy {
  maxRetries: number;
  delay: number;
  timeoutRetries?: number; // Número específico de retries para timeouts (opcional)
}

type IpcHandlerOptions = {
  timeout?: number;
  retryPolicy?: RetryPolicy;
};

/**
 * Serviço para comunicação IPC entre processos main e renderer
 */
export class IpcService {
  private readonly logger: JsonLogger;
  private readonly ipcRenderer: typeof window.ipcRenderer;

  constructor(ipcRenderer: typeof window.ipcRenderer, logger?: JsonLogger) {
    this.ipcRenderer = ipcRenderer;
    this.logger = logger || new JsonLogger("ipc-service");
  }

  /**
   * Envia um comando para o processo main sem esperar resposta
   * @param channel Canal IPC
   * @param payload Dados da requisição
   * @returns void
   */
  sendHandler<T extends keyof AgentIpcChannels>(
    channel: T,
    payload: AgentIpcChannels[T]
  ): void {
    const correlationId = uuidv4();

    try {
      this.logger.info(`IPC send started`, {
        channel,
        correlationId,
        payload,
      });

      const serializedPayload = deepSerialize(payload);
      this.ipcRenderer.invoke(channel, serializedPayload).catch((error) => {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        errorObj.message = `[IPC:${channel}] ${errorObj.message} (correlationId: ${correlationId})`;
        this.logger.error(`IPC send failed`, {
          channel,
          correlationId,
          error: {
            name: errorObj.name,
            message: errorObj.message,
            stack: errorObj.stack,
          },
        });
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      errorObj.message = `[IPC:${channel}] ${errorObj.message} (correlationId: ${correlationId})`;
      this.logger.error(`IPC send failed`, {
        channel,
        correlationId,
        error: {
          name: errorObj.name,
          message: errorObj.message,
          stack: errorObj.stack,
        },
      });
    }
  }

  /**
   * Invoca um handler no processo main
   * @param channel Canal IPC
   * @param payload Dados da requisição
   * @param options Opções de execução
   * @returns Promise com o resultado ou erro
   */
  async invokeHandler<T extends keyof AgentIpcChannels, R>(
    channel: T,
    payload: AgentIpcChannels[T],
    options?: IpcHandlerOptions
  ): Promise<Result<R>> {
    const correlationId = uuidv4();
    const startTime = Date.now();

    try {
      this.logger.info(`IPC request started`, {
        channel,
        correlationId,
        payload,
      });

      const serializedPayload = deepSerialize(payload);

      const rawResult = await this.executeWithRetry(
        () => this.ipcRenderer.invoke(channel, serializedPayload),
        options?.retryPolicy,
        options?.timeout
      );

      // Desserializa e valida o resultado
      const deserializedResult = deepDeserialize(rawResult);

      // Type guard para verificar o formato { data }
      const isDataWrapper = (obj: any): obj is { data: R } =>
        obj && typeof obj === "object" && "data" in obj;

      const result = isDataWrapper(deserializedResult)
        ? deserializedResult.data
        : (deserializedResult as R);

      this.logger.info(`IPC request completed`, {
        channel,
        correlationId,
        duration: Date.now() - startTime,
      });

      return OK(result);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      // Adiciona contexto ao erro
      if (errorObj instanceof Error) {
        errorObj.message = `[IPC:${channel}] ${errorObj.message} (correlationId: ${correlationId})`;
      }
      
      this.logger.error(`IPC request failed`, {
        channel,
        correlationId,
        error: {
          name: errorObj.name,
          message: errorObj.message,
          stack: errorObj.stack,
        },
        duration: Date.now() - startTime,
      });
      
      return NOK(errorObj);
    }
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retryPolicy?: { maxRetries: number; delay: number },
    timeout?: number
  ): Promise<T> {
    let attempt = 0;
    let lastError: unknown;
    const defaultRetryPolicy = {
      maxRetries: 3,
      delay: 1000,
      timeoutRetries: 1
    };

    const effectiveRetryPolicy = retryPolicy
      ? { ...defaultRetryPolicy, ...retryPolicy }
      : defaultRetryPolicy;
    
    const maxRetries = effectiveRetryPolicy.maxRetries;
    const timeoutRetries = effectiveRetryPolicy.timeoutRetries ?? 1;
    const baseDelay = effectiveRetryPolicy.delay;

    const isNetworkError = (error: unknown): boolean => {
      return (
        error instanceof Error &&
        (error.message.includes("ECONNREFUSED") ||
          error.message.includes("ETIMEDOUT") ||
          error.message.includes("ENETUNREACH") ||
          error.message.includes("ECONNRESET"))
      );
    };

    while (attempt <= maxRetries) {
      try {
        if (timeout) {
          return await Promise.race([
            fn(),
            new Promise<T>((_, reject) =>
              setTimeout(
                () => reject(new Error(`Timeout after ${timeout}ms`)),
                timeout
              )
            ),
          ]);
        }
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Padroniza o erro antes de decidir sobre retry
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        // Não faz retry para erros que não são de rede/timeout
        if (!isNetworkError(errorObj)) {
          if (errorObj instanceof Error && errorObj.message.includes("Timeout")) {
            // Aplica política específica para timeouts
            if (attempt >= timeoutRetries) {
              throw errorObj;
            }
          } else {
            // Outros erros não fazem retry
            throw errorObj;
          }
        }

        attempt++;
        const effectiveMaxRetries =
          (errorObj instanceof Error && errorObj.message.includes("Timeout"))
            ? timeoutRetries
            : maxRetries;
            
        if (attempt <= effectiveMaxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Backoff exponencial
          this.logger.debug(`Retry attempt ${attempt}/${maxRetries}`, {
            delay,
            error: error instanceof Error ? error.message : String(error),
          });
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // Padroniza o erro final com informações de tentativas
    const finalError = lastError instanceof Error
      ? lastError
      : new Error(String(lastError));
      
    finalError.message = `[MaxRetries:${maxRetries}] ${finalError.message}`;
    throw finalError;
  }

  /**
   * Assina eventos de um canal IPC
   * @param channel Canal IPC
   * @param callback Função de callback
   * @returns Função para cancelar a assinatura
   */
  subscribe<T extends keyof AgentIpcChannels>(
    channel: T,
    callback: (message: IpcMessage<AgentIpcChannels[T]>) => void
  ): () => void {
    const handler = (
      event: unknown,
      message: IpcMessage<AgentIpcChannels[T]>
    ) => {
      // Processa a mensagem com tipagem segura
      const processMessage = (
        msg: IpcMessage<AgentIpcChannels[T]>
      ): IpcMessage<AgentIpcChannels[T]> => {
        let payload: AgentIpcChannels[T] | undefined;
        let isSerialized = false;

        if (msg.payload && isSerializedPayload(msg.payload)) {
          const deserialized = deepDeserialize(msg.payload.value);
          if (deserialized) {
            payload = deserialized as AgentIpcChannels[T];
            isSerialized = true;
          }
        } else {
          payload = msg.payload as AgentIpcChannels[T] | undefined;
        }

        return {
          ...msg,
          payload,
          meta: {
            ...msg.meta,
            serialized: isSerialized,
          },
        };
      };

      const processedMessage = processMessage(message);

      this.logger.info(`Received IPC event`, {
        channel,
        correlationId: processedMessage.meta.correlationId,
        serialized: processedMessage.meta.serialized,
      });
      callback(processedMessage);
    };

    this.ipcRenderer.on(channel, handler);
    return () => this.ipcRenderer.removeListener(channel, handler);
  }
}
