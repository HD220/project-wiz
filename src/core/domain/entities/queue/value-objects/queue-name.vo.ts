import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

const queueNameSchema = z.string().min(1, { message: "Queue name cannot be empty." });

export class QueueName {
  private constructor(private readonly _value: string) {
    // Validation handled by Zod in the static create method
  }

  public static create(name: string): QueueName {
    try {
      queueNameSchema.parse(name);
      return new QueueName(name);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid QueueName: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: QueueName): boolean {
    return !!other && this._value === other._value;
  }
}
