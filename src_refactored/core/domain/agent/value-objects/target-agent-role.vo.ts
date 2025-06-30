// src_refactored/core/domain/agent/value-objects/target-agent-role.vo.ts
import { ValueObject } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

interface TargetAgentRoleProps {
  value: string;
}

export class TargetAgentRoleVO extends ValueObject<TargetAgentRoleProps> {
  private constructor(props: TargetAgentRoleProps) {
    super(props);
  }

  public static create(role: string): TargetAgentRoleVO {
    if (!role || role.trim().length === 0) {
      throw new ValueError('Target agent role cannot be empty.');
    }
    // Add any other validation specific to roles, e.g., regex, enum check
    return new TargetAgentRoleVO({ value: role.trim().toLowerCase() });
  }

  get value(): string {
    return this.props.value;
  }
}
