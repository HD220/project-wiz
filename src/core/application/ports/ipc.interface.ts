// src/core/application/ports/ipc.interface.ts
import type { Result } from "@/shared/result";

/**
 * Interface para comunicação entre processos (IPC)
 * Define os contratos para comunicação entre camadas da aplicação
 */
export interface IpcHandler {
  /**
   * Registra um handler para um canal específico
   * @param channel Nome do canal (deve seguir padrão [context]:[action])
   * @param handler Função que processa a requisição
   */
  handle<T = unknown, R = unknown>(
    channel: string,
    handler: (data: T) => Promise<Result<R>>
  ): void;

  /**
   * Remove todos os handlers de um canal
   * @param channel Nome do canal
   */
  removeAllHandlers(channel: string): void;
}

export interface IpcInvoker {
  /**
   * Invoca um handler remoto
   * @param channel Nome do canal
   * @param data Dados a serem enviados
   * @returns Promise com o resultado
   */
  invoke<T = unknown, R = unknown>(
    channel: string,
    data?: T
  ): Promise<Result<R>>;

  /**
   * Envia uma mensagem sem esperar resposta
   * @param channel Nome do canal
   * @param data Dados a serem enviados
   */
  send<T = unknown>(channel: string, data?: T): void;

  /**
   * Registra um listener para um canal
   * @param channel Nome do canal
   * @param listener Função que processa a mensagem
   * @returns Função para remover o listener
   */
  on<T = unknown>(
    channel: string,
    listener: (data: T) => Promise<void>
  ): () => void;
}

/**
 * Interface completa para comunicação IPC
 * Combina handler e invoker em uma única interface
 */
export interface IpcService extends IpcHandler, IpcInvoker {}
