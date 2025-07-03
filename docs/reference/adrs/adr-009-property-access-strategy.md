# ADR-009: Property Access Strategy for Domain Objects

**Date:** 2025-07-02
**Status:** Accepted

## Context

The current codebase, particularly within the `src_refactored/core/domain` layer, adheres to Object Calisthenics Rule 9: "No Getters/Setters/Properties." This rule promotes encapsulating behavior within objects, encouraging a "Tell, Don't Ask" philosophy. Consequently, accessing the value of a Value Object (VO) or an Entity's property often requires calling a method (e.g., `myVo.value()`, `myEntity.propertyName()`).

While this approach strictly enforces behavioral encapsulation, it can lead to verbosity and a less intuitive API for simple data retrieval, especially when the "property" is merely a wrapped primitive. The user has expressed a desire for a more direct way to access property values, suggesting public `readonly` properties or TypeScript getters/setters, reserving method calls for actions that perform operations or change state.

## Decision

We will modify the interpretation and application of Object Calisthenics Rule 9 ("No Getters/Setters/Properties") for domain objects (Entities and Value Objects) within `src_refactored/core/domain`.

For simple data retrieval from Value Objects and Entity properties that represent data rather than behavior, we will adopt the following:

1.  **Value Objects (VOs):**
    *   Value Objects will expose their encapsulated primitive value through a public `readonly` property named `value`.
    *   Example: Instead of `myUserId.value()`, it will be `myUserId.value`.
    *   The constructor or factory method (`create`) will remain responsible for validating the input and ensuring the VO's invariants.

2.  **Entities:**
    *   Entity properties that are Value Objects will be exposed directly as public `readonly` properties.
    *   Example: Instead of `user.username()`, it will be `user.username`.
    *   For primitive properties directly on an Entity (if any, though discouraged by "Wrap All Primitives"), they can also be public `readonly`.
    *   Methods that represent behavior or state transitions (e.g., `updateProfile`, `changeEmail`) will remain as methods.

### Example Implementation

Here are examples illustrating the proposed property access strategy:

#### Value Object (e.g., `UserEmail`)

```typescript
export class UserEmail extends AbstractValueObject<UserEmailProps> {
  private constructor(props: UserEmailProps) {
    super(props);
  }

  public static create(email: string): UserEmail {
    // ... validation using Zod ...
    return new UserEmail({ value: validatedData });
  }

  public get value(): string {
    return this.props.value;
  }
}
```

#### Identity Value Object (e.g., `UserId`)

```typescript
export class UserId extends Identity {
  private constructor(value: string) {
    super(value);
  }

  public static generate(): UserId {
    return new UserId(randomUUID());
  }

  public static fromString(value: string): UserId {
    return new UserId(value);
  }

  // Inherits 'value' getter from Identity, or can override if needed
  public get value(): string {
    return this.props.value; // Assuming Identity also has a 'props.value'
  }
}
```

#### Entity (e.g., `User`)

```typescript
export class User extends AbstractEntity<UserId, InternalUserProps> {
  private constructor(props: InternalUserProps) {
    super(props);
  }

  public static create(props: UserProps): User {
    // ... validation and creation logic ...
    return new User(internalProps);
  }

  public get nickname(): UserNickname {
    return this.props.nickname;
  }

  public get email(): UserEmail {
    return this.props.email;
  }

  public get defaultLLMProviderConfigId(): Identity {
    return this.props.defaultLLMProviderConfigId;
  }

  // ... other properties and methods ...
}
```

## Consequences

**Pros:**
*   **Improved Readability and Conciseness:** Direct property access (`.value`, `.propertyName`) is more idiomatic in TypeScript/JavaScript for data retrieval, reducing verbosity and improving code clarity, especially when chaining access to nested VOs.
*   **More Intuitive API:** Developers can more easily distinguish between data access (properties) and behavioral invocation (methods).
*   **Reduced Boilerplate:** Eliminates the need for simple getter methods (`value()`, `propertyName()`) on Value Objects and Entities.
*   **Better Alignment with TypeScript Features:** Leverages `readonly` properties for immutability, which is a core TypeScript feature.

**Cons:**
*   **Deviation from Strict Object Calisthenics Rule 9:** This decision explicitly relaxes the "No Getters/Setters/Properties" rule. While it's a pragmatic choice for data access, it's a departure from the strict interpretation.
*   **Potential for Misuse:** Developers might be tempted to expose mutable properties directly, violating encapsulation. This risk will be mitigated by enforcing `readonly` and relying on code reviews.
*   **Refactoring Effort:** Requires significant refactoring across the `src_refactored/core/domain` and `src_refactored/core/application` layers to update all property access patterns.

## Recommendation: Accept

I recommend accepting this ADR. The benefits of improved readability, conciseness, and a more intuitive API for data access outweigh the strict adherence to Object Calisthenics Rule 9 in this specific context. The use of `readonly` will maintain immutability for Value Objects, and behavioral methods will continue to enforce business rules. This change will make the codebase more approachable and maintainable without sacrificing core Clean Architecture principles.

## Implementation Notes:
*   All existing `value()` methods on Value Objects should be replaced with a public `readonly value` property.
*   All existing getter methods on Entities (e.g., `username()`, `email()`) that return Value Objects should be replaced with public `readonly` properties exposing the Value Object directly.
*   The `AGENTS.md` document should be updated to reflect this revised interpretation of Object Calisthenics Rule 9.
