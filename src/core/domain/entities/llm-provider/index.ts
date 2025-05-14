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
export class LLMProvider {
  constructor(private readonly fields: LLMProviderConstructor) {}

  get id() {
    return this.fields.id;
  }

  get name() {
    return this.fields.name;
  }

  get models() {
    return this.fields.models;
  }

  get slug() {
    return this.fields.slug;
  }

  getModelById(modelId: LLMModelId) {
    const model = this.fields.models.find(
      (model) => model.id.value === modelId.value
    );
    if (!model) {
      throw new Error("Model not found");
    }
    return model;
  }
}
