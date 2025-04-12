export interface WorkerMetrics {
  totalTokensProcessed: number;
  totalRequests: number;
  averageResponseTimeMs: number;
  errorCount: number;
  memoryUsageMB: number;
  timestamp: number;
}

export interface LlmMetricsFilters {
  model?: string;
  period?: '1m' | '5m' | '15m' | '1h' | '24h';
  metricType?: 'tokens' | 'requests' | 'latency' | 'errors' | 'memory';
}

export interface ILlmMetricsService {
  getMetrics(filters?: LlmMetricsFilters): Promise<WorkerMetrics>;
}