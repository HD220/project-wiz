import { BaseError } from "./base.error";

export class DomainError extends BaseError {
  constructor(message: string, code?: string, context?: Record<string, any>) {
    super(message, "DomainError", {
      code,
      context,
    });
  }

  static invalidBusinessRule(
    rule: string,
    details?: Record<string, any>,
  ): DomainError {
    return new DomainError(
      `Business rule violation: ${rule}`,
      "BUSINESS_RULE_VIOLATION",
      { rule, ...details },
    );
  }

  static invariantViolation(invariant: string, entity?: string): DomainError {
    return new DomainError(
      `Invariant violation in ${entity || "entity"}: ${invariant}`,
      "INVARIANT_VIOLATION",
      { invariant, entity },
    );
  }

  static invalidState(
    currentState: string,
    expectedState: string,
    entity?: string,
  ): DomainError {
    return new DomainError(
      `Invalid state transition in ${entity || "entity"}: from '${currentState}' (expected '${expectedState}')`,
      "INVALID_STATE",
      { currentState, expectedState, entity },
    );
  }
}
