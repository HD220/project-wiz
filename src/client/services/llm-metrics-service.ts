import { ILlmMetricsService, WorkerMetrics, LlmMetricsFilters } from '../types/llm-metrics-service';

export type GetMetricsProvider = (filters?: LlmMetricsFilters) => Promise<unknown>;

function validateWorkerMetricsData(data: unknown): void {
  if (
    typeof data !== 'object' ||
    data === null ||
    typeof (data as any).totalTokensProcessed !== 'number' ||
    typeof (data as any).totalRequests !== 'number' ||
    typeof (data as any).averageResponseTimeMs !== 'number' ||
    typeof (data as any).errorCount !== 'number' ||
    typeof (data as any).memoryUsageMB !== 'number' ||
    typeof (data as any).timestamp !== 'number'
  ) {
    throw new Error('Invalid metrics data received from API');
  }
}

function toWorkerMetrics(data: unknown): WorkerMetrics {
  return data as WorkerMetrics;
}

function formatGetMetricsError(error: unknown): Error {
  if (error instanceof Error) {
    return new Error(`Failed to fetch LLM metrics: ${error.message}`);
  }
  return new Error('Unknown error fetching LLM metrics');
}

function validateLlmMetricsFilters(filters?: unknown): void {
  if (filters === undefined || filters === null) return;

  if (typeof filters !== 'object') {
    throw new Error('Filters must be an object');
  }

  const allowedPeriods = ['1m', '5m', '15m', '1h', '24h'];
  const allowedMetricTypes = ['tokens', 'requests', 'latency', 'errors', 'memory'];

  const { model, period, metricType } = filters as LlmMetricsFilters;

  if (model !== undefined && (typeof model !== 'string' || model.trim() === '')) {
    throw new Error('Filter "model" must be a non-empty string if provided');
  }

  if (period !== undefined && !allowedPeriods.includes(period)) {
    throw new Error(
      `Filter "period" must be one of: ${allowedPeriods.join(', ')}`
    );
  }

  if (metricType !== undefined && !allowedMetricTypes.includes(metricType)) {
    throw new Error(
      `Filter "metricType" must be one of: ${allowedMetricTypes.join(', ')}`
    );
  }
}

export class LlmMetricsService implements ILlmMetricsService {
  private readonly getMetricsProvider: GetMetricsProvider;

  constructor(getMetricsProvider?: GetMetricsProvider) {
    // Default provider uses the global window.llmMetricsAPI.getMetrics
    this.getMetricsProvider =
      getMetricsProvider ??
      ((filters?: LlmMetricsFilters) =>
        (window as any).llmMetricsAPI.getMetrics(filters));
  }

  async getMetrics(filters?: LlmMetricsFilters): Promise<WorkerMetrics> {
    try {
      validateLlmMetricsFilters(filters);
      const data = await this.getMetricsProvider(filters);
      validateWorkerMetricsData(data);
      return toWorkerMetrics(data);
    } catch (error) {
      throw formatGetMetricsError(error);
    }
  }
}