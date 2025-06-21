import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

const senderSchema = z.string().min(1, { message: "Sender cannot be empty." });

export class Sender {
  private constructor(private readonly value: string) {}

  public static create(name: string): Sender {
    try {
      senderSchema.parse(name);
      return new Sender(name);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid Sender: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Sender): boolean {
    return this.value === other.value;
  }
}
