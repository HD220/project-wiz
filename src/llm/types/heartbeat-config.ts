export interface HeartbeatConfig {
  /** Intervalo entre verificações em milissegundos (padrão: 5000) */
  intervalMs?: number;
  /** Timeout para resposta em milissegundos (padrão: 3000) */
  timeoutMs?: number;
  /** Número máximo de tentativas antes de reiniciar (padrão: 3) */
  maxRetries?: number;
  /** Nível de log (0 = silencioso, 1 = erros, 2 = warnings, 3 = info, 4 = debug) */
  logLevel?: number;
}

export interface HealthMetrics {
  /** Uso de CPU em porcentagem (0-100) */
  cpuUsage: number;
  /** Uso de memória em MB */
  memoryUsage: number;
  /** Tempo médio de resposta em ms */
  avgResponseTime: number;
  /** Número de falhas desde o início */
  failureCount: number;
  /** Timestamp da última resposta */
  lastResponseAt: number;
}

export type HealthStatus = "healthy" | "degraded" | "unresponsive" | "failed";

export const HEALTH_STATUS_CHANNEL = "worker:health-status" as const;

export interface HeartbeatEvent {
  status: HealthStatus;
  metrics: HealthMetrics;
  timestamp: number;
  message?: string;
}
