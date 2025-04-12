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