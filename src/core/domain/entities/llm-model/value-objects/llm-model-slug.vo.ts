import { z } from "zod";

const llmModelSlugSchema = z.string();
export class LLMModelSlug {
  constructor(private readonly slug: string) {
    llmModelSlugSchema.parse(slug);
  }
  get value() {
    return this.slug;
  }
}
