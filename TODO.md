# Refactoring Plan: Project Wiz Core (`src_refactored/`)

This document outlines the comprehensive plan for refactoring the core of Project Wiz, focusing on adherence to Clean Architecture principles, standardized validation, and consistent property access. Each task includes verification steps to ensure code quality and correctness.

## Phase 0: Foundational Setup & ADR-009 Implementation

- [x] **Verify `CoreError` and `IUseCaseResponse`:** Confirm `src_refactored/shared/errors/core.error.ts` and `src_refactored/shared/application/use-case-response.dto.ts` are correctly implemented as per ADR-008.
  - *Verification:* Manual review (already confirmed).
- [x] **Implement `get value()` in `Identity` Value Object:**
  - *File:* `src_refactored/core/common/value-objects/identity.vo.ts`
  - *Action:* Replace `public value(): string` with `public get value(): string`.
  - *Verification:* Run `npx eslint --fix <path>` and `npx tsc --noEmit --pretty <path>` to ensure no linting or type errors.
- [x] **Update `AbstractValueObject` (if necessary):**
  - *File:* `src_refactored/core/common/value-objects/base.vo.ts`
  - *Action:* Ensure `AbstractValueObject`'s `equals` method is compatible with the new `get value()` pattern. (No changes needed).
  - *Verification:* Run `npx eslint --fix <path>` and `npx tsc --noEmit --pretty <path>` to ensure no linting or type errors.
- [x] **Refactor `CoreError` and its direct subclasses:** Updated `CoreError`, `ValueError`, `EntityError`, `DomainError`, `ApplicationError`, and `NotFoundError` constructors in `src_refactored/shared/errors/core.error.ts` to consistently use the `options` object for `code`, `details`, and `cause`.

## Phase 1: Domain Layer Refactoring (ADR-007 & ADR-009)

**For each Value Object (VO) in `src_refactored/core/domain/**/value-objects/*.ts` (excluding `identity.vo.ts`):**

- [x] **Implement `get value()` and Zod Validation:**
  - *Action:* Replace `public value(): PrimitiveType` with `public public get value(): PrimitiveType`. Ensure `create` static method uses Zod schema and throws `ValueError`. Add explicit `public equals(vo?: MyVO): boolean { return super.equals(vo); }`.
  - *Verification:* Run `npx eslint --fix <path/to/vo.ts>` and `npx tsc --noEmit --pretty <path/to/vo.ts>` to ensure no linting or type errors.
  - *Order of Refactoring VOs (suggested):*
    - [x] `user-avatar.vo.ts`
    - [x] `user-email.vo.ts`
    - [x] `user-nickname.vo.ts`
    - [x] `user-username.vo.ts`
    - [x] `agent-id.vo.ts`
    - [x] `agent-max-iterations.vo.ts`
    - [x] `agent-temperature.vo.ts`
    - [x] `persona-id.vo.ts`
    - [x] `persona-name.vo.ts`
    - [x] `persona-role.vo.ts`
    - [x] `persona-backstory.vo.ts`
    - [x] `persona-goal.vo.ts`
    - [x] `tool-names.vo.ts`
    - [x] `target-agent-role.vo.ts`
    - [x] `annotation-id.vo.ts`
    - [x] `annotation-text.vo.ts`
    - [x] `job-id.vo.ts`
    - [x] `job-options.vo.ts`
    - [x] `activity-history-entry.vo.ts`
    - [x] `activity-history.vo.ts`
    - [x] `llm-api-key.vo.ts`
    - [x] `llm-provider-config-id.vo.ts`
    - [x] `llm-provider-config-name.vo.ts`
    - [x] `llm-provider-id.vo.ts`
    - [x] `memory-item-id.vo.ts`
    - [x] `memory-item-content.vo.ts`
    - [x] `memory-item-embedding.vo.ts`
    - [x] `memory-item-source.vo.ts`
    - [x] `memory-item-tags.vo.ts`
    - [x] `project-id.vo.ts`
    - [x] `project-name.vo.ts`
    - [x] `project-description.vo.ts`
    - [x] `repository-id.vo.ts`
    - [x] `repository-path.vo.ts`
    - [x] `repository-docs-path.vo.ts`

**For each Entity in `src_refactored/core/domain/**/*.entity.ts`:**

- [x] **Implement Zod Validation for `create`:**
  - *Action:* Define Zod schema for Entity's `Props`. Use `schema.safeParse` in `static create` and throw `EntityError` on failure. Handle `createdAt`/`updatedAt`.
  - *Verification:* Run `npx eslint --fix <path/to/entity.ts>` and `npx tsc --noEmit --pretty <path/to/entity.ts>` to ensure no linting or type errors.
