import { ILlmMetricsService, WorkerMetrics, LlmMetricsFilters } from '../types/llm-metrics-service';

export class LlmMetricsService implements ILlmMetricsService {
  async getMetrics(filters?: LlmMetricsFilters): Promise<WorkerMetrics> {
    try {
      // Chamada à API real (adaptar conforme integração real)
      const data = await (window as any).llmMetricsAPI.getMetrics(filters);

      // Validação básica dos campos esperados
      if (
        typeof data !== 'object' ||
        typeof data.totalTokensProcessed !== 'number' ||
        typeof data.totalRequests !== 'number' ||
        typeof data.averageResponseTimeMs !== 'number' ||
        typeof data.errorCount !== 'number' ||
        typeof data.memoryUsageMB !== 'number' ||
        typeof data.timestamp !== 'number'
      ) {
        throw new Error('Invalid metrics data received from API');
      }

      return data as WorkerMetrics;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Failed to fetch LLM metrics: ${error.message}`
          : 'Unknown error fetching LLM metrics'
      );
    }
  }
}