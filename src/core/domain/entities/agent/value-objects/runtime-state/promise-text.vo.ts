import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

const promiseTextSchema = z.string().min(1, { message: "Promise text cannot be empty." });

export class PromiseText {
  private constructor(private readonly _value: string) {}

  public static create(text: string): PromiseText {
    try {
      promiseTextSchema.parse(text);
      return new PromiseText(text);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid PromiseText: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: PromiseText): boolean {
    return this._value === other._value;
  }
}
