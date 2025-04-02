import { EventEmitter } from "events";
import { MessageChannelMain, MessagePortMain } from "electron";

/**
 * Namespace para tipos relacionados à ponte de eventos IPC
 */
namespace IPCEventTypes {
  /**
   * Mapeia métodos de uma classe para tipos de eventos
   * @template T - Tipo da classe a ser mapeada
   */
  export type ClassToEvents<T> = {
    [K in keyof T as `${string & K}`]: T[K] extends (...args: any) => any
      ? Parameters<T[K]>
      : never;
  } & { error: [error: Error] };

  /**
   * Tipo base para mapas de eventos
   */
  export type EventMap<T> = {
    [K in keyof T]: T[K];
  } & { error: [Error] };

  /**
   * Tipo para função listener de eventos
   * @template K - Tipo do nome do evento
   * @template T - Tipo do mapa de eventos
   */
  export type EventListener<K, T extends EventMap> = (
    ...args: T[K & keyof T]
  ) => void;
}

/**
 * Ponte de eventos IPC entre processos main e renderer
 * @template T - Tipo do mapa de eventos
 */
export class IPCEventBridge<T extends IPCEventTypes.EventMap> {
  private port: MessagePortMain;
  private emitter = new EventEmitter({ captureRejections: true });

  constructor(port: MessagePortMain) {
    this.port = port;
    this.setupMessageHandler();
    this.port.start();
  }

  private setupMessageHandler() {
    this.port.on("message", (event) => {
      const { type, ...args } = event.data;
      this.emitter.emit(type, ...args);
    });

    this.on("error", (error) => {
      this.port.postMessage({ type: "error", error });
    });
  }

  /**
   * Registra um listener para um tipo de evento
   * @param eventName - Nome do evento
   * @param listener - Função callback
   */
  on<K extends keyof T>(
    eventName: K,
    listener: IPCEventTypes.EventListener<K, T>
  ): this {
    this.emitter.on(eventName as string, listener);
    return this;
  }

  /**
   * Registra um listener que será chamado apenas uma vez
   * @param eventName - Nome do evento
   * @param listener - Função callback
   */
  once<K extends keyof T>(
    eventName: K,
    listener: IPCEventTypes.EventListener<K, T>
  ): this {
    this.emitter.once(eventName as string, listener);
    return this;
  }

  /**
   * Remove um listener registrado
   * @param eventName - Nome do evento
   * @param listener - Função callback
   */
  off<K extends keyof T>(
    eventName: K,
    listener: IPCEventTypes.EventListener<K, T>
  ): this {
    this.emitter.off(eventName as string, listener);
    return this;
  }

  /**
   * Dispara um evento através da ponte IPC
   * @param eventName - Nome do evento
   * @param args - Argumentos do evento
   */
  emit<K extends keyof T>(eventName: K, ...args: T[K]): void {
    this.port.postMessage({ type: eventName, ...args });
  }
}
