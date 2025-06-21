import { z } from "zod";

const personaGoalSchema = z.string();
export class PersonaGoal {
  constructor(private readonly goal: string) {
    personaGoalSchema.parse(goal);
  }
  get value() {
    return this.goal;
  }
}
