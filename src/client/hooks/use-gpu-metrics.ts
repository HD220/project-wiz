import { useState, useCallback } from 'react';
import { GpuMetrics } from '../types/gpu-metrics';
import { GpuMetricsService, IpcGpuMetricsServiceAdapter } from '../services/ipc-gpu-metrics-service-adapter';
import { usePolling } from './use-polling';

export interface UseGpuMetricsResult {
  metrics: GpuMetrics[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useGpuMetrics(
  pollInterval = 2000,
  service: GpuMetricsService = new IpcGpuMetricsServiceAdapter()
): UseGpuMetricsResult {
  const [metrics, setMetrics] = useState<GpuMetrics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const result = await service.getGpuMetrics();
      setMetrics(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  usePolling(fetchMetrics, { interval: pollInterval, immediate: true, enabled: true });

  return { metrics, loading, error, refresh: fetchMetrics };
}