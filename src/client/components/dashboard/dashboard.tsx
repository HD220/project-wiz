import React from 'react';
import { t } from '@lingui/macro';
import { LlmMetricsDashboard } from './llm-metrics-dashboard';
import { useRepositoryMetrics } from '../hooks/use-repository-metrics';
import { StatusMessage } from "@/components/ui";
import { MetricsList } from './dashboard/metrics-list';

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
