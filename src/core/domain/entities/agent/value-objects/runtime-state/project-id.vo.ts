import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

const projectIdSchema = z.string().uuid({ message: "Project ID must be a valid UUID." });

export class ProjectId {
  private constructor(private readonly _value: string) {}

  public static create(id: string): ProjectId {
    try {
      projectIdSchema.parse(id);
      return new ProjectId(id);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid ProjectId: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: ProjectId): boolean {
    return this._value === other._value;
  }
}
