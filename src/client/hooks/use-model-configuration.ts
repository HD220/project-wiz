import { useState } from "react";

export interface UseModelConfigurationParams {
  initialModelId: string;
  initialTemperature?: number;
  initialMaxTokens?: number;
  initialMemoryLimit?: number;
  initialAutoUpdate?: boolean;
  availableModels: { modelId: string; status: string }[];
}

export interface ModelConfigurationState {
  modelId: string;
  temperature: number;
  maxTokens: number;
  memoryLimit: number;
  autoUpdate: boolean;
  errors: {
    temperature?: string;
    maxTokens?: string;
    memoryLimit?: string;
    modelId?: string;
  };
  setModelId: (id: string) => void;
  setTemperature: (value: number) => void;
  setMaxTokens: (value: number) => void;
  setMemoryLimit: (value: number) => void;
  setAutoUpdate: (value: boolean) => void;
}

export function useModelConfiguration({
  initialModelId,
  initialTemperature = 0.7,
  initialMaxTokens = 2048,
  initialMemoryLimit = 8,
  initialAutoUpdate = true,
  availableModels,
}: UseModelConfigurationParams): ModelConfigurationState {
  const [modelId, setModelId] = useState(initialModelId);
  const [temperature, setTemperature] = useState(initialTemperature);
  const [maxTokens, setMaxTokens] = useState(initialMaxTokens);
  const [memoryLimit, setMemoryLimit] = useState(initialMemoryLimit);
  const [autoUpdate, setAutoUpdate] = useState(initialAutoUpdate);

  // Validation logic
  const errors: ModelConfigurationState["errors"] = {};

  if (!availableModels.some((m) => m.modelId === modelId && m.status === "downloaded")) {
    errors.modelId = "Selected model is not available.";
  }
  if (temperature < 0 || temperature > 1) {
    errors.temperature = "Temperature must be between 0 and 1.";
  }
  if (maxTokens < 256 || maxTokens > 4096) {
    errors.maxTokens = "Max tokens must be between 256 and 4096.";
  }
  if (memoryLimit < 4 || memoryLimit > 16) {
    errors.memoryLimit = "Memory limit must be between 4GB and 16GB.";
  }

  return {
    modelId,
    temperature,
    maxTokens,
    memoryLimit,
    autoUpdate,
    errors,
    setModelId,
    setTemperature,
    setMaxTokens,
    setMemoryLimit,
    setAutoUpdate,
  };
}