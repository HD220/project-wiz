import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

// For message content, allowing empty strings might be valid.
// If specific rules are needed (e.g., max length), they can be added here.
const messageContentSchema = z.string();

export class MessageContent {
  private constructor(private readonly value: string) {
    // Validation is handled by Zod in the create method
  }

  public static create(content: string): MessageContent {
    try {
      messageContentSchema.parse(content);
      return new MessageContent(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid MessageContent: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: MessageContent): boolean {
    return this.value === other.value;
  }
}
