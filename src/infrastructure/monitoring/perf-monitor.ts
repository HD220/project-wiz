import { DEFAULT_SAMPLING_INTERVAL, MAX_HISTORY_HOURS, IPCLatencyMetric, MemoryUsageMetric, PerformanceAlert, PerformanceMetric, AgentPerformanceProfile } from '../../shared/types/performance';
import { ILogger } from '../../core/ports/logger/ilogger.interface';
import { EventEmitter } from 'events';

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metricsHistory: PerformanceMetric[] = [];
  private activeAlerts: PerformanceAlert[] = [];
  private agentProfiles: Map<string, AgentPerformanceProfile> = new Map();
  private emitter: EventEmitter = new EventEmitter();
  private samplingInterval: number = DEFAULT_SAMPLING_INTERVAL;
  private intervalId?: NodeJS.Timeout;

  constructor(private readonly logger: ILogger) {}

  public static getInstance(logger: ILogger): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(logger);
    }
    return PerformanceMonitor.instance;
  }

  public startMonitoring(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.collectSystemMetrics();
      this.checkAlerts();
      this.cleanupOldMetrics();
    }, this.samplingInterval);

    this.logger.info('Performance monitoring started');
  }

  public stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      this.logger.info('Performance monitoring stopped');
    }
  }

  public trackIPCLatency(channel: string, direction: 'main-to-renderer' | 'renderer-to-main', latencyMs: number): void {
    const metric: IPCLatencyMetric = {
      timestamp: Date.now(),
      name: 'ipc-latency',
      value: latencyMs,
      unit: 'ms',
      channel,
      direction
    };

    this.storeMetric(metric);
    this.checkThreshold('ipc-latency', latencyMs, channel);
  }

  private collectSystemMetrics(): void {
    const memoryUsage = process.memoryUsage();
    const metric: MemoryUsageMetric = {
      timestamp: Date.now(),
      name: 'memory-usage',
      value: memoryUsage.heapUsed / 1024 / 1024, // MB
      unit: 'MB',
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external
    };

    this.storeMetric(metric);
    this.checkThreshold('memory-usage', metric.value);
  }

  public trackAgentPerformance(agentId: string, metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now()
    };

    let profile = this.agentProfiles.get(agentId);
    if (!profile) {
      profile = { agentId, metrics: [], lastUpdated: Date.now() };
      this.agentProfiles.set(agentId, profile);
    }

    profile.metrics.push(fullMetric);
    profile.lastUpdated = Date.now();
    this.storeMetric(fullMetric);
  }

  private storeMetric(metric: PerformanceMetric): void {
    this.metricsHistory.push(metric);
    this.emitter.emit('metric', metric);
  }

  private checkAlerts(): void {
    // Limpar alertas resolvidos (última hora)
    const alertCutoff = Date.now() - (60 * 60 * 1000);
    this.activeAlerts = this.activeAlerts.filter(a => a.timestamp >= alertCutoff);
  }

  private checkThreshold(metricName: string, currentValue: number, context?: string): void {
    // Thresholds configuration
    const thresholds: Record<string, number> = {
      'ipc-latency': 100, // ms
      'memory-usage': 500 // MB
    };

    const threshold = thresholds[metricName];
    if (!threshold || currentValue <= threshold) return;

    const severity = currentValue > threshold * 1.5 ? 'critical' : 'warning';
    const alert: PerformanceAlert = {
      id: `${metricName}-${Date.now()}`,
      metricName,
      threshold,
      currentValue,
      severity,
      timestamp: Date.now(),
      ...(context && { context })
    };

    this.activeAlerts.push(alert);
    this.emitter.emit('alert', alert);
    this.logger.warn(`Performance alert: ${metricName} exceeded threshold`, {
      metric: metricName,
      value: currentValue,
      threshold,
      severity
    });
  }

  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - (MAX_HISTORY_HOURS * 60 * 60 * 1000);
    this.metricsHistory = this.metricsHistory.filter(m => m.timestamp >= cutoff);
    
    // Cleanup inactive agents (no updates in last hour)
    const agentCutoff = Date.now() - (60 * 60 * 1000);
    Array.from(this.agentProfiles.entries()).forEach(([id, profile]) => {
      if (profile.lastUpdated < agentCutoff) {
        this.agentProfiles.delete(id);
      }
    });
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metricsHistory];
  }

  public getAlerts(): PerformanceAlert[] {
    return [...this.activeAlerts];
  }

  public getAgentPerformance(agentId: string): AgentPerformanceProfile | undefined {
    return this.agentProfiles.get(agentId);
  }

  public on(event: 'metric' | 'alert', listener: (data: any) => void): void {
    this.emitter.on(event, listener);
  }

  public off(event: 'metric' | 'alert', listener: (data: any) => void): void {
    this.emitter.off(event, listener);
  }
}