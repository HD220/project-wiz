import { LLMModelId, LLMModelName, LLMModelSlug } from "./value-objects";

export type LLMModelConstructor = {
  id: LLMModelId;
  name: LLMModelName;
  slug: LLMModelSlug;
};

// TODO: OBJECT_CALISTHENICS_REFACTOR: This class is undergoing refactoring.
// The `getProps()` method is a temporary measure for external consumers.
// Ideally, direct state access will be replaced by more behavior-oriented methods.
export class LLMModel {
  constructor(private readonly fields: LLMModelConstructor) {
    if (!fields.id || !fields.name || !fields.slug) {
      throw new Error("LLMModel ID, Name, and Slug are mandatory.");
    }
  }

  public id(): LLMModelId {
    return this.fields.id;
  }

  public getProps(): Readonly<LLMModelConstructor> {
    return { ...this.fields };
  }

  // Individual getters name, slug removed. id getter replaced by id() method.

  public equals(other?: LLMModel): boolean {
    if (this === other) return true;
    if (!other || !(other instanceof LLMModel)) return false;

    return (
      this.fields.id.equals(other.fields.id) &&
      this.fields.name.equals(other.fields.name) &&
      this.fields.slug.equals(other.fields.slug)
    );
  }
}
