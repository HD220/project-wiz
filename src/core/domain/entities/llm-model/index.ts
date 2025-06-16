import { LLMModelId, LLMModelName, LLMModelSlug } from "./value-objects";

export type LLMModelConstructor = {
  id: LLMModelId;
  name: LLMModelName;
  slug: LLMModelSlug;
};
export class LLMModel {
  constructor(private readonly fields: LLMModelConstructor) {}

  get id() {
    return this.fields.id;
  }

  get name() {
    return this.fields.name;
  }

  get slug() {
    return this.fields.slug;
  }
}
