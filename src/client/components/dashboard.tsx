import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LlmMetricsDashboard } from './llm-metrics-dashboard';

const repositoryMetrics = [
  { label: 'Commits', value: 120, progress: 80, icon: '📈' },
  { label: 'Pull Requests', value: 45, progress: 60, icon: '🔀' },
  { label: 'Issues', value: 30, progress: 40, icon: '🐞' },
];

export default function Dashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {repositoryMetrics.map((metric, index) => (
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
