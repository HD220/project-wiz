import React from "react";
import { i18n } from "../../i18n";

type LlmMetricsHeaderProps = {
  view: "llm" | "gpu";
  setView: (view: "llm" | "gpu") => void;
  period: "1m" | "5m" | "15m" | "1h" | "24h";
  setPeriod: (period: "1m" | "5m" | "15m" | "1h" | "24h") => void;
  metricType: "tokens" | "requests" | "latency" | "errors" | "memory";
  setMetricType: (
    type: "tokens" | "requests" | "latency" | "errors" | "memory"
  ) => void;
};

export function LlmMetricsHeader({
  view,
  setView,
  period,
  setPeriod,
  metricType,
  setMetricType,
}: LlmMetricsHeaderProps) {
  return (
    <div>
      <h2>{i18n._("Metrics Dashboard")}</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setView("llm")} disabled={view === "llm"}>
          {i18n._("LLM Metrics")}
        </button>
        <button
          onClick={() => setView("gpu")}
          disabled={view === "gpu"}
          style={{ marginLeft: 8 }}
        >
          {i18n._("GPU Metrics")}
        </button>
      </div>
      {view === "llm" && (
        <div style={{ marginBottom: 12 }}>
          <label>{i18n._("Period:")}</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
          >
            <option value="1m">{i18n._("1 minute")}</option>
            <option value="5m">{i18n._("5 minutes")}</option>
            <option value="15m">{i18n._("15 minutes")}</option>
            <option value="1h">{i18n._("1 hour")}</option>
            <option value="24h">{i18n._("24 hours")}</option>
          </select>
          <label style={{ marginLeft: 12 }}>{i18n._("Metric type:")}</label>
          <select
            value={metricType}
            onChange={(e) => setMetricType(e.target.value as any)}
          >
            <option value="tokens">{i18n._("Tokens")}</option>
            <option value="requests">{i18n._("Requests")}</option>
            <option value="latency">{i18n._("Latency")}</option>
            <option value="errors">{i18n._("Errors")}</option>
            <option value="memory">{i18n._("Memory")}</option>
          </select>
        </div>
      )}
      {view === "gpu" && (
        <div style={{ marginBottom: 12 }}>
          {/* GPU-specific controls can be added here if needed */}
        </div>
      )}
    </div>
  );
}