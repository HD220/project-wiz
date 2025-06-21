import { randomUUID } from 'node:crypto'; // Or a project-specific UUID generator

export class AgentId {
  private readonly value: string;

  private constructor(id: string) {
    // Basic UUID validation can be added if necessary
    if (!this.isValidUUID(id)) {
      throw new Error('Invalid AgentId format.');
    }
    this.value = id;
  }

  public static create(id?: string): AgentId {
    return new AgentId(id || randomUUID());
  }

  public static fromString(id: string): AgentId {
    return new AgentId(id);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: AgentId): boolean {
    return this.value === other.getValue();
  }

  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(id);
  }
}
