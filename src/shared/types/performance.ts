export interface PerformanceMetric {
  timestamp: number;
  name: string;
  value: number;
  unit: string;
}

export interface IPCLatencyMetric extends PerformanceMetric {
  channel: string;
  direction: 'main-to-renderer' | 'renderer-to-main';
}

export interface MemoryUsageMetric extends PerformanceMetric {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
}

export interface AgentPerformanceProfile {
  agentId: string;
  metrics: PerformanceMetric[];
  lastUpdated: number;
}

export interface PerformanceAlert {
  id: string;
  metricName: string;
  threshold: number;
  currentValue: number;
  severity: 'warning' | 'critical';
  timestamp: number;
}

export const DEFAULT_SAMPLING_INTERVAL = 5000; // 5s
export const MAX_HISTORY_HOURS = 24;