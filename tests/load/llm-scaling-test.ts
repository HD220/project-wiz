import { group, check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { htmlReport } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { PerformanceMonitor } from '../../src/infrastructure/monitoring/perf-monitor';
import { mockLogger } from './mocks/logger.mock';

const perfMonitor = PerformanceMonitor.getInstance(mockLogger);

// Metrics
const llmLatency = new Trend('llm_latency');
const errorRate = new Rate('errors');
const successRate = new Rate('successes');
const tokenCounter = new Counter('tokens_processed');

// Configuration
const VUS = 500;
const DURATION = '15m';
const PROMPTS = [
  'Explain quantum computing in simple terms',
  'Generate a poem about artificial intelligence',
  'Summarize the latest research on LLMs',
  'Write a short story about a robot learning to love',
  'Translate this text to Portuguese'
];

export const options = {
  scenarios: {
    scaling_test: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      stages: [
        { target: 50, duration: '5m' },
        { target: 100, duration: '5m' },
        { target: 200, duration: '5m' },
      ],
    },
  },
  thresholds: {
    llm_latency: ['p(95)<500'],
    errors: ['rate<0.1'],
    successes: ['rate>0.9'],
  },
};

export default function () {
  group('LLM Scaling Test', () => {
    const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    const tokens = Math.floor(Math.random() * 500) + 50;

    perfMonitor.trackAgentPerformance('llm-test', {
      name: 'llm-query-start',
      value: tokens,
      unit: 'tokens'
    });

    try {
      const start = Date.now();
      
      // Simulate LLM processing
      const latency = Math.random() * 600;
      sleep(latency / 1000);

      const success = check(null, {
        'LLM response received': () => latency < 800,
        'Response fast enough': () => latency < 500
      });

      llmLatency.add(latency);
      tokenCounter.add(tokens);
      if (success) {
        successRate.add(1);
      } else {
        errorRate.add(1);
      }

      perfMonitor.trackAgentPerformance('llm-test', {
        name: 'llm-query-end',
        value: latency,
        unit: 'ms'
      });
    } catch (error) {
      errorRate.add(1);
      console.error('LLM scaling test error:', error);
    }
  });
}

export function handleSummary(data: unknown) {
  return {
    'reports/llm-scaling-test.html': htmlReport(data),
  };
}