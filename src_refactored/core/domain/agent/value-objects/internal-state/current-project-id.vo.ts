// src_refactored/core/domain/agent/value-objects/internal-state/current-project-id.vo.ts
import { Identity } from '../../../../../core/common/value-objects/identity.vo';

// This represents the ID of the project the agent is currently focused on,
// stored within its internal state. It might or might not directly map to
// a full ProjectId entity depending on how loosely coupled this state is.
export class CurrentProjectId extends Identity {
  private constructor(value: string) {
    super(value);
  }

  public static fromString(value: string): CurrentProjectId {
    // Validation is handled by the parent Identity class constructor
    return new CurrentProjectId(value);
  }

  public get value(): string {
    return this.props.value;
  }
  // No generate() here, it's set based on an existing project.
}
