import { useEffect, useState } from 'react';

export interface WorkerMetrics {
  totalTokensProcessed: number;
  totalRequests: number;
  averageResponseTimeMs: number;
  errorCount: number;
  memoryUsageMB: number;
  timestamp: number;
}

interface UseLlmMetricsOptions {
  intervalMs?: number;
  filters?: {
    model?: string;
    period?: '1m' | '5m' | '15m' | '1h' | '24h';
    metricType?: 'tokens' | 'requests' | 'latency' | 'errors' | 'memory';
  };
}

export function useLlmMetrics(options?: UseLlmMetricsOptions) {
  const [metrics, setMetrics] = useState<WorkerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    async function fetchMetrics() {
      try {
        const data = await (window as any).llmMetricsAPI.getMetrics();
        if (isMounted) {
          setMetrics(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setLoading(false);
        }
      }
    }

    fetchMetrics();
    intervalId = setInterval(fetchMetrics, options?.intervalMs ?? 2000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [options?.intervalMs, options?.filters]);

  return { metrics, loading, error };
}