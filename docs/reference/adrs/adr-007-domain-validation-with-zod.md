# ADR-007: Domain Layer Validation with Zod

**Date:** 2024-07-24
**Status:** Accepted

## Context

Currently, data validation is primarily handled in two places:
1.  Input DTOs for Use Cases in the Application Layer are validated using Zod schemas.
2.  Value Objects (VOs) in the Domain Layer perform basic validation in their `create` factory methods or constructors, typically throwing `ValueError` for invalid primitive types or simple business rules.
3.  Entities in the Domain Layer rely on VOs for some validation but might have implicit validation logic or expect valid VOs to be passed in.

This leads to:
*   Some business rule validation logic potentially residing in Use Cases instead of the Domain objects themselves.
*   Inconsistent validation mechanisms across VOs and Entities.
*   A less rich domain model, where objects might not fully guarantee their own consistency beyond basic type checks.
*   The `AGENTS.md` and general coding guidelines emphasize Clean Architecture and robust design, but a specific standard for comprehensive domain object self-validation was not explicitly defined.

The ESLint rule `no-restricted-syntax` (or similar custom rules) combined with `boundaries/element-types` aims to enforce architectural layers, and this ADR formalizes how validation fits into this model.

## Decision

We will adopt a standardized approach for domain object self-validation using Zod:

1.  **Value Objects (VOs):**
    *   VOs in `src_refactored/core/domain/**/value-objects/` **must** use Zod schemas within their `create` factory method (or constructor, if applicable) to validate all input parameters against their defined constraints (type, format, range, specific business rules).
    *   Upon validation failure (Zod `safeParse().success === false`), the factory method must throw a `ValueError` (from `@/domain/common/errors`). This `ValueError` should ideally include the `ZodError.flatten().fieldErrors` or a summary as part of its message or context for better diagnostics.
    *   The Zod schema should be co-located or directly defined within the VO's file.

2.  **Entities:**
    *   Entities in `src_refactored/core/domain/**/` (e.g., `annotation.entity.ts`) **must** use Zod schemas within their `create` factory method to validate the initial set of VOs and any primitive properties passed for construction. This ensures the entity is created in a valid initial state.
    *   For methods that change the state of an entity (e.g., `updateText()`, `assignAgent()`), the entity itself is responsible for ensuring the new state remains valid according to its business invariants. If these invariants are complex, Zod schemas can also be used internally within these methods to validate the proposed state or parts of it.
    *   Upon validation failure, entity methods (create or state-changing) must throw an `EntityError` or a more specific `DomainError` (from `@/domain/common/errors`), including details of the validation failure.

3.  **Use Cases (Application Layer):**
    *   Use Cases will continue to use Zod schemas to validate the structure, type, and presence of data in their input DTOs. This is considered input sanitization and request validation.
    *   Use Cases will **rely** on the VOs and Entities to perform their own detailed business rule and invariant validation during their creation or state transitions.
    *   If a call to a VO/Entity factory or method from a Use Case results in a `ValueError`, `EntityError`, or `DomainError` being thrown, the Use Case should catch this error and typically return it as the error part of its `Result` (e.g., `Result.error(domainError)`).

4.  **Zod as a Domain Dependency:**
    *   The Domain Layer (`src_refactored/core/domain/`) is now permitted to have Zod as a direct dependency for validation purposes. The ESLint rule `boundaries/element-types` will be configured to allow imports from `zod` within the domain layer.

## Consequences

**Pros:**
*   **Richer Domain Model:** Domain objects become fully responsible for their own consistency, leading to a more robust and reliable domain layer.
*   **Centralized Validation Logic:** Business rules and invariants are co-located with the domain objects they protect, improving discoverability and maintainability.
*   **Reduced Duplication:** Validation logic is less likely to be duplicated across different Use Cases.
*   **Improved Testability:** Domain objects can be tested in isolation for their validation logic.
*   **Clearer Error Handling:** Consistent use of `ValueError` and `DomainError`/`EntityError` for validation failures from the domain.
*   **Alignment with Clean Architecture:** Reinforces the principle of a smart domain layer.

**Cons:**
*   **Domain Dependency on Zod:** Introduces Zod as a dependency for the Domain layer. While Zod is a validation library and not a framework providing application services, this is a notable change. However, its utility for defining and enforcing complex invariants is deemed beneficial.
*   **Initial Refactoring Effort:** Requires refactoring existing VOs and Entities to adopt this pattern.
*   **Potential for Over-Validation:** Care must be taken not to duplicate input DTO validation (done by Use Cases) within every single VO if the VO is only ever constructed from already validated DTO data. The focus for VOs is their *own* intrinsic rules.

## Alternatives Considered

1.  **Manual Validation in Domain:** Continue with manual checks (if/else, custom error throwing) in VOs/Entities. This was rejected due to inconsistency, verbosity, and lack of a standardized schema definition that Zod provides.
2.  **Validation Service in Domain:** Introduce a separate validation service within the domain. Rejected as it might lead to an anemic domain model, where entities/VOs don't validate themselves.
3.  **Keep All Zod Validation in Application Layer:** Use Cases would be responsible for all detailed validation before creating domain objects. Rejected because it makes the domain less self-sufficient and can lead to domain objects being in an invalid state if a Use Case fails to validate correctly.

This ADR will be reflected in `AGENTS.md` under a new section for "Domain Layer Validation."