- [x] **Update Property Access (ADR-009):**
  - *Action:* Replace all getter methods (e.g., `public username(): UserUsername`) with public `get` accessors (e.g., `public get username(): UserUsername`). Update all internal calls from `entity.someVO().value()` to `entity.someVO.value` and `entity.someVO()` to `entity.someVO`.
  - *Verification:* Run `npx eslint --fix <path/to/entity.ts>` and `npx tsc --noEmit --pretty <path/to/entity.ts>` to ensure no linting or type errors.
  - *Order of Refactoring Entities (suggested):*
    - [x] `user.entity.ts`
    - [x] `agent.entity.ts`
    - [x] `annotation.entity.ts`
    - [x] `job.entity.ts`
    - [x] `llm-provider-config.entity.ts`
    - [x] `memory-item.entity.ts`
    - [x] `project.entity.ts`
    - [x] `source-code.entity.ts`
    - [x] `agent-internal-state.entity.ts`

## Phase 2: Application Layer Refactoring (ADR-008 & ADR-009 Impact)

**For each Use Case in `src_refactored/core/application/use-cases/**/*.ts`:**

- [x] **Standardize Input Validation and Error Handling (ADR-008):**
  - *Action:* Validate input DTO with Zod. Use cases should *throw* `ZodError` or `CoreError` subtypes. `execute` method returns `Promise<IUseCaseResponse<TOutput>>` and returns `successUseCaseResponse(data)` on success.
  - *Verification:* Run `npx eslint --fix <path/to/use-case.ts>` and `npx tsc --noEmit --pretty <path/to/use-case.ts>` to ensure no linting or type errors.
- [x] **Update Domain Object Access (ADR-009):**
  - *Action:* Replace all calls to domain object getter methods (e.g., `entity.someVO().value()`, `entity.someVO()`) with direct property access (e.g., `entity.someVO.value`, `entity.someVO`).
  - *Verification:* Run `npx eslint --fix <path/to/use-case.ts>` and `npx tsc --noEmit --pretty <path/to/use-case.ts>` to ensure no linting or type errors.
  - *Order of Refactoring Use Cases (suggested):*
    - [x] `user/create-user.use-case.ts`
    - [x] `user/get-user.use-case.ts`
    - [x] `agent/create-agent.use-case.ts`
    - [x] `agent-persona-template/create-persona-template.use-case.ts`
    - [x] `annotation/list-annotations.use-case.ts`
    - [x] `annotation/remove-annotation.use-case.ts`
    - [x] `annotation/save-annotation.use-case.ts`
    - [x] `llm-provider-config/create-llm-provider-config.use-case.ts`
    - [x] `memory/remove-memory-item.use-case.ts`
    - [x] `memory/save-memory-item.use-case.ts`
    - [x] `memory/search-memory-items.use-case.ts`
    - [x] `memory/search-similar-memory-items.use-case.ts`
    - [x] `project/create-project.use-case.ts`
    - [x] `project/get-project-details.use-case.ts`
    - [x] `project/list-projects.use-case.ts`
    - [x] `agent-internal-state/load-agent-internal-state.use-case.ts`
    - [x] `agent-internal-state/save-agent-internal-state.use-case.ts`

**For each Service in `src_refactored/core/application/services/*.ts`:**

- [x] **Update Domain Object Access (ADR-009):**
  - *Action:* Replace all calls to domain object getter methods (e.g., `entity.someVO().value()`, `entity.someVO()`) with direct property access (e.g., `entity.someVO.value`, `entity.someVO`).
  - *Verification:* Run `npx eslint --fix <path/to/service.ts>` and `npx tsc --noEmit --pretty <path/to/service.ts>` to ensure no linting or type errors.
  - *Order of Refactoring Services (suggested):*
    - [x] `agent-interaction.service.ts`
    - [x] `agent-state.service.ts`
    - [x] `agent-tool.service.ts`
    - [x] `chat.service.ts`
    - [x] `generic-agent-executor.service.ts`
    - [x] `tool-validation.service.ts`

**For each Repository in `src_refactored/infrastructure/persistence/**/*.ts`:**

- [x] **Update Return Types and Domain Object Access:**
  - *Action:* Modify repository methods to return domain entities/primitives directly (`Promise<Entity>`, `Promise<Entity | null>`, `Promise<void>`, `Promise<Entity[]>`). Repositories should *throw* `CoreError` subtypes (e.g., `NotFoundError`) on failure.
  - *Verification:* Run `npx eslint --fix <path/to/repository.ts>` and `npx tsc --noEmit --pretty <path/to/repository.ts>` to ensure no linting or type errors.

## Phase 3: Global Verification & Cleanup

- [x] **Update `AGENTS.md`:**
  - *Action:* Modify the "Object Calisthenics" section to reflect the approved ADR-009, specifically updating Rule 9 to allow public `readonly` properties/getters for data access.
  - *Verification:* Manual review.
- [ ] **Remove `Result` Type Usage:**
  - *Action:* Systematically replace all instances of `Result`, `ok`, and `error` (from `@/shared/result`) with `IUseCaseResponse`, `successUseCaseResponse`, and `errorUseCaseResponse` (from `@/shared/application/use-case-response.dto.ts`) in all non-test files.
  - *Verification:* Run `npx tsc --noEmit` to catch any lingering `Result` type errors.
