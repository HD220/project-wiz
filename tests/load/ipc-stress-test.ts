import { check, group, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';
import { htmlReport } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { PerformanceMonitor } from '../../src/infrastructure/monitoring/perf-monitor';
import { mockLogger } from './mocks/logger.mock';

const perfMonitor = PerformanceMonitor.getInstance(mockLogger);

// Metrics
const ipcLatency = new Trend('ipc_latency');
const errorRate = new Rate('errors');
const successRate = new Rate('successes');
const messageCounter = new Counter('messages_sent');

// Configuration
const VUS = 1500;
const DURATION = '10m';
const CHANNELS = [
  'chat:send',
  'agent:execute',
  'llm:query',
  'task:update',
  'project:sync'
];

export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 50,
      stages: [
        { duration: '2m', target: 500 },
        { duration: '5m', target: 1500 },
        { duration: '3m', target: 50 },
      ],
    },
  },
  thresholds: {
    ipc_latency: ['p(95)<200'],
    errors: ['rate<0.05'],
    successes: ['rate>0.95'],
  },
};

export default function () {
  group('IPC Stress Test', () => {
    const channel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
    const payload = {
      timestamp: Date.now(),
      data: `Test payload for ${channel}`
    };

    perfMonitor.trackAgentPerformance('ipc-stress', {
      name: 'ipc-message-start',
      value: 1,
      unit: 'count'
    });

    try {
      const start = Date.now();
      
      // Simulate IPC call
      const latency = Math.random() * 300;
      sleep(latency / 1000);

      const success = check(null, {
        'IPC call succeeded': () => latency < 250,
        'IPC call fast enough': () => latency < 200
      });

      ipcLatency.add(latency);
      messageCounter.add(1);
      if (success) {
        successRate.add(1);
      } else {
        errorRate.add(1);
      }

      perfMonitor.trackAgentPerformance('ipc-stress', {
        name: 'ipc-message-end',
        value: latency,
        unit: 'ms'
      });
    } catch (error) {
      errorRate.add(1);
      console.error('IPC stress test error:', error);
    }
  });
}

export function handleSummary(data: unknown) {
  return {
    'reports/ipc-stress-test.html': htmlReport(data),
  };
}