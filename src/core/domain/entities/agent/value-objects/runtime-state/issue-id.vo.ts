import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

// Issue IDs can be strings (e.g., from Jira like "PROJ-123") or numbers (e.g., GitHub issue numbers)
const issueIdSchema = z.union([
  z.string().min(1, { message: "String Issue ID cannot be empty." }),
  z.number().int().positive({ message: "Numeric Issue ID must be a positive integer." })
]);

export type IssueIdType = z.infer<typeof issueIdSchema>;

export class IssueId {
  private constructor(private readonly _value: IssueIdType) {}

  public static create(id: string | number): IssueId {
    try {
      issueIdSchema.parse(id);
      return new IssueId(id);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid IssueId: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): IssueIdType {
    return this._value;
  }

  public equals(other: IssueId): boolean {
    return this._value === other._value;
  }
}
