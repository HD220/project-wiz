import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface MetricCardProps {
  label: string;
  value: number;
  progress: number;
  icon: string;
}

export function MetricCard({ label, value, progress, icon }: MetricCardProps) {
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