import { AgentIdentity, AgentBehavior } from "../value-objects";

export class Agent {
  constructor(identity: AgentIdentity, behavior: AgentBehavior) {
    this.identity = identity;
    this.behavior = behavior;
  }

  private readonly identity: AgentIdentity;
  private readonly behavior: AgentBehavior;

  getIdentity(): AgentIdentity {
    return this.identity;
  }

  getBehavior(): AgentBehavior {
    return this.behavior;
  }

  getName(): string {
    return this.identity.getName().getValue();
  }

  getRole(): string {
    return this.identity.getRole().getValue();
  }

  generateSystemPrompt(): string {
    return this.behavior.getSystemPrompt(this.getName(), this.getRole());
  }

  isValidForExecution(): boolean {
    return true;
  }

  updateIdentity(identity: AgentIdentity): Agent {
    return new Agent(identity, this.behavior);
  }

  updateBehavior(behavior: AgentBehavior): Agent {
    return new Agent(this.identity, behavior);
  }

  equals(other: Agent): boolean {
    return this.identity.equals(other.identity);
  }
}
