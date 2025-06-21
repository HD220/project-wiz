import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

const entryContentSchema = z.string().min(1, { message: "Entry content cannot be empty." });

export class EntryContent {
  private constructor(private readonly value: string) {
    // Validation is done by Zod schema during creation in `create` method
  }

  public static create(content: string): EntryContent {
    try {
      entryContentSchema.parse(content); // Validate before creating instance
      return new EntryContent(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid EntryContent: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: EntryContent): boolean {
    return this.value === other.value;
  }
}
