import { z } from "zod";

const llmProviderNameSchema = z.string();
export class LLMProviderName {
  constructor(private readonly name: string) {
    llmProviderNameSchema.parse(name);
  }
  get value() {
    return this.name;
  }
}
