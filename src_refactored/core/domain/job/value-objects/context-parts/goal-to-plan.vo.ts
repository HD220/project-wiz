// src_refactored/core/domain/job/value-objects/context-parts/goal-to-plan.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../../core/common/value-objects/base.vo';

interface GoalToPlanProps extends ValueObjectProps {
  value: string;
}

export class GoalToPlan extends AbstractValueObject<GoalToPlanProps> {
  private static readonly MIN_LENGTH = 5;
  private static readonly MAX_LENGTH = 1000; // Can be a reasonably detailed goal

  private constructor(value: string) {
    super({ value });
  }

  private static validate(goal: string): void {
    if (goal.trim().length < this.MIN_LENGTH) {
      throw new Error(`Goal to plan must be at least ${this.MIN_LENGTH} characters long.`);
    }
    if (goal.length > this.MAX_LENGTH) {
      throw new Error(`Goal to plan must be at most ${this.MAX_LENGTH} characters long.`);
    }
  }

  public static create(goal: string): GoalToPlan {
    this.validate(goal);
    return new GoalToPlan(goal.trim());
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
