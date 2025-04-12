import React from "react";
import { i18n } from "../../i18n";

type LlmMetrics = {
  totalTokensProcessed: number;
  totalRequests: number;
  averageResponseTimeMs: number;
  errorCount: number;
  memoryUsageMB: number;
};

type LlmMetricCardsProps = {
  metrics: LlmMetrics | null;
};

type LlmMetricCardProps = {
  title: string;
  value: number;
  alert?: boolean;
};

function alertStyle(alert?: boolean): React.CSSProperties {
  return {
    color: alert ? "red" : "inherit",
    fontWeight: alert ? "bold" : "normal",
  };
}

const LlmMetricCard: React.FC<LlmMetricCardProps> = ({ title, value, alert }) => (
  <div>
    <h4>{title}</h4>
    <p style={alertStyle(alert)}>{value}</p>
  </div>
);

export function LlmMetricCards({ metrics }: LlmMetricCardsProps) {
  if (!metrics) {
    return (
      <div>
        {i18n._("No LLM metrics available.")}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      <LlmMetricCard
        title={i18n._("Total Tokens")}
        value={metrics.totalTokensProcessed}
      />
      <LlmMetricCard
        title={i18n._("Total Requests")}
        value={metrics.totalRequests}
      />
      <LlmMetricCard
        title={i18n._("Average Latency (ms)")}
        value={metrics.averageResponseTimeMs}
        alert={metrics.averageResponseTimeMs > 500}
      />
      <LlmMetricCard
        title={i18n._("Errors")}
        value={metrics.errorCount}
        alert={metrics.errorCount > 5}
      />
      <LlmMetricCard
        title={i18n._("Memory (MB)")}
        value={metrics.memoryUsageMB}
        alert={metrics.memoryUsageMB > 1024}
      />
    </div>
  );
}