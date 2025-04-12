import { useState, useCallback } from "react";

/**
 * Interface for available model option.
 */
export interface AvailableModel {
  modelId: string;
  status: string;
}

/**
 * Centralized validation keys for model configuration fields.
 */
export type ModelConfigurationField =
  | "modelId"
  | "temperature"
  | "maxTokens"
  | "memoryLimit";

/**
 * Error messages for model configuration fields.
 */
export type ModelConfigurationErrors = Partial<Record<ModelConfigurationField, string>>;

/**
 * Validation helper for model configuration fields.
 * Returns error keys for i18n and boolean validity.
 */
export function validateModelConfigurationField(
  field: ModelConfigurationField,
  value: unknown,
  context?: { availableModels?: AvailableModel[] }
): { errorKey?: string; isValid: boolean } {
  switch (field) {
    case "modelId":
      if (
        !context?.availableModels ||
        !context.availableModels.some(
          (m) => m.modelId === value && m.status === "downloaded"
        )
      ) {
        return { errorKey: "validation.modelId.notAvailable", isValid: false };
      }
      return { isValid: true };
    case "temperature":
      if (typeof value !== "number" || value < 0 || value > 1) {
        return { errorKey: "validation.temperature.range", isValid: false };
      }
      return { isValid: true };
    case "maxTokens":
      if (typeof value !== "number" || value < 256 || value > 4096) {
        return { errorKey: "validation.maxTokens.range", isValid: false };
      }
      return { isValid: true };
    case "memoryLimit":
      if (typeof value !== "number" || value < 4 || value > 16) {
        return { errorKey: "validation.memoryLimit.range", isValid: false };
      }
      return { isValid: true };
    default:
      return { isValid: true };
  }
}

/**
 * Hook for managing modelId field.
 */
export interface UseModelIdParams {
  initialModelId: string;
  availableModels: AvailableModel[];
}
export interface UseModelIdResult {
  modelId: string;
  setModelId: (id: string) => void;
  errorKey?: string;
}
export function useModelId({
  initialModelId,
  availableModels,
}: UseModelIdParams): UseModelIdResult {
  const [modelId, setModelId] = useState(initialModelId);
  const { errorKey } = validateModelConfigurationField("modelId", modelId, {
    availableModels,
  });
  return { modelId, setModelId, errorKey };
}

/**
 * Hook for managing temperature field.
 */
export interface UseTemperatureParams {
  initialTemperature?: number;
}
export interface UseTemperatureResult {
  temperature: number;
  setTemperature: (value: number) => void;
  errorKey?: string;
}
export function useTemperature({
  initialTemperature = 0.7,
}: UseTemperatureParams = {}): UseTemperatureResult {
  const [temperature, setTemperature] = useState(initialTemperature);
  const { errorKey } = validateModelConfigurationField("temperature", temperature);
  return { temperature, setTemperature, errorKey };
}

/**
 * Hook for managing maxTokens field.
 */
export interface UseMaxTokensParams {
  initialMaxTokens?: number;
}
export interface UseMaxTokensResult {
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  errorKey?: string;
}
export function useMaxTokens({
  initialMaxTokens = 2048,
}: UseMaxTokensParams = {}): UseMaxTokensResult {
  const [maxTokens, setMaxTokens] = useState(initialMaxTokens);
  const { errorKey } = validateModelConfigurationField("maxTokens", maxTokens);
  return { maxTokens, setMaxTokens, errorKey };
}

/**
 * Hook for managing memoryLimit field.
 */
export interface UseMemoryLimitParams {
  initialMemoryLimit?: number;
}
export interface UseMemoryLimitResult {
  memoryLimit: number;
  setMemoryLimit: (value: number) => void;
  errorKey?: string;
}
export function useMemoryLimit({
  initialMemoryLimit = 8,
}: UseMemoryLimitParams = {}): UseMemoryLimitResult {
  const [memoryLimit, setMemoryLimit] = useState(initialMemoryLimit);
  const { errorKey } = validateModelConfigurationField("memoryLimit", memoryLimit);
  return { memoryLimit, setMemoryLimit, errorKey };
}

/**
 * Hook for managing autoUpdate field.
 */
export interface UseAutoUpdateParams {
  initialAutoUpdate?: boolean;
}
export interface UseAutoUpdateResult {
  autoUpdate: boolean;
  setAutoUpdate: (value: boolean) => void;
}
export function useAutoUpdate({
  initialAutoUpdate = true,
}: UseAutoUpdateParams = {}): UseAutoUpdateResult {
  const [autoUpdate, setAutoUpdate] = useState(initialAutoUpdate);
  return { autoUpdate, setAutoUpdate };
}