import { AgentName } from "./agent-name.vo";
import { AgentRole } from "./agent-role.vo";

export class AgentIdentity {
  constructor(name: AgentName, role: AgentRole) {
    this.name = name;
    this.role = role;
  }

  private readonly name: AgentName;
  private readonly role: AgentRole;

  getName(): AgentName {
    return this.name;
  }

  getRole(): AgentRole {
    return this.role;
  }

  equals(other: AgentIdentity): boolean {
    return this.name.equals(other.name) && this.role.equals(other.role);
  }
}
