// src_refactored/core/domain/job/value-objects/target-agent-role.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../core/common/value-objects/base.vo';

interface TargetAgentRoleProps extends ValueObjectProps {
  value: string; // e.g., "Developer", "QA_Tester", "CodeReviewer"
}

export class TargetAgentRole extends AbstractValueObject<TargetAgentRoleProps> {
  private static readonly MAX_LENGTH = 50;
  // Example: Allow alphanumeric and underscores, no spaces, to be used as queue names.
  private static readonly VALID_FORMAT_REGEX = /^[a-zA-Z0-9_]+$/;


  private constructor(value: string) {
    super({ value });
  }

  private static validate(role: string): void {
    if (!role || role.trim().length === 0) {
      throw new Error('Target agent role cannot be empty.');
    }
    if (role.length > this.MAX_LENGTH) {
      throw new Error(`Target agent role must be at most ${this.MAX_LENGTH} characters long.`);
    }
    if (!this.VALID_FORMAT_REGEX.test(role)) {
      throw new Error(
        `Target agent role '${role}' has an invalid format. Must be alphanumeric or underscores.`,
      );
    }
  }

  public static create(role: string): TargetAgentRole {
    const trimmedRole = role.trim();
    this.validate(trimmedRole);
    return new TargetAgentRole(trimmedRole);
  }

  public value(): string {
    return this.props.value;
  }

  public toString(): string {
    return this.props.value;
  }
}
