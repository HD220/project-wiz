import { GpuMetricsProviderPort } from '../../../domain/ports/gpu-metrics-provider.port';
import { GpuMetrics } from '../../../domain/value-objects/GpuMetrics';

export class GpuMetricsProviderElectronAdapter implements GpuMetricsProviderPort {
  async getGpuMetrics(): Promise<GpuMetrics[]> {
    // Mock de duas GPUs com valores aleatórios
    return [
      {
        gpuId: 'GPU-0',
        utilization: Math.floor(Math.random() * 100),
        memoryUsedMB: 4000 + Math.floor(Math.random() * 2000),
        memoryTotalMB: 8192,
        temperatureC: 50 + Math.floor(Math.random() * 30),
        powerUsageW: 100 + Math.floor(Math.random() * 50),
        clockMHz: 1500 + Math.floor(Math.random() * 200),
        processes: ['ProcessoA', 'ProcessoB']
      },
      {
        gpuId: 'GPU-1',
        utilization: Math.floor(Math.random() * 100),
        memoryUsedMB: 2000 + Math.floor(Math.random() * 1000),
        memoryTotalMB: 4096,
        temperatureC: 40 + Math.floor(Math.random() * 20),
        powerUsageW: 80 + Math.floor(Math.random() * 30),
        clockMHz: 1200 + Math.floor(Math.random() * 150),
        processes: ['ProcessoC']
      }
    ];
  }
}