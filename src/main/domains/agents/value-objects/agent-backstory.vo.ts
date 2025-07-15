import { z } from "zod";

const AgentBackstorySchema = z
  .string()
  .min(10, "Background deve ter pelo menos 10 caracteres")
  .max(2000, "Background deve ter no máximo 2000 caracteres")
  .trim();

export class AgentBackstory {
  constructor(backstory: string) {
    const validated = AgentBackstorySchema.parse(backstory);
    this.value = validated;
  }

  private readonly value: string;

  getValue(): string {
    return this.value;
  }

  equals(other: AgentBackstory): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
