import { ValueObject } from '@/refactored/core/common/value-objects/base.vo';
import { Result, ok, error } from '@/refactored/shared/result';
import { DomainError, ValueError } from '@/refactored/core/common/errors';

interface TargetAgentRoleProps {
  value: string;
}

export class TargetAgentRoleVO extends ValueObject<TargetAgentRoleProps> {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 100; // Arbitrary max length

  get value(): string {
    return this.props.value;
  }

  private constructor(props: TargetAgentRoleProps) {
    super(props);
  }

  public static create(role: string): Result<TargetAgentRoleVO, ValueError> {
    if (role === null || role === undefined || typeof role !== 'string') {
      return error(new ValueError('Target agent role must be a string.'));
    }
    if (role.length < this.MIN_LENGTH) {
      return error(
        new ValueError(
          `Target agent role must be at least ${this.MIN_LENGTH} character long.`,
        ),
      );
    }
    if (role.length > this.MAX_LENGTH) {
      return error(
        new ValueError(
          `Target agent role must be at most ${this.MAX_LENGTH} characters long.`,
        ),
      );
    }
    // Regex for typical role names (alphanumeric, underscores, hyphens)
    if (!/^[a-zA-Z0-9_-]+$/.test(role)) {
        return error(new ValueError('Target agent role contains invalid characters. Only alphanumeric, underscores, and hyphens are allowed.'));
    }

    return ok(new TargetAgentRoleVO({ value: role }));
  }
}

// For convenience if the spec file uses TargetAgentRole directly
export { TargetAgentRoleVO as TargetAgentRole };
