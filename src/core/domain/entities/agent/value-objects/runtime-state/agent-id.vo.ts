import { Identity } from '@/core/common/identity';
import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

// AgentId can reuse the common Identity class, assuming it's a string (e.g., UUID)
export class AgentId extends Identity<string> {
  private constructor(value: string) {
    super(value);
  }

  public static create(id: string): AgentId {
    // Specific validation for AgentId format, if any, could be added here
    // For now, relying on Identity's validation (which includes z.string().uuid())
    try {
      // We don't call identity.parse(id) directly here again,
      // as super(id) in Identity's constructor already does it.
      return new AgentId(id);
    } catch (error) {
      // Catch error from Identity's constructor if needed for custom error message
      if (error instanceof DomainError) { // Assuming Identity throws DomainError for Zod issues
        throw new DomainError(`Invalid AgentId: ${error.message}`, error.stack);
      }
      throw error; // Re-throw other errors
    }
  }
}
