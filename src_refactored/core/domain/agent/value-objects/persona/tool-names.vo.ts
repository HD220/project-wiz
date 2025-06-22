// src_refactored/core/domain/agent/value-objects/persona/tool-names.vo.ts
import { AbstractValueObject, ValueObjectProps } from '../../../../../core/common/value-objects/base.vo';

interface ToolNamesProps extends ValueObjectProps {
  value: ReadonlyArray<string>; // Ensure the array itself is readonly after creation
}

export class ToolNames extends AbstractValueObject<ToolNamesProps> {
  private constructor(value: string[]) {
    // Freeze the array to make it readonly externally,
    // and store a readonly copy internally.
    super({ value: Object.freeze([...value]) });
  }

  private static validate(toolNames: string[]): void {
    if (!toolNames || toolNames.length === 0) {
      // Allowing empty toolNames for now, as some personas might be purely for conversation
      // or their tools are implicitly defined. In a stricter system, this could be an error.
      // throw new Error('Tool names list cannot be empty for a persona.');
    }
    if (toolNames.some(name => !name || name.trim().length === 0)) {
      throw new Error('Tool names cannot contain empty strings.');
    }
    // Could add validation for tool name format, e.g., "namespace.action"
  }

  public static create(toolNames: string[]): ToolNames {
    // Create a new array from input to avoid modifying the original
    const namesToValidate = [...toolNames];
    this.validate(namesToValidate);
    return new ToolNames(namesToValidate);
  }

  public list(): ReadonlyArray<string> {
    // Return a new array copy to maintain immutability of internal props
    return [...this.props.value];
  }

  public hasTool(toolName: string): boolean {
    return this.props.value.includes(toolName);
  }

  public count(): number {
    return this.props.value.length;
  }

  // For equality, AbstractValueObject's stringify comparison of props.value (the array) will work.
  // If more specific array comparison is needed (e.g., order doesn't matter),
  // this `equals` method would need to be overridden.

  public toString(): string {
    return this.props.value.join(', ');
  }
}