- [ ] **Address `no-unused-vars` Warnings:**
    - *Action:* Systematically go through all files reporting `no-unused-vars` warnings and remove the unused imports or variables.
- [ ] **Refactor Large Files/Functions (`max-lines`, `max-lines-per-function`):**
    - *Action:* Identify files and functions exceeding the `max-lines` and `max-lines-per-function` limits. Break them down into smaller, more focused units, adhering to Object Calisthenics principles (especially "Keep All Entities Small" and "Only One Level of Indentation Per Method"). This will likely involve creating new files, helper functions, or extracting components.
    - *Verification:* Re-run linting and type-checking after each significant refactoring.
- [ ] **Final Lint and Type-Check:**
  - *Action:* Run `npx eslint --fix src_refactored/` (full lint) and `npx tsc --noEmit` (full type-check).
  - *Verification:* Ensure zero errors or warnings.
- [ ] **Review and Update Documentation:**
    - *Action:* Review all relevant documentation (`README.md`, `GEMINI.md`, `docs/reference/*.md`) to ensure it accurately reflects the refactored codebase.
    - *Verification:* Manual review.

## Current Progress and Next Steps

### Progress Made:

- All Value Objects in `Phase 1` have been refactored to use `get value()` accessors and Zod validation.
- All Entities in `Phase 1` have been refactored to use `get` accessors and Zod validation.
- The `CoreError` constructor and its direct subclasses (`ValueError`, `EntityError`, `DomainError`, `ApplicationError`, `NotFoundError`) in `src_refactored/shared/errors/core.error.ts` have been refactored to consistently use the `options` object for `code`, `details`, and `cause`.
- All instances of `().value()` have been replaced with `.value` in non-test files within `src_refactored/core/application/services/` and `src_refactored/core/application/use-cases/`.
- All Use Cases in `Phase 2` have been refactored to standardize input validation and error handling (ADR-008) and update domain object access (ADR-009). This includes ensuring they *throw* exceptions for errors, relying on the `UseCaseWrapper` for `IUseCaseResponse` formatting.
- All Services in `Phase 2` have been refactored to update domain object access (ADR-009).
- All Repository *interfaces* have been updated to remove `Result` types and use direct returns (e.g., `Promise<Entity>`, `Promise<void>`).
- All *in-memory repository implementations* (`InMemoryAgentPersonaTemplateRepository`, `InMemoryAgentRepository`, `InMemoryAnnotationRepository`, `InMemoryLLMProviderConfigRepository`, `InMemoryMemoryRepository`, `InMemoryProjectRepository`, `InMemoryUserRepository`) have been updated to match their interfaces, returning direct types and *throwing* `NotFoundError` or other `CoreError` subtypes on failure.
- `AGENTS.md` has been updated to reflect ADR-009.
- Corrected `import/no-unresolved` errors in various use cases and services by updating import paths for `use-case.interface` and `use-case-response.dto`.
- Corrected `no-undef` errors related to `TYPES` by replacing them with imports from `core/application/common/constants`.
- Corrected `Unexpected any` errors in `core.error.ts`, `application.error.ts`, and `use-case-wrapper.ts` by replacing `any` with `unknown` or more specific types.
- Corrected `no-empty-object-type` errors in `activity-history-entry.vo.ts` and `activity-history.vo.ts`.
- Corrected `no-inline-comments` in `job-processing.types.ts`, `ConversationList.tsx`, and `application.error.ts`.

### Remaining Tasks:

1.  **Remove `Result` Type Usage (Final Pass):**
    *   *Action:* Perform a final, comprehensive search for any remaining imports or usage of `@/shared/result` (e.g., `Result`, `Ok`, `Err`) in all non-test files and remove them. This includes `src_refactored/infrastructure/persistence/drizzle/repositories/project.repository.ts` and `src_refactored/infrastructure/adapters/llm/mock-llm.adapter.ts` which were previously marked as pending.
    *   *Verification:* Run `npx tsc --noEmit` to catch any lingering `Result` type errors.

2.  **Address `no-unused-vars` Warnings:**
    *   *Action:* Systematically go through all files reporting `no-unused-vars` warnings and remove the unused imports or variables.

3.  **Refactor Large Files/Functions (`max-lines`, `max-lines-per-function`):**
    *   *Action:* Identify files and functions exceeding the `max-lines` and `max-lines-per-function` limits. Break them down into smaller, more focused units, adhering to Object Calisthenics principles (especially "Keep All Entities Small" and "Only One Level of Indentation Per Method"). This will likely involve creating new files, helper functions, or extracting components.
    *   *Verification:* Re-run linting and type-checking after each significant refactoring.

4.  **Final Lint and Type-Check:**
    *   *Action:* Run `npx eslint --fix src_refactored/` (full lint) and `npx tsc --noEmit` (full type-check).
    *   *Verification:* Ensure zero errors or warnings.

5.  **Review and Update Documentation:**
    *   *Action:* Review all relevant documentation (`README.md`, `GEMINI.md`, `docs/reference/*.md`) to ensure it accurately reflects the refactored codebase.
    *   *Verification:* Manual review.
