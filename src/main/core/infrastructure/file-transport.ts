import { promises as fs } from "fs";
import { createWriteStream, WriteStream } from "fs";
import { dirname, basename, extname, join } from "path";
import {
  LogTransport,
  FileTransportConfig,
  TransportStats,
} from "./log-transport.interface";
import { LogEntry } from "./log-entry.interface";
import { LogLevel } from "./log-level.enum";

/**
 * Transport para arquivos com suporte a rotação
 *
 * Implementa logging para arquivos com suporte a rotação
 * automática por tamanho e configurações avançadas.
 *
 * @example
 * ```typescript
 * const transport = new FileTransport({
 *   level: LogLevel.INFO,
 *   filePath: './logs/application.log',
 *   rotation: {
 *     enabled: true,
 *     maxFileSize: 10 * 1024 * 1024, // 10MB
 *     maxFiles: 5,
 *     compress: true
 *   }
 * });
 * ```
 */
export class FileTransport implements LogTransport {
  public readonly name = "file";
  public readonly level: LogLevel;
  public readonly config: FileTransportConfig;

  private stats: TransportStats = {
    written: 0,
    errors: 0,
    averageWriteTime: 0,
  };

  private writeTimes: number[] = [];
  private active = true;
  private writeStream?: WriteStream;
  private currentFileSize = 0;
  private writeBuffer: string[] = [];
  private flushTimeout?: NodeJS.Timeout;

  constructor(config: FileTransportConfig) {
    this.level = config.level;
    this.config = {
      rotation: {
        enabled: false,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        pattern: "{name}-{timestamp}.{ext}",
        compress: false,
      },
      writing: {
        mode: "append",
        encoding: "utf8",
        autoSync: false,
        syncInterval: 1000,
      },
      performance: {
        buffer: true,
        bufferSize: 1000,
        flushTimeout: 5000,
        async: true,
      },
      ...config,
    };

    this.initializeFile();
  }

  /**
   * Inicializa o arquivo de log
   */
  private async initializeFile(): Promise<void> {
    try {
      // Criar diretório se não existir
      await fs.mkdir(dirname(this.config.filePath), { recursive: true });

      // Verificar tamanho do arquivo atual
      try {
        const stats = await fs.stat(this.config.filePath);
        this.currentFileSize = stats.size;
      } catch {
        this.currentFileSize = 0;
      }

      // Criar stream de escrita
      this.writeStream = createWriteStream(this.config.filePath, {
        flags: this.config.writing?.mode === "overwrite" ? "w" : "a",
        encoding: this.config.writing?.encoding || "utf8",
      });

      // Configurar auto-sync se habilitado
      if (this.config.writing?.autoSync) {
        const interval = this.config.writing.syncInterval || 1000;
        setInterval(() => this.syncFile(), interval);
      }
    } catch (error) {
      console.error("Failed to initialize file transport:", error);
      this.active = false;
    }
  }

  /**
   * Escreve uma entrada de log no arquivo
   */
  async write(entry: LogEntry): Promise<void> {
    if (!this.active || !this.accepts(entry.level)) {
      return;
    }

    const startTime = Date.now();

    try {
      const logLine = this.formatLogEntry(entry);

      // Verificar se precisa rotacionar
      if (this.config.rotation?.enabled && this.needsRotation(logLine)) {
        await this.rotateFile();
      }

      // Escrever no buffer ou arquivo
      if (this.config.performance?.buffer) {
        this.writeToBuffer(logLine);
      } else {
        await this.writeToFile(logLine);
      }

      this.stats.written++;
      this.stats.lastWrite = Date.now();
      this.updateAverageWriteTime(Date.now() - startTime);
    } catch (error) {
      this.stats.errors++;
      this.stats.lastError = Date.now();
      console.error("File transport error:", error);
    }
  }

  /**
   * Formata entrada de log para arquivo
   */
  private formatLogEntry(entry: LogEntry): string {
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

    return JSON.stringify(logObject) + "\n";
  }

  /**
   * Verifica se precisa rotacionar arquivo
   */
  private needsRotation(logLine: string): boolean {
    const maxSize = this.config.rotation?.maxFileSize || 10 * 1024 * 1024;
    return this.currentFileSize + Buffer.byteLength(logLine) > maxSize;
  }

