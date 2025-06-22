// src_refactored/core/domain/job/value-objects/context-parts/tool-name.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../../core/common/value-objects/base.vo';

interface ToolNameProps extends ValueObjectProps {
  value: string; // e.g., "fileSystem.readFile", "terminal.executeCommand"
}

export class ToolName extends AbstractValueObject<ToolNameProps> {
  private static readonly MAX_LENGTH = 100;
  // Expects format like "namespace.action"
  private static readonly VALID_FORMAT_REGEX = /^[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+$/;

  private constructor(value: string) {
    super({ value });
  }

  private static validate(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Tool name cannot be empty.');
    }
    if (name.length > this.MAX_LENGTH) {
      throw new Error(`Tool name must be at most ${this.MAX_LENGTH} characters long.`);
    }
    if (!this.VALID_FORMAT_REGEX.test(name)) {
      throw new Error(
        `Tool name '${name}' has an invalid format. Expected 'namespace.action'.`,
      );
    }
  }

  public static create(name: string): ToolName {
    const trimmedName = name.trim();
    this.validate(trimmedName);
    return new ToolName(trimmedName);
  }

  public value(): string {
    return this.props.value;
  }

  public namespace(): string {
    return this.props.value.split('.')[0];
  }

  public action(): string {
    return this.props.value.split('.')[1];
  }

  public toString(): string {
    return this.props.value;
  }
}
