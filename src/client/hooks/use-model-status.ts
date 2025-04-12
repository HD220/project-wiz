import { useMemo } from "react";
import { useAvailableModels } from "./use-available-models";
import { useGpuMetrics } from "./use-gpu-metrics";

/**
 * Hook to provide model status information for UI components.
 * Receives modelId as argument.
 * Returns model name, memory usage percent, memory used/total (GB), loading and error state.
 */
export function useModelStatus(modelId: string) {
  // Obter lista de modelos disponíveis
  const { models, loading: loadingModels, error: errorModels } = useAvailableModels();
  // Obter métricas de GPU (assumindo GPU 0)
  const { metrics: gpuMetrics, loading: loadingGpu, error: errorGpu } = useGpuMetrics();

  // Encontrar nome do modelo ativo
  const modelName = useMemo(() => {
    const found = models?.find((m) => m.modelId === modelId);
    return found?.name || modelId || "";
  }, [models, modelId]);

  // Obter métricas de memória da GPU 0
  const memoryUsedMB = gpuMetrics?.[0]?.memoryUsedMB ?? 0;
  const memoryTotalMB = gpuMetrics?.[0]?.memoryTotalMB ?? 0;

  // Calcular porcentagem e formatar valores
  const memoryUsagePercent = memoryTotalMB > 0 ? Math.round((memoryUsedMB / memoryTotalMB) * 100) : 0;
  const memoryUsedGB = (memoryUsedMB / 1024).toFixed(1);
  const memoryTotalGB = (memoryTotalMB / 1024).toFixed(1);

  return {
    modelName,
    memoryUsagePercent,
    memoryUsed: memoryUsedGB,
    memoryTotal: memoryTotalGB,
    loading: loadingModels || loadingGpu,
    error: errorModels || errorGpu,
  };
}