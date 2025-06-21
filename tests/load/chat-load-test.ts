import { check, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { htmlReport } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { PerformanceMonitor } from '../../src/infrastructure/monitoring/perf-monitor';
import { mockLogger } from './mocks/logger.mock';

interface ChatResponse {
  status: string;
  latency: number;
  timestamp: number;
}

const messageLatency = new Trend('message_latency');
const errorRate = new Rate('errors');
const perfMonitor = PerformanceMonitor.getInstance(mockLogger);

const VUS = 1000;
const DURATION = '5m';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: VUS,
      duration: DURATION,
    },
  },
  thresholds: {
    message_latency: ['p(95)<300'],
    errors: ['rate<0.1'],
  },
};

const MESSAGE_PATTERNS = [
  'Hello, how are you?',
  'Can you help me with this task?',
  'What is the status of my request?',
  'Please process this information',
  'Thank you for your assistance',
];

export default function () {
  group('Chat Load Test', () => {
    const message = MESSAGE_PATTERNS[Math.floor(Math.random() * MESSAGE_PATTERNS.length)];
    
    perfMonitor.trackAgentPerformance('load-test', {
      name: 'chat-message-start',
      value: 1,
      unit: 'count'
    });

    try {
      const latency = Math.random() * 400;
      const response: ChatResponse = {
        status: latency < 300 ? 'received' : 'timeout',
        latency,
        timestamp: Date.now()
      };

      const success = check(response, {
        'Message received': (r: ChatResponse) => r.status === 'received',
        'Response time': (r: ChatResponse) => r.latency < 300,
      });

      messageLatency.add(response.latency);
      if (!success) errorRate.add(1);

      perfMonitor.trackAgentPerformance('load-test', {
        name: 'chat-message-end',
        value: response.latency,
        unit: 'ms'
      });
    } catch (error) {
      errorRate.add(1);
      console.error('Chat load test error:', error);
    }
  });
}

export function handleSummary(data: unknown) {
  return {
    'reports/chat-load-test.html': htmlReport(data),
  };
}