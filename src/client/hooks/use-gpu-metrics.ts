declare global {
  interface Window {
    electron: any;
  }
}

import { useEffect, useState, useRef } from 'react';

export interface GpuMetrics {
  gpuId: string;
  utilization: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  temperatureC: number;
  powerUsageW?: number;
  clockMHz?: number;
  processes?: string[];
}

export function useGpuMetrics(pollInterval = 2000) {
  const [metrics, setMetrics] = useState<GpuMetrics[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const result = await window.electron.ipcRenderer.invoke('dashboard:get-gpu-metrics');
      setMetrics(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    intervalRef.current = setInterval(fetchMetrics, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pollInterval]);

  return { metrics, loading, error, refresh: fetchMetrics };
}