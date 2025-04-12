import React from 'react';
import { MetricCard } from './metric-card';

export interface Metric {
  label: string;
  value: number;
  progress: number;
  icon: string;
}

export interface MetricsListProps {
  metrics: Metric[];
}

export function MetricsList({ metrics }: MetricsListProps) {
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