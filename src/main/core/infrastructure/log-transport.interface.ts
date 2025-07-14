import { LogEntry, LogEntryConfig } from "./log-entry.interface";
import { LogLevel } from "./log-level.enum";

/**
 * Interface para transports de log compatível com Pino.js
 *
 * Define a estrutura básica para implementar diferentes
 * destinos de log (console, arquivo, rede, etc.)
 *
 * @example
 * ```typescript
 * class CustomTransport implements LogTransport {
 *   async write(entry: LogEntry): Promise<void> {
 *     // Implementação personalizada
 *   }
 * }
 * ```
 */
export interface LogTransport {
  /** Nome identificador do transport */
  readonly name: string;

  /** Nível mínimo de log aceito pelo transport */
  readonly level: LogLevel;

  /** Configuração do transport */
  readonly config: LogTransportConfig;

  /**
   * Escreve uma entrada de log no transport
   * @param entry Entrada de log a ser escrita
   */
  write(entry: LogEntry): Promise<void>;

  /**
   * Fecha o transport e limpa recursos
   */
  close(): Promise<void>;

  /**
   * Verifica se o transport está ativo
   */
  isActive(): boolean;

  /**
   * Verifica se o transport aceita o nível de log
   * @param level Nível de log a ser verificado
   */
  accepts(level: LogLevel): boolean;
}

/**
 * Configuração base para transports
 */
export interface LogTransportConfig {
  /** Nível mínimo de log */
  level: LogLevel;

  /** Formato de saída */
  format?: "json" | "text" | "pretty";

  /** Configuração de campos a serem ocultados */
  redact?: string[];

  /** Configuração de serialização */
  serialization?: {
    /** Incluir timestamp */
    timestamp?: boolean;

    /** Incluir hostname */
    hostname?: boolean;

    /** Incluir PID */
    pid?: boolean;

    /** Incluir contexto completo */
    context?: boolean;

    /** Incluir metadados */
    metadata?: boolean;
  };

  /** Configuração de performance */
  performance?: {
    /** Buffer de escrita */
    buffer?: boolean;

    /** Tamanho do buffer */
    bufferSize?: number;

    /** Timeout para flush do buffer */
    flushTimeout?: number;

    /** Escrita assíncrona */
    async?: boolean;
  };
}

/**
 * Configuração específica para console transport
 */
export interface ConsoleTransportConfig extends LogTransportConfig {
  /** Usar cores na saída */
  colors?: boolean;

  /** Formato de timestamp */
  timestampFormat?: "iso" | "relative" | "epoch";

  /** Incluir stack trace em erros */
  includeStackTrace?: boolean;

  /** Usar pino-pretty */
  pretty?: boolean;

  /** Configurações do pino-pretty */
  prettyOptions?: {
    colorize?: boolean;
    translateTime?: boolean;
    ignore?: string;
    hideObject?: boolean;
    singleLine?: boolean;
  };
}

/**
 * Configuração específica para file transport
 */
export interface FileTransportConfig extends LogTransportConfig {
  /** Caminho do arquivo de log */
  filePath: string;

  /** Rotação de arquivos */
  rotation?: {
    /** Habilitar rotação */
    enabled: boolean;

    /** Tamanho máximo do arquivo (em bytes) */
    maxFileSize?: number;

    /** Número máximo de arquivos */
    maxFiles?: number;

    /** Padrão de nome dos arquivos rotacionados */
    pattern?: string;

    /** Compressão dos arquivos antigos */
    compress?: boolean;
  };

  /** Configurações de escrita */
  writing?: {
    /** Modo de escrita */
    mode?: "append" | "overwrite";

    /** Encoding do arquivo */
    encoding?: "utf8" | "ascii" | "base64";

    /** Sincronização automática */
    autoSync?: boolean;

    /** Intervalo de sincronização */
    syncInterval?: number;
  };
}

/**
 * Configuração específica para network transport
 */
export interface NetworkTransportConfig extends LogTransportConfig {
  /** URL do endpoint */
  endpoint: string;

  /** Método HTTP */
  method?: "POST" | "PUT" | "PATCH";

  /** Headers HTTP */
  headers?: Record<string, string>;

  /** Autenticação */
  auth?: {
    type: "bearer" | "basic" | "apikey";
    credentials: string;
  };

  /** Configurações de retry */
  retry?: {
    /** Número máximo de tentativas */
    maxAttempts?: number;

    /** Delay entre tentativas */
    delay?: number;

    /** Backoff exponencial */
    backoff?: boolean;
  };

  /** Timeout das requisições */
  timeout?: number;

  /** Batch de envios */
  batch?: {
    /** Habilitar batch */
    enabled: boolean;

    /** Tamanho do batch */
    size?: number;

    /** Timeout do batch */
    timeout?: number;
  };
}

/**
 * Estatísticas de um transport
 */
export interface TransportStats {
  /** Número de logs escritos */
  written: number;

  /** Número de erros */
  errors: number;

  /** Timestamp do último log */
  lastWrite?: number;

  /** Timestamp do último erro */
  lastError?: number;

  /** Tempo médio de escrita */
  averageWriteTime?: number;

  /** Tamanho do buffer atual */
  bufferSize?: number;
}

/**
 * Interface para transports com estatísticas
 */
export interface StatefulLogTransport extends LogTransport {
  /** Obter estatísticas do transport */
  getStats(): TransportStats;

  /** Resetar estatísticas */
  resetStats(): void;
}
