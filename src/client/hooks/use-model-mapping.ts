/**
 * Utility for mapping Model[] to AvailableModel[] for model configuration.
 * Follows Clean Architecture: isolates transformation logic from UI.
 */

import { AvailableModel } from "./use-model-configuration";

export interface Model {
  id: number;
  name: string;
  modelId: string;
  size: string;
  status: string;
  lastUsed: string | null;
  description: string;
}

/**
 * Maps an array of Model to AvailableModel[].
 * @param models Array of Model objects.
 * @returns Array of AvailableModel objects.
 */
export function mapModelsToAvailableModels(models: Model[]): AvailableModel[] {
  return models.map((m) => ({
    modelId: m.modelId,
    status: m.status,
  }));
}