// src_refactored/core/domain/job/value-objects/context-parts/sender.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../../core/common/value-objects/base.vo';

interface SenderProps extends ValueObjectProps {
  value: string; // e.g., "user", "agent:<agent_id>", "system"
}

export class Sender extends AbstractValueObject<SenderProps> {
  private static readonly MAX_LENGTH = 100;

  private constructor(value: string) {
    super({ value });
  }

  private static validate(sender: string): void {
    if (!sender || sender.trim().length === 0) {
      throw new Error('Sender identifier cannot be empty.');
    }
    if (sender.length > this.MAX_LENGTH) {
      throw new Error(`Sender identifier must be at most ${this.MAX_LENGTH} characters long.`);
    }
    // Could add regex for format, e.g. "user", "system", or "agent:[uuid]"
  }

  public static create(sender: string): Sender {
    const trimmedSender = sender.trim();
    this.validate(trimmedSender);
    return new Sender(trimmedSender);
  }

  public static user(): Sender {
    return new Sender('user');
  }

  public static system(): Sender {
    return new Sender('system');
  }

  public static agent(agentIdValue: string): Sender {
    // Basic validation for agentIdValue if needed, though AgentId VO would handle it
    if (!agentIdValue) throw new Error("Agent ID for sender cannot be empty.");
    return new Sender(`agent:${agentIdValue}`);
  }

  public value(): string {
    return this.props.value;
  }

  public isUser(): boolean {
    return this.props.value === 'user';
  }

  public isSystem(): boolean {
    return this.props.value === 'system';
  }

  public isAgent(): boolean {
    return this.props.value.startsWith('agent:');
  }

  public toString(): string {
    return this.props.value;
  }
}
