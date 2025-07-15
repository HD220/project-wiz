import { z } from "zod";

const AgentGoalSchema = z
  .string()
  .min(10, "Objetivo deve ter pelo menos 10 caracteres")
  .max(1000, "Objetivo deve ter no máximo 1000 caracteres")
  .trim();

export class AgentGoal {
  constructor(goal: string) {
    const validated = AgentGoalSchema.parse(goal);
    this.value = validated;
  }

  private readonly value: string;

  getValue(): string {
    return this.value;
  }

  equals(other: AgentGoal): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
