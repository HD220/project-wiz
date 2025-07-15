import { z } from "zod";

const AgentNameSchema = z
  .string()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres")
  .trim();

export class AgentName {
  constructor(name: string) {
    const validated = AgentNameSchema.parse(name);
    this.value = validated;
  }

  private readonly value: string;

  getValue(): string {
    return this.value;
  }

  equals(other: AgentName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
