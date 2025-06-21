import { z } from "zod";
import { DomainError } from "@/core/common/errors";

// Corrected schema: a docs path is not necessarily a URL, but should not be empty.
const pathnameSchema = z.string().min(1, { message: "Repository docs path cannot be empty." });

export class RepositoryDocsPath {
  private constructor(private readonly _value: string) {
    // Validation is now in the static create method, which calls this constructor.
    // For consistency with the example pattern, validation can be in constructor.
    pathnameSchema.parse(this._value);
  }

  public static create(path: string): RepositoryDocsPath {
    // Option 1: Validate here, then call new (safer if constructor is public/complex)
    // try {
    //   pathnameSchema.parse(path);
    //   return new RepositoryDocsPath(path);
    // } catch (error) {
    //   if (error instanceof z.ZodError) {
    //     throw new DomainError(`Invalid RepositoryDocsPath: ${error.errors.map(e => e.message).join(', ')}`);
    //   }
    //   throw error;
    // }
    // Option 2: Let constructor handle validation (as per example in prompt for other VOs)
    return new RepositoryDocsPath(path);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other?: RepositoryDocsPath): boolean {
    if (!other || !(other instanceof RepositoryDocsPath)) {
        return false;
    }
    return this._value === other._value;
  }
}