  /**
   * Rotaciona arquivo de log
   */
  private async rotateFile(): Promise<void> {
    if (!this.writeStream) return;

    try {
      // Fechar stream atual
      await new Promise<void>((resolve, reject) => {
        this.writeStream!.end((error?: Error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      // Gerar nome do arquivo rotacionado
      const rotatedName = this.generateRotatedName();

      // Mover arquivo atual
      await fs.rename(this.config.filePath, rotatedName);

      // Comprimir se habilitado
      if (this.config.rotation?.compress) {
        await this.compressFile(rotatedName);
      }

      // Limpar arquivos antigos
      await this.cleanupOldFiles();

      // Criar novo stream
      this.writeStream = createWriteStream(this.config.filePath, {
        flags: "w",
        encoding: this.config.writing?.encoding || "utf8",
      });

      this.currentFileSize = 0;
    } catch (error) {
      console.error("Failed to rotate log file:", error);
    }
  }

  /**
   * Gera nome do arquivo rotacionado
   */
  private generateRotatedName(): string {
    const dir = dirname(this.config.filePath);
    const name = basename(this.config.filePath, extname(this.config.filePath));
    const ext = extname(this.config.filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const pattern = this.config.rotation?.pattern || "{name}-{timestamp}.{ext}";
    const fileName = pattern
      .replace("{name}", name)
      .replace("{timestamp}", timestamp)
      .replace("{ext}", ext.slice(1));

    return join(dir, fileName);
  }

  /**
   * Comprime arquivo rotacionado
   */
  private async compressFile(filePath: string): Promise<void> {
    // Implementação simplificada - em produção usar zlib
    console.log(`Compressing file: ${filePath}`);
  }

  /**
   * Limpa arquivos antigos
   */
  private async cleanupOldFiles(): Promise<void> {
    const maxFiles = this.config.rotation?.maxFiles || 5;
    const dir = dirname(this.config.filePath);
    const name = basename(this.config.filePath, extname(this.config.filePath));

    try {
      const files = await fs.readdir(dir);
      const logFiles = files
        .filter(
          (file) =>
            file.startsWith(name) && file !== basename(this.config.filePath),
        )
        .sort()
        .reverse(); // Mais novos primeiro

      if (logFiles.length > maxFiles) {
        const filesToDelete = logFiles.slice(maxFiles);
        await Promise.all(
          filesToDelete.map((file) => fs.unlink(join(dir, file))),
        );
      }
    } catch (error) {
      console.error("Failed to cleanup old files:", error);
    }
  }

  /**
   * Escreve no buffer
   */
  private writeToBuffer(logLine: string): void {
    this.writeBuffer.push(logLine);
    this.stats.bufferSize = this.writeBuffer.length;

    // Flush automático quando buffer atinge limite
    const bufferSize = this.config.performance?.bufferSize || 1000;
    if (this.writeBuffer.length >= bufferSize) {
      this.flushBuffer();
    }

    // Flush automático por timeout
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }

    const timeout = this.config.performance?.flushTimeout || 5000;
    this.flushTimeout = setTimeout(() => this.flushBuffer(), timeout);
  }

  /**
   * Flush do buffer
   */
  private async flushBuffer(): Promise<void> {
    if (this.writeBuffer.length === 0) return;

    const lines = this.writeBuffer.splice(0);
    this.stats.bufferSize = 0;

    for (const line of lines) {
      await this.writeToFile(line);
    }
  }

  /**
   * Escreve diretamente no arquivo
   */
  private async writeToFile(logLine: string): Promise<void> {
    if (!this.writeStream) return;

    return new Promise<void>((resolve, reject) => {
      this.writeStream!.write(logLine, (error) => {
        if (error) {
          reject(error);
        } else {
          this.currentFileSize += Buffer.byteLength(logLine);
          resolve();
        }
      });
    });
  }

  /**
   * Sincroniza arquivo
   */
  private syncFile(): void {
    if (this.writeStream && 'sync' in this.writeStream) {
      (this.writeStream as any).sync();
    }
  }

  /**
   * Atualiza tempo médio de escrita
   */
  private updateAverageWriteTime(writeTime: number): void {
    this.writeTimes.push(writeTime);

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

    // Flush buffer final
    await this.flushBuffer();

    // Fechar stream
    if (this.writeStream) {
      await new Promise<void>((resolve) => {
        this.writeStream!.end(() => resolve());
      });
    }

    // Limpar timeout
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
    }
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
      bufferSize: this.writeBuffer.length,
    };
    this.writeTimes = [];
  }
}
