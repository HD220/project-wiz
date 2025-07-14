import {
  LogTransport,
  ConsoleTransportConfig,
  TransportStats,
} from "./log-transport.interface";
import { LogEntry, LogContext } from "./log-entry.interface";
import { LogLevel, LOG_LEVEL_NAMES } from "./log-level.enum";

/**
 * Transport para console com suporte a pino-pretty
 *
 * Implementa logging para console com formatação colorida
 * e suporte a pino-pretty para desenvolvimento.
 *
 * @example
 * ```typescript
 * const transport = new ConsoleTransport({
 *   level: LogLevel.INFO,
 *   colors: true,
 *   pretty: true,
 *   prettyOptions: {
 *     colorize: true,
 *     translateTime: true
 *   }
 * });
 * ```
 */
export class ConsoleTransport implements LogTransport {
  public readonly name = "console";
  public readonly level: LogLevel;
  public readonly config: ConsoleTransportConfig;

  private stats: TransportStats = {
    written: 0,
    errors: 0,
    averageWriteTime: 0,
  };

  private writeTimes: number[] = [];
  private active = true;

  constructor(config: ConsoleTransportConfig) {
    this.level = config.level;
    this.config = {
      colors: true,
      timestampFormat: "iso",
      includeStackTrace: true,
      pretty: process.env.NODE_ENV === "development",
      prettyOptions: {
        colorize: true,
        translateTime: true,
        ignore: "pid,hostname",
        hideObject: false,
        singleLine: false,
      },
      ...config,
    };
  }

  /**
   * Escreve uma entrada de log no console
   */
  async write(entry: LogEntry): Promise<void> {
    if (!this.active || !this.accepts(entry.level)) {
      return;
    }

    const startTime = Date.now();

    try {
      if (this.config.pretty) {
        await this.writePretty(entry);
      } else {
        await this.writeRaw(entry);
      }

      this.stats.written++;
      this.stats.lastWrite = Date.now();
      this.updateAverageWriteTime(Date.now() - startTime);
    } catch (error) {
      this.stats.errors++;
      this.stats.lastError = Date.now();

      // Fallback para console.error se houver problema
      console.error("Console transport error:", error);
      console.error("Original log entry:", entry);
    }
  }

  /**
   * Escreve log formatado (pretty)
   */
  private async writePretty(entry: LogEntry): Promise<void> {
    const levelName = LOG_LEVEL_NAMES[entry.level];
    const timestamp = this.formatTimestamp(entry.time);
    const colorize = this.config.colors && this.config.prettyOptions?.colorize;

    // Formatar nível com cores
    const formattedLevel = colorize
      ? this.colorizeLevel(levelName)
      : levelName.toUpperCase();

    // Formatar contexto
    const contextStr = this.formatContext(entry.context);

    // Formatar mensagem principal
    let message = `[${timestamp}] ${formattedLevel}: ${entry.msg}`;

    if (contextStr) {
      message += ` ${contextStr}`;
    }

    // Imprimir mensagem principal
    console.log(message);

    // Imprimir metadados se existirem
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log("  Metadata:", entry.metadata);
    }

    // Imprimir erro se existir
    if (entry.error) {
      console.error("  Error:", entry.error.message);

      if (this.config.includeStackTrace && entry.error.stack) {
        console.error("  Stack:", entry.error.stack);
      }

      if (entry.error.details) {
        console.error("  Details:", entry.error.details);
      }
    }
  }

  /**
   * Escreve log raw (JSON)
   */
  private async writeRaw(entry: LogEntry): Promise<void> {
    const logObject = {
      time: entry.time,
      level: entry.level,
      pid: entry.pid,
      hostname: entry.hostname,
      msg: entry.msg,
      ...(entry.context && { context: entry.context }),
      ...(entry.metadata && { metadata: entry.metadata }),
      ...(entry.error && { error: entry.error }),
      ...(entry.correlationId && { correlationId: entry.correlationId }),
      ...(entry.requestId && { requestId: entry.requestId }),
      ...(entry.duration && { duration: entry.duration }),
    };

    console.log(JSON.stringify(logObject));
  }

  /**
   * Formata timestamp baseado na configuração
   */
  private formatTimestamp(time: number): string {
    const date = new Date(time);

    switch (this.config.timestampFormat) {
      case "iso":
        return date.toISOString();
      case "relative":
        return `+${time - Date.now()}ms`;
      case "epoch":
        return time.toString();
      default:
        return date.toISOString();
    }
  }

  /**
   * Adiciona cores ao nível de log
   */
  private colorizeLevel(level: string): string {
    const colors = {
      trace: "\x1b[90m", // Cinza
      debug: "\x1b[36m", // Ciano
      info: "\x1b[32m", // Verde
      warn: "\x1b[33m", // Amarelo
      error: "\x1b[31m", // Vermelho
      fatal: "\x1b[35m", // Magenta
    };

    const reset = "\x1b[0m";
    const color = colors[level as keyof typeof colors] || "";

    return `${color}${level.toUpperCase()}${reset}`;
  }

  /**
   * Formata contexto para exibição
   */
  private formatContext(context?: LogContext): string {
    if (!context) return "";

    const parts: string[] = [];

    if (context.module) parts.push(`[${context.module}]`);
    if (context.operation) parts.push(`{${context.operation}}`);
    if (context.class) parts.push(`<${context.class}>`);
    if (context.function) parts.push(`(${context.function})`);

    return parts.join(" ");
  }

  /**
   * Atualiza tempo médio de escrita
   */
  private updateAverageWriteTime(writeTime: number): void {
    this.writeTimes.push(writeTime);

    // Manter apenas os últimos 100 tempos
    if (this.writeTimes.length > 100) {
      this.writeTimes.shift();
    }

    const sum = this.writeTimes.reduce((a, b) => a + b, 0);
    this.stats.averageWriteTime = sum / this.writeTimes.length;
  }

  /**
   * Fecha o transport
   */
  async close(): Promise<void> {
    this.active = false;
    this.writeTimes = [];
  }

  /**
   * Verifica se o transport está ativo
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Verifica se o transport aceita o nível de log
   */
  accepts(level: LogLevel): boolean {
    return level >= this.level;
  }

  /**
   * Obtém estatísticas do transport
   */
  getStats(): TransportStats {
    return { ...this.stats };
  }

  /**
   * Reseta estatísticas
   */
  resetStats(): void {
    this.stats = {
      written: 0,
      errors: 0,
      averageWriteTime: 0,
    };
    this.writeTimes = [];
  }
}
