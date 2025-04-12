import { Trans } from "@lingui/macro";

interface ModelStatusProps {
  modelName: string;
  memoryUsagePercent: number;
  memoryUsed: string;
  memoryTotal: string;
  loading?: boolean;
  error?: Error | null;
}

/**
 * Pure presentational component for displaying model status.
 * All data must be provided via props.
 */
export function ModelStatus({
  modelName,
  memoryUsagePercent,
  memoryUsed,
  memoryTotal,
  loading,
  error,
}: ModelStatusProps) {
  if (loading) {
    return (
      <div className="bg-muted p-3 rounded-md">
        <div className="text-sm font-medium">
          <Trans>Loading model status...</Trans>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-muted p-3 rounded-md">
        <div className="text-sm font-medium text-destructive">
          <Trans>Failed to load model status</Trans>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="bg-muted p-3 rounded-md">
      <div className="text-sm font-medium">
        <Trans>Active Model</Trans>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{modelName}</div>
      <div className="mt-2 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <div
          className="bg-primary h-full"
          style={{ width: `${memoryUsagePercent}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>
          <Trans>Memory</Trans>: {memoryUsagePercent}%
        </span>
        <span>
          {memoryUsed}GB / {memoryTotal}GB
        </span>
      </div>
    </div>
  );
}