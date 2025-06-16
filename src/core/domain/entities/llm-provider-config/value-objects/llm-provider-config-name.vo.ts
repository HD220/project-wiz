import { z } from "zod";

const llmProviderConfigNameSchema = z.string();
export class LLMProviderConfigName {
  constructor(private readonly name: string) {
    llmProviderConfigNameSchema.parse(name);
  }
  get value() {
    return this.name;
  }
}
