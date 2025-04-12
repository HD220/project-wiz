import { useState, useCallback } from 'react';
import { usePolling } from './use-polling';
import { ILlmMetricsService, WorkerMetrics, LlmMetricsFilters } from '../types/llm-metrics-service';
import { LlmMetricsService } from '../services/llm-metrics-service';

export interface UseLlmMetricsOptions {
  intervalMs?: number;
  filters?: LlmMetricsFilters;
  service?: ILlmMetricsService;
}

export function useLlmMetrics(options?: UseLlmMetricsOptions) {
  const {
    intervalMs = 2000,
    filters,
    service = new LlmMetricsService(),
  } = options || {};

  const [metrics, setMetrics] = useState<WorkerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getMetrics(filters);
      setMetrics(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
    }
  }, [service, filters]);

  usePolling(fetchMetrics, {
    interval: intervalMs,
    immediate: true,
    enabled: true,
  });

  return { metrics, loading, error };
}