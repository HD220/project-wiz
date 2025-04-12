import React from 'react';
import { t } from '@lingui/macro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LlmMetricsDashboard } from './llm-metrics-dashboard';
import { useRepositoryMetrics } from '../hooks/use-repository-metrics';
import StatusMessage from './status-message';

// Metrics list component
function MetricsList({
  metrics,
}: {
  metrics: { label: string; value: number; progress: number; icon: string }[];
}) {
  // Internal MetricCard subcomponent
  function MetricCard({
    label,
    value,
    progress,
    icon,
  }: {
    label: string;
    value: number;
    progress: number;
    icon: string;
  }) {
    return (
      <Card className="w-52">
        <CardHeader>
          <CardTitle>
            <span role="img" aria-label={label}>
              {icon}
            </span>{' '}
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <Progress value={progress} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {metrics.map((metric) => (
        <MetricCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          progress={metric.progress}
          icon={metric.icon}
        />
      ))}
    </>
  );
}

export default function Dashboard() {
  const { metrics, loading, error } = useRepositoryMetrics();

  if (loading) {
    return <StatusMessage type="loading">{t`Loading...`}</StatusMessage>;
  }

  if (error) {
    return <StatusMessage type="error">{error}</StatusMessage>;
  }

  if (!metrics || metrics.length === 0) {
    return <StatusMessage type="empty">{t`No data available`}</StatusMessage>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row gap-4">
        <MetricsList metrics={metrics} />
      </div>
      <LlmMetricsDashboard />
    </div>
  );
}
