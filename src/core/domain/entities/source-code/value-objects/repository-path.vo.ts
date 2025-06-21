import { z } from "zod";
import { DomainError } from "@/core/common/errors";

// Corrected schema: a repository path is not necessarily a URL. It should not be empty.
const pathnameSchema = z.string().min(1, { message: "Repository path cannot be empty." });

export class RepositoryPath {
  private constructor(private readonly _value: string) {
    // Validation handled by Zod in the static create method or in constructor.
    // Consistent with example: validation in constructor.
    pathnameSchema.parse(this._value);
  }

  public static create(path: string): RepositoryPath {
    return new RepositoryPath(path);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: RepositoryPath): boolean {
    if (!other || !(other instanceof RepositoryPath)) {
        return false;
    }
    return this._value === other._value;
  }
}
