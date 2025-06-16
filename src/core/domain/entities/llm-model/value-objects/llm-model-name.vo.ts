import { z } from "zod";

const llmModelNameSchema = z.string();
export class LLMModelName {
  constructor(private readonly name: string) {
    llmModelNameSchema.parse(name);
  }
  get value() {
    return this.name;
  }
}
