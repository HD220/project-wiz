import { useState, useEffect } from "react";

export type LlmMetricsSnapshot = {
  totalTokensProcessed: number;
  totalRequests: number;
  averageResponseTimeMs: number;
  errorCount: number;
  memoryUsageMB: number;
  timestamp: number;
};

export function useLlmMetricsHistory(llmMetrics: LlmMetricsSnapshot | null) {
  const [history, setHistory] = useState<LlmMetricsSnapshot[]>([]);

  useEffect(() => {
    if (llmMetrics && typeof llmMetrics.timestamp === "number") {
      setHistory((prev) => {
        if (
          prev.length > 0 &&
          prev[prev.length - 1].timestamp === llmMetrics.timestamp
        ) {
          return prev;
        }
        const newHistory = [...prev, llmMetrics];
        return newHistory.length > 50
          ? newHistory.slice(newHistory.length - 50)
          : newHistory;
      });
    }
  }, [llmMetrics]);

  // Calculate chart data with tokensPerSec and formatted time
  const chartData = history.map((snap, idx, arr) => {
    if (idx === 0) {
      return {
        ...snap,
        tokensPerSec: 0,
        time: new Date(snap.timestamp).toLocaleTimeString(),
      };
    }
    const prev = arr[idx - 1];
    const deltaTokens = snap.totalTokensProcessed - prev.totalTokensProcessed;
    const deltaTime = (snap.timestamp - prev.timestamp) / 1000;
    return {
      ...snap,
      tokensPerSec: deltaTime > 0 ? deltaTokens / deltaTime : 0,
      time: new Date(snap.timestamp).toLocaleTimeString(),
    };
  });

  return { history, chartData };
}