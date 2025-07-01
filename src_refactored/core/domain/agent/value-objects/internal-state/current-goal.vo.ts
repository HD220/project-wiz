// src_refactored/core/domain/agent/value-objects/internal-state/current-goal.vo.ts
import { AbstractValueObject, ValueObjectProps } from '@/core/common/value-objects/base.vo';

interface CurrentGoalProps extends ValueObjectProps {
  value: string;
}

export class CurrentGoal extends AbstractValueObject<CurrentGoalProps> {
  private static readonly MAX_LENGTH = 500;

  private constructor(value: string) {
    super({ value });
  }

  private static validate(goal: string): void {
    // Goal can be empty if not set.
    if (goal && goal.length > this.MAX_LENGTH) {
      throw new Error(`Current goal description must be at most ${this.MAX_LENGTH} characters long.`);
    }
  }

  public static create(goal: string): CurrentGoal {
    this.validate(goal);
    return new CurrentGoal(goal);
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
