import { useEffect, useState } from 'react';
import { t } from '@lingui/macro';
import { ipcRepositoryMetricsServiceAdapter, RepositoryMetric } from '../services/ipc-repository-metrics-service-adapter';

export function useRepositoryMetrics(): { metrics: RepositoryMetric[]; loading: boolean; error: string | null } {
  const [metrics, setMetrics] = useState<RepositoryMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);

        const result = await ipcRepositoryMetricsServiceAdapter.getMetrics();

        if (Array.isArray(result) && result.length > 0) {
          setMetrics(result);
        } else {
          setMetrics([]);
          setError(t`No repository metrics available`);
        }
      } catch (err: any) {
        console.error('Error fetching repository metrics', err);
        setError(t`Failed to load metrics`);
        setMetrics([]);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
}