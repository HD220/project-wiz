import { z } from 'zod';
import { DomainError } from '@/core/common/errors';

export enum ValidEntryRoles {
  USER = "user",
  AGENT = "agent",
  SYSTEM = "system",
  TOOL = "tool",
  LLM_RESPONSE = "llm_response", // Added for LLM responses
}

const entryRoleSchema = z.nativeEnum(ValidEntryRoles, {
  errorMap: (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_enum_value) {
      return { message: `Invalid role. Allowed roles are: ${Object.values(ValidEntryRoles).join(", ")}.` };
    }
    return { message: ctx.defaultError };
  }
});

export type ValidEntryRoleType = z.infer<typeof entryRoleSchema>;

export class EntryRole {
  private constructor(private readonly value: ValidEntryRoleType) {
    // Validation is done by Zod schema during creation in `create` method
  }

  public static create(role: string): EntryRole {
    try {
      const validatedRole = entryRoleSchema.parse(role);
      return new EntryRole(validatedRole);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DomainError(`Invalid EntryRole: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  public getValue(): ValidEntryRoleType {
    return this.value;
  }

  public isUser(): boolean {
    return this.value === ValidEntryRoles.USER;
  }

  public isAgent(): boolean {
    return this.value === ValidEntryRoles.AGENT;
  }

  public isSystem(): boolean {
    return this.value === ValidEntryRoles.SYSTEM;
  }

  public isTool(): boolean {
    return this.value === ValidEntryRoles.TOOL;
  }

  public isLlmResponse(): boolean {
    return this.value === ValidEntryRoles.LLM_RESPONSE;
  }

  public equals(other: EntryRole): boolean {
    return this.value === other.value;
  }
}
