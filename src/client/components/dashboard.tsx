import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LlmMetricsDashboard } from './llm-metrics-dashboard';
import { useRepositoryMetrics } from '../hooks/use-repository-metrics';

export default function Dashboard() {
  const { metrics, loading, error } = useRepositoryMetrics();

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {loading && <div>Loading metrics...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && metrics.length === 0 && <div>No data available</div>}
        {!loading &&
          !error &&
          metrics.map((metric: { label: string; value: number; progress: number; icon: string }, index: number) => (
            <Card key={index} style={{ width: 200 }}>
              <CardHeader>
                <CardTitle>
                  {metric.icon} {metric.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{metric.value}</div>
                <Progress value={metric.progress} />
              </CardContent>
            </Card>
          ))}
      </div>

      <div style={{ marginTop: 40 }}>
        <LlmMetricsDashboard />
      </div>
    </div>
  );
}
