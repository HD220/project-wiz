import { GpuMetrics } from '../value-objects/GpuMetrics';

export interface GpuMetricsProviderPort {
  /**
   * Obtém as métricas atuais de todas as GPUs disponíveis.
   */
  getGpuMetrics(): Promise<GpuMetrics[]>;
}