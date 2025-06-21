import { Identity } from "@/core/common/identity";
import { z } from "zod";
import { DomainError } from "@/core/common/errors";

// Assuming RepositoryId is a string (e.g., UUID or a unique string identifier for a repo)
const repositoryIdSchema = z.string().min(1, { message: "RepositoryId cannot be empty." });
// If it must be a UUID, use: z.string().uuid({ message: "RepositoryId must be a valid UUID." })
// The base Identity class also validates for UUID if it's a string.

export class RepositoryId extends Identity<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(id: string): RepositoryId {
    try {
      // Specific validation for RepositoryId format if needed,
      // otherwise Identity's validation (which includes z.string().uuid()) is used.
      repositoryIdSchema.parse(id);
      return new RepositoryId(id);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid RepositoryId: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public equals(other?: RepositoryId): boolean {
    if (!other || !(other instanceof RepositoryId)) {
        return false;
    }
    return super.equals(other);
  }
}
