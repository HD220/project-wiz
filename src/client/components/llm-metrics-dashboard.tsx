import React, { useState } from "react";
import { useLlmMetrics } from "../hooks/use-llm-metrics";
import { useGpuMetrics } from "../hooks/use-gpu-metrics";
import { useLlmMetricsHistory } from "../hooks/use-llm-metrics-history";
import { LlmMetricsHeader } from "./llm-metrics-dashboard/LlmMetricsHeader";
import { LlmMetricCards } from "./llm-metrics-dashboard/LlmMetricCards";
import { LlmMetricsCharts } from "./llm-metrics-dashboard/LlmMetricsCharts";
import { GpuMetricsPanel } from "./llm-metrics-dashboard/GpuMetricsPanel";
import { i18n } from "../i18n";
import { StatusMessage } from "@/components/ui";

export function LlmMetricsDashboard() {
  const [view, setView] = useState<"llm" | "gpu">("llm");
  const [period, setPeriod] = useState<"1m" | "5m" | "15m" | "1h" | "24h">("1m");
  const [metricType, setMetricType] = useState<
    "tokens" | "requests" | "latency" | "errors" | "memory"
  >("tokens");

  const {
    metrics: llmMetrics,
    loading: llmLoading,
    error: llmError,
  } = useLlmMetrics({
    intervalMs: 2000,
    filters: { period, metricType },
  });

  const {
    metrics: gpuMetrics,
    loading: gpuLoading,
    error: gpuError,
    refresh,
  } = useGpuMetrics(2000);

  const { chartData } = useLlmMetricsHistory(llmMetrics);

  return (
    <div style={{ padding: 16 }}>
      <LlmMetricsHeader
        view={view}
        setView={setView}
        period={period}
        setPeriod={setPeriod}
        metricType={metricType}
        setMetricType={setMetricType}
      />

      {view === "llm" && (
        <>
          {llmLoading && (
            <StatusMessage type="loading">
              {i18n._("Loading LLM metrics...")}
            </StatusMessage>
          )}
          {llmError && (
            <StatusMessage type="error">
              {i18n._("Error loading LLM metrics:")} {llmError.message}
            </StatusMessage>
          )}
          {!llmLoading && !llmError && (
            <>
              <LlmMetricCards metrics={llmMetrics} />
              <LlmMetricsCharts chartData={chartData} />
            </>
          )}
        </>
      )}

      {view === "gpu" && (
        <GpuMetricsPanel
          metrics={gpuMetrics}
          loading={gpuLoading}
          error={gpuError}
          refresh={refresh}
        />
      )}
    </div>
  );
}