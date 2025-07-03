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

## Phase 1: Domain Layer Refactoring (ADR-007 & ADR-009)

**For each Value Object (VO) in `src_refactored/core/domain/**/value-objects/*.ts` (excluding `identity.vo.ts`):**

- [ ] **Implement `get value()` and Zod Validation:**
  - *Action:* Replace `public value(): PrimitiveType` with `public get value(): PrimitiveType`. Ensure `create` static method uses Zod schema and throws `ValueError`. Add explicit `public equals(vo?: MyVO): boolean { return super.equals(vo); }`.
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

- [ ] **Implement Zod Validation for `create`:**
  - *Action:* Define Zod schema for Entity's `Props`. Use `schema.safeParse` in `static create` and throw `EntityError` on failure. Handle `createdAt`/`updatedAt`.
  - *Verification:* Run `npx eslint --fix <path/to/entity.ts>` and `npx tsc --noEmit --pretty <path/to/entity.ts>` to ensure no linting or type errors.
- [ ] **Update Property Access (ADR-009):**
  - *Action:* Replace all getter methods (e.g., `public username(): UserUsername`) with public `get` accessors (e.g., `public get username(): UserUsername`). Update all internal calls from `entity.someVO().value()` to `entity.someVO.value` and `entity.someVO()` to `entity.someVO`.
  - *Verification:* Run `npx eslint --fix <path/to/entity.ts>` and `npx tsc --noEmit --pretty <path/to/entity.ts>` to ensure no linting or type errors.
  - *Order of Refactoring Entities (suggested):*
    - [ ] `user.entity.ts`
    - [ ] `agent.entity.ts`
    - [ ] `annotation.entity.ts`
    - [ ] `job.entity.ts`
    - [ ] `llm-provider-config.entity.ts`
    - [ ] `memory-item.entity.ts`
    - [ ] `project.entity.ts`
    - [ ] `source-code.entity.ts`
    - [ ] `agent-internal-state.entity.ts`

## Phase 2: Application Layer Refactoring (ADR-008 & ADR-009 Impact)

**For each Use Case in `src_refactored/core/application/use-cases/**/*.ts`:**

- [ ] **Standardize Input Validation and Error Handling (ADR-008):**
  - *Action:* Validate input DTO with Zod. Remove manual `try/catch` for `Result` types. Use cases should *throw* `ZodError` or `CoreError` subtypes. `execute` method returns `Promise<IUseCaseResponse<TOutput>>` and returns `successUseCaseResponse(data)` on success.
  - *Verification:* Run `npx eslint --fix <path/to/use-case.ts>` and `npx tsc --noEmit --pretty <path/to/use-case.ts>` to ensure no linting or type errors.
- [ ] **Update Domain Object Access (ADR-009):**
  - *Action:* Replace all calls to domain object getter methods (e.g., `entity.someVO().value()`, `entity.someVO()`) with direct property access (e.g., `entity.someVO.value`, `entity.someVO`).
  - *Verification:* Run `npx eslint --fix <path/to/use-case.ts>` and `npx tsc --noEmit --pretty <path/to/use-case.ts>` to ensure no linting or type errors.
  - *Order of Refactoring Use Cases (suggested):*
    - [ ] `user/create-user.use-case.ts`
    - [ ] `user/get-user.use-case.ts`
    - [ ] `agent/create-agent.use-case.ts`
    - [ ] `agent-persona-template/create-persona-template.use-case.ts`
    - [ ] `annotation/list-annotations.use-case.ts`
    - [ ] `annotation/remove-annotation.use-case.ts`
    - [ ] `annotation/save-annotation.use-case.ts`
    - [ ] `llm-provider-config/create-llm-provider-config.use-case.ts`
    - [ ] `memory/remove-memory-item.use-case.ts`
    - [ ] `memory/save-memory-item.use-case.ts`
    - [ ] `memory/search-memory-items.use-case.ts`
    - [ ] `memory/search-similar-memory-items.use-case.ts`
    - [ ] `project/create-project.use-case.ts`
    - [ ] `project/get-project-details.use-case.ts`
    - [ ] `project/list-projects.use-case.ts`
    - [ ] `agent-internal-state/load-agent-internal-state.use-case.ts`
    - [ ] `agent-internal-state/save-agent-internal-state.use-case.ts`

**For each Service in `src_refactored/core/application/services/*.ts`:**

- [ ] **Update Domain Object Access (ADR-009):**
  - *Action:* Replace all calls to domain object getter methods (e.g., `entity.someVO().value()`, `entity.someVO()`) with direct property access (e.g., `entity.someVO.value`, `entity.someVO`).
  - *Verification:* Run `npx eslint --fix <path/to/service.ts>` and `npx tsc --noEmit --pretty <path/to/service.ts>` to ensure no linting or type errors.
  - *Order of Refactoring Services (suggested):*
    - [ ] `agent-interaction.service.ts`
    - [ ] `agent-state.service.ts`
    - [ ] `agent-tool.service.ts`
    - [ ] `chat.service.ts`
    - [ ] `generic-agent-executor.service.ts`
    - [ ] `tool-validation.service.ts`

**For each Repository in `src_refactored/infrastructure/persistence/**/*.ts`:**

- [ ] **Update Return Types and Domain Object Access:**
  - *Action:* Modify repository methods to return `Promise<IUseCaseResponse<TOutput>>`. Replace `ok(data)` with `successUseCaseResponse(data)`. Replace `err(error)` with `errorUseCaseResponse(error.toUseCaseErrorDetails())` (or manual mapping). Update all calls to domain objects to use `entity.id.value`.
  - *Verification:* Run `npx eslint --fix <path/to/repository.ts>` and `npx tsc --noEmit --pretty <path/to/repository.ts>` to ensure no linting or type errors.

## Phase 3: Global Verification & Cleanup

- [ ] **Update `AGENTS.md`:**
  - *Action:* Modify the "Object Calisthenics" section to reflect the approved ADR-009, specifically updating Rule 9 to allow public `readonly` properties/getters for data access.
  - *Verification:* Manual review.
- [ ] **Remove `Result` Type Usage:**
  - *Action:* Search for any remaining imports or usage of `@/shared/result` (e.g., `Result`, `Ok`, `Err`) and remove them.
  - *Verification:* Run `npx tsc --noEmit` to catch any lingering `Result` type errors.
- [ ] **Final Lint and Type-Check:**
  - *Action:* Run `npx eslint --fix src_refactored/` (full lint) and `npx tsc --noEmit` (full type-check).
  - *Verification:* Ensure zero errors or warnings.

## Learnings and Observations

### TypeScript Alias Resolution and Single-File Compilation

- **Problem:** When running `npx tsc --noEmit --pretty <path/to/file.ts>` on individual files, TypeScript often fails to resolve path aliases (e.g., `@/core/common/value-objects/base.vo`). This results in `TS2307: Cannot find module` errors.
- **Observation:** This issue does not necessarily indicate a problem with the code itself or the `tsconfig.json` configuration. The project's `tsconfig.json` is correctly set up to resolve these aliases when the entire project is compiled. The single-file compilation context seems to be the limitation.
- **Strategy:** Continue to run `npx eslint --fix <path/to/file.ts>` and `npx tsc --noEmit --pretty <path/to/file.ts>` for immediate feedback on linting and basic type-checking within the file. However, the definitive type-check will be performed by running `npx tsc --noEmit` from the project root at the end of each major refactoring phase (e.g., after completing all VOs in Phase 1). This full project compilation will correctly resolve all aliases and provide a comprehensive report of type errors across the entire codebase.

### `this.props` Property Access in Value Objects

- **Problem:** After refactoring Value Objects to use `public get value(): PrimitiveType` and extending `AbstractValueObject<T extends ValueObjectProps>`, TypeScript sometimes reports `TS2339: Property 'props' does not exist on type 'MyVO'`.
- **Observation:** This error is often a symptom of the same alias resolution issue mentioned above, or a caching problem with the TypeScript language server in the IDE. The `AbstractValueObject` correctly defines `protected readonly props: Readonly<T>;`, making `this.props` accessible to subclasses.
- **Strategy:** Similar to alias resolution, this error is expected during single-file `tsc` checks. The full project `tsc --noEmit` at the end of the phase is the authoritative source for type correctness.

### Zod Schema and Interface Type Alignment

- **Problem:** Mismatches between Zod schema inference and explicit TypeScript interface definitions can lead to `TS2345: Argument of type 'ZodInferredType' is not assignable to parameter of type 'MyInterface'`. This often happens when Zod's `safeParse` or `parse` output is used to construct an object that is expected to conform to a specific interface, but Zod's inference makes properties optional that are required in the interface (or vice-versa).
- **Observation:** Even when Zod schema properties are defined as required (i.e., without `.optional()`), `z.union` or complex nested structures can sometimes lead to inferred types where properties become optional.
- **Strategy:** The most robust solution is to derive the TypeScript interface directly from the Zod schema using `z.infer<typeof MySchema>`. This ensures perfect type alignment between the Zod schema's output and the TypeScript interface, eliminating potential mismatches. For properties that are truly optional, ensure `.optional()` is explicitly used in the Zod schema. For properties that have default values, use `.default()` in the Zod schema.