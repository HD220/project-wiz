import React from "react";
import { i18n } from "../../i18n";

type GpuMetric = {
  gpuId: string;
  utilization: number;
  memoryUsedMB: number;
  memoryTotalMB: number;
  temperatureC: number;
  powerUsageW?: number;
  clockMHz?: number;
  processes?: string[];
};

type GpuMetricsPanelProps = {
  metrics: GpuMetric[] | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
};

function alertStyle(condition: boolean): React.CSSProperties {
  return {
    color: condition ? "red" : "inherit",
    fontWeight: condition ? "bold" : "normal",
  };
}

export function GpuMetricsPanel({
  metrics,
  loading,
  error,
  refresh,
}: GpuMetricsPanelProps) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={refresh}>{i18n._("Refresh now")}</button>
      </div>
      {loading && <div>{i18n._("Loading GPU metrics...")}</div>}
      {error && (
        <div>
          {i18n._("Error loading GPU metrics:")} {error.message}
        </div>
      )}
      {!loading && !error && metrics && metrics.length === 0 && (
        <div>{i18n._("No GPUs detected.")}</div>
      )}
      {!loading && !error && metrics && metrics.length > 0 && (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {metrics.map((gpu) => (
            <div
              key={gpu.gpuId}
              style={{
                border: "1px solid #ccc",
                padding: 8,
                borderRadius: 4,
              }}
            >
              <h4>{gpu.gpuId}</h4>
              <p style={alertStyle(gpu.utilization > 90)}>
                {i18n._("Utilization")}: {gpu.utilization}%
              </p>
              <p
                style={alertStyle(
                  gpu.memoryTotalMB > 0 &&
                    gpu.memoryUsedMB / gpu.memoryTotalMB > 0.9
                )}
              >
                {i18n._("Memory")}: {gpu.memoryUsedMB} / {gpu.memoryTotalMB} MB
              </p>
              <p style={alertStyle(gpu.temperatureC > 80)}>
                {i18n._("Temperature")}: {gpu.temperatureC}°C
              </p>
              {gpu.powerUsageW !== undefined && (
                <p>
                  {i18n._("Power")}: {gpu.powerUsageW} W
                </p>
              )}
              {gpu.clockMHz !== undefined && (
                <p>
                  {i18n._("Clock")}: {gpu.clockMHz} MHz
                </p>
              )}
              {gpu.processes && gpu.processes.length > 0 && (
                <p>
                  {i18n._("Processes")}: {gpu.processes.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}