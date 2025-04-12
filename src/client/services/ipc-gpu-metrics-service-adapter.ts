import { GpuMetrics } from '../types/gpu-metrics';

export interface GpuMetricsService {
  getGpuMetrics(): Promise<GpuMetrics[]>;
}

export class IpcGpuMetricsServiceAdapter implements GpuMetricsService {
  async getGpuMetrics(): Promise<GpuMetrics[]> {
    if (
      typeof window === 'undefined' ||
      !window.electron ||
      typeof window.electron.invoke !== 'function'
    ) {
      throw new Error('IPC not available');
    }
    let result: unknown;
    try {
      result = await window.electron.invoke('dashboard:get-gpu-metrics');
    } catch (err) {
      throw new Error('Failed to fetch GPU metrics via IPC');
    }
    // Validação básica do resultado
    if (!Array.isArray(result)) {
      throw new Error('Invalid GPU metrics format');
    }
    // Validação de cada item
    for (const item of result) {
      if (
        typeof item.gpuId !== 'string' ||
        typeof item.utilization !== 'number' ||
        typeof item.memoryUsedMB !== 'number' ||
        typeof item.memoryTotalMB !== 'number' ||
        typeof item.temperatureC !== 'number'
      ) {
        throw new Error('Invalid GPU metrics data');
      }
    }
    return result as GpuMetrics[];
  }
}