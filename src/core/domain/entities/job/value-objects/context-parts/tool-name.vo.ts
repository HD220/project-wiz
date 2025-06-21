import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

const toolNameSchema = z.string().min(1, { message: "Tool name cannot be empty." });

export class ToolName {
  private constructor(private readonly value: string) {}

  public static create(name: string): ToolName {
    try {
      toolNameSchema.parse(name);
      return new ToolName(name);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid ToolName: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: ToolName): boolean {
    return this.value === other.value;
  }
}
