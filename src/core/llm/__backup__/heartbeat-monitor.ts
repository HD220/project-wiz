import { EventEmitter } from "events";
import {
  HeartbeatConfig,
  HealthMetrics,
  HealthStatus,
  HeartbeatEvent,
} from "./heartbeat-config";

export class HeartbeatMonitor extends EventEmitter {
  private config: Required<HeartbeatConfig>;
  private metrics: HealthMetrics;
  private intervalId?: NodeJS.Timeout;
  private retryCount = 0;
  private lastCheckTime = 0;

  constructor(config: HeartbeatConfig = {}) {
    super();
    this.config = {
      intervalMs: 5000,
      timeoutMs: 3000,
      maxRetries: 3,
      logLevel: 3,
      ...config,
    };

    this.metrics = {
      cpuUsage: 0,
      memoryUsage: 0,
      avgResponseTime: 0,
      failureCount: 0,
      lastResponseAt: 0,
    };
  }

  public startMonitoring(checkHealthFn: () => Promise<boolean>): void {
    if (this.intervalId) {
      this.logWarning("Monitoramento já iniciado");
      return;
    }

    this.logInfo("Iniciando monitoramento de heartbeat");
    this.intervalId = setInterval(async () => {
      try {
        await this.performHealthCheck(checkHealthFn);
      } catch (error) {
        this.handleFailure(error as Error);
      }
    }, this.config.intervalMs);
  }

  public stopMonitoring(): void {
    if (!this.intervalId) return;

    clearInterval(this.intervalId);
    this.intervalId = undefined;
    this.logInfo("Monitoramento de heartbeat parado");
  }

  public getCurrentMetrics(): HealthMetrics {
    return { ...this.metrics };
  }

  private async performHealthCheck(
    checkHealthFn: () => Promise<boolean>
  ): Promise<void> {
    const startTime = Date.now();
    let isHealthy = false;

    try {
      isHealthy = await Promise.race([
        checkHealthFn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), this.config.timeoutMs)
        ),
      ]);

      this.handleSuccess(startTime);
    } catch (error) {
      throw error;
    }
  }

  private handleSuccess(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.metrics.avgResponseTime =
      this.metrics.avgResponseTime * 0.7 + responseTime * 0.3;
    this.metrics.lastResponseAt = Date.now();
    this.retryCount = 0;

    this.updateMetrics();
    this.emitStatusEvent("healthy");
  }

  private handleFailure(error: Error): void {
    this.metrics.failureCount++;
    this.retryCount++;
    this.logError(`Falha no heartbeat: ${error.message}`);

    const status: HealthStatus =
      this.retryCount >= this.config.maxRetries ? "failed" : "degraded";

    this.updateMetrics();
    this.emitStatusEvent(status, error.message);

    if (status === "failed") {
      this.emit("restartRequired");
    }
  }

  private updateMetrics(): void {
    // TODO: Implementar coleta real de métricas de sistema
    this.metrics.cpuUsage = Math.random() * 100;
    this.metrics.memoryUsage = process.memoryUsage().rss / (1024 * 1024);
  }

  private emitStatusEvent(status: HealthStatus, message?: string): void {
    const event: HeartbeatEvent = {
      status,
      metrics: this.getCurrentMetrics(),
      timestamp: Date.now(),
      message,
    };

    this.emit("status", event);
  }

  private logInfo(message: string): void {
    if (this.config.logLevel >= 3) {
      console.log(`[HeartbeatMonitor] INFO: ${message}`);
    }
  }

  private logWarning(message: string): void {
    if (this.config.logLevel >= 2) {
      console.warn(`[HeartbeatMonitor] WARN: ${message}`);
    }
  }

  private logError(message: string): void {
    if (this.config.logLevel >= 1) {
      console.error(`[HeartbeatMonitor] ERROR: ${message}`);
    }
  }
}
