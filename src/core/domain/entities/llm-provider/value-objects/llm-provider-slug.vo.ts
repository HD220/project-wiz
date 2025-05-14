import { z } from "zod";

const llmProviderSlugSchema = z.string();
export class LLMProviderSlug {
  constructor(private readonly slug: string) {
    llmProviderSlugSchema.parse(slug);
  }
  get value() {
    return this.slug;
  }
}
