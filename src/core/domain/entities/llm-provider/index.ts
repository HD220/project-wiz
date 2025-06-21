import { LLMModel } from "../llm-model";
import { LLMModelId } from "../llm-model/value-objects";
import {
  LLMProviderId,
  LLMProviderName,
  LLMProviderSlug,
} from "./value-objects";

export type LLMProviderConstructor = {
  id: LLMProviderId;
  name: LLMProviderName;
  slug: LLMProviderSlug;
  models: LLMModel[];
};

// TODO: OBJECT_CALISTHENICS_REFACTOR: This class is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods.
export class LLMProvider {
  constructor(private readonly fields: LLMProviderConstructor) {
    if (!fields.id || !fields.name || !fields.slug || !fields.models) {
      throw new Error("LLMProvider ID, Name, Slug, and Models array are mandatory.");
    }
    // Ensure models array itself is not null/undefined, even if it's empty.
    if (fields.models === null || fields.models === undefined) {
        throw new Error("LLMProvider Models array cannot be null or undefined.");
    }
  }

  public id(): LLMProviderId {
    return this.fields.id;
  }

  public getProps(): Readonly<LLMProviderConstructor> {
    // Return a shallow copy of fields, and a new array for models for immutability
    return { ...this.fields, models: [...this.fields.models] };
  }

  // Individual getters name, slug, models removed. id getter replaced by id() method.

  public equals(other?: LLMProvider): boolean {
    if (this === other) return true;
    if (!other || !(other instanceof LLMProvider)) return false;

    if (
      !this.fields.id.equals(other.fields.id) ||
      !this.fields.name.equals(other.fields.name) ||
      !this.fields.slug.equals(other.fields.slug)
    ) {
      return false;
    }

    if (this.fields.models.length !== other.fields.models.length) {
      return false;
    }

    for (let i = 0; i < this.fields.models.length; i++) {
      if (!this.fields.models[i].equals(other.fields.models[i])) {
        return false;
      }
    }
    return true;
  }

  getModelById(modelId: LLMModelId): LLMModel | undefined {
    // Uses refactored LLMModel.id() method and new .equals() method on LLMModelId
    return this.fields.models.find(model => model.id().equals(modelId));
  }
}
