import { z } from "zod";

const AgentRoleSchema = z
  .string()
  .min(2, "Papel deve ter pelo menos 2 caracteres")
  .max(200, "Papel deve ter no máximo 200 caracteres")
  .trim();

export class AgentRole {
  constructor(role: string) {
    const validated = AgentRoleSchema.parse(role);
    this.value = validated;
  }

  private readonly value: string;

  getValue(): string {
    return this.value;
  }

  equals(other: AgentRole): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
