// src/core/domain/agent/value-objects/agent-id.vo.ts
import { Identity } from "../../../../core/common/value-objects/identity.vo";

export class AgentId extends Identity {
  private constructor(value: string) {
    super(value);
  }

  public static generate(): AgentId {
    return new AgentId(super.generate().value);
  }

  public static fromString(value: string): AgentId {
    return new AgentId(value);
  }
}
