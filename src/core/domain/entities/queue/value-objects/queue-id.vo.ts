import { z } from "zod";
import { Identity } from "../../../../common/identity";

const queueIdSchema = z.string().uuid(); // Keep for reference or specific error messages if needed

export class QueueId extends Identity<string> {
  private constructor(value: string) {
    // Validation `queueIdSchema.parse(value)` is removed here
    // as `super(value)` calls Identity's constructor, which validates
    // against a schema that includes z.string().uuid().
    super(value);
  }

  public static create(value: string): QueueId {
    // If specific error messages from queueIdSchema are desired, parse here first.
    // Otherwise, Identity constructor will validate.
    // For consistency with other VOs that have explicit Zod parse in create:
    try {
      queueIdSchema.parse(value);
      return new QueueId(value);
    } catch (error) {
      // Assuming DomainError is available or handle ZodError appropriately
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid QueueId: ${error.errors.map(e => e.message).join(', ')}`); // Basic error handling
      }
      throw error;
    }
  }

  // Overriding equals to ensure type safety with QueueId,
  // but delegating to super.equals() which compares the underlying values.
  public equals(other?: QueueId): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    // Optional: Check if 'other' is an instance of QueueId if strict type checking is needed beyond Identity's comparison
    // if (!(other instanceof QueueId)) {
    //  return false;
    // }
    return super.equals(other);
  }
}
