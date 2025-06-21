import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

const workerNameSchema = z.string().min(1, { message: "Worker name cannot be empty." });

export class WorkerName {
  private constructor(private readonly _value: string) {
    // Validation handled by Zod in the static create method
  }

  public static create(name: string): WorkerName {
    try {
      workerNameSchema.parse(name);
      return new WorkerName(name);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid WorkerName: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: WorkerName): boolean {
    return !!other && this._value === other._value;
  }
}
