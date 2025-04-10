export interface GpuMetrics {
  gpuId: string;
  utilization: number; // percentual 0-100
  memoryUsedMB: number;
  memoryTotalMB: number;
  temperatureC: number;
  powerUsageW?: number;
  clockMHz?: number;
  processes?: string[];
}