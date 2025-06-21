import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

const goalToPlanSchema = z.string().min(1, { message: "Goal to plan cannot be empty." });

export class GoalToPlan {
  private constructor(private readonly value: string) {}

  public static create(goal: string): GoalToPlan {
    try {
      goalToPlanSchema.parse(goal);
      return new GoalToPlan(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid GoalToPlan: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: GoalToPlan): boolean {
    return this.value === other.value;
  }
}
