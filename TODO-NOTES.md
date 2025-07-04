# Learnings and Observations during Refactoring

This document serves as a running log of observations, challenges, and strategies encountered during the refactoring process. It aims to provide context and insights for future reference.

## TypeScript Alias Resolution and Single-File Compilation

- **Problem:** When running `npx tsc --noEmit --pretty <path/to/file.ts>` on individual files, TypeScript often fails to resolve path aliases (e.g., `@/core/common/value-objects/base.vo`). This results in `TS2307: Cannot find module` errors.
- **Observation:** This issue does not necessarily indicate a problem with the code itself or the `tsconfig.json` configuration. The project's `tsconfig.json` is correctly set up to resolve these aliases when the entire project is compiled. The single-file compilation context seems to be the limitation.
- **Strategy:** Continue to run `npx eslint --fix <path/to/file.ts>` and `npx tsc --noEmit --pretty <path/to/file.ts>` for immediate feedback on linting and basic type-checking within the file. However, the definitive type-check will be performed by running `npx tsc --noEmit` from the project root at the end of each major refactoring phase (e.g., after completing all VOs in Phase 1).

## `this.props` Property Access in Value Objects and Entities

- **Problem:** After refactoring Value Objects and Entities to use `public get value(): PrimitiveType` and extending `AbstractValueObject<T extends ValueObjectProps>` or `AbstractEntity`, TypeScript sometimes reports `TS2339: Property 'props' does not exist on type 'MyVO'` or `TS2339: Property 'props' does not exist on type 'MyEntity'` when compiling individual files.
- **Observation:** This error is often a symptom of the same alias resolution issue mentioned above, or a caching problem with the TypeScript language server in the IDE. The `AbstractValueObject` and `AbstractEntity` correctly define `protected readonly props: Readonly<T>;`, making `this.props` accessible to subclasses.
- **Strategy:** Similar to alias resolution, this error is expected during single-file `tsc` checks. The full project `tsc --noEmit` at the end of the phase is the authoritative source for type correctness.

## Zod Schema and Interface Type Alignment

- **Problem:** Mismatches between Zod schema inference and explicit TypeScript interface definitions can lead to `TS2345: Argument of type 'ZodInferredType' is not assignable to parameter of type 'MyInterface'`. This often happens when Zod's `safeParse` or `parse` output is used to construct an object that is expected to conform to a specific interface, but Zod's inference makes properties optional that are required in the interface (or vice-versa).
- **Observation:** Even when Zod schema properties are defined as required (i.e., without `.optional()`), `z.union` or complex nested structures can sometimes lead to inferred types where properties become optional.
- **Strategy:** The most robust solution is to derive the TypeScript interface directly from the Zod schema using `z.infer<typeof MySchema>`. This ensures perfect type alignment between the Zod schema's output and the TypeScript interface, eliminating potential mismatches. For properties that are truly optional, ensure `.optional()` is explicitly used in the Zod schema. For properties that have default values, use `.default()` in the Zod schema.

## CoreError Constructor Refactoring

- **Problem:** The original `CoreError` constructor had a flat signature (`message`, `code`, `details`, `cause`), which was inconsistent with how `DomainError` and its subclasses were passing options. This led to `TS2345` errors when trying to pass an `options` object to `super()`.
- **Solution:** Refactored `CoreError` to accept an `options` object (`{ code?: string; details?: unknown; cause?: Error }`) as its second argument. All direct subclasses now call `super(message, options)` or `super(message, { code: '...', details: { ... }, cause })` to ensure consistency and correct type propagation. This resolves the `TS2345` errors related to `CoreError` constructor calls.

## `value()` method vs `value` property

- **Problem:** Initially, Value Objects had a `value()` method to access their underlying value. After refactoring to `get value()` accessors, some parts of the codebase were still calling `value()` as a method.
- **Solution:** Systematically replaced all instances of `.value()` with `.value` in the codebase.

## `Result` Type Removal and Clean Architecture Adherence

- **Problem:** The codebase heavily relied on the `Result` type for error handling, which was being replaced by `IUseCaseResponse` and direct error throwing. My initial approach incorrectly applied `IUseCaseResponse` to repository interfaces, violating Clean Architecture's Dependency Rule (Domain should not depend on Application).
- **Observation:** This was a critical misinterpretation of Clean Architecture. Repository interfaces (Domain Layer) should return domain entities/primitives directly or `void`, and *throw* exceptions (subclasses of `CoreError`) on failure. The `IUseCaseResponse` (Application Layer) is a DTO for the use case boundary, handled by the `UseCaseWrapper` decorator, which catches exceptions thrown by the domain/infrastructure layers and formats them into the standardized response.
- **Solution:**
    1.  **Repository Interfaces (Domain Layer):** Reverted to returning domain entities/primitives directly (`Promise<Entity>`, `Promise<Entity | null>`, `Promise<void>`, `Promise<Entity[]>`).
    2.  **Repository Implementations (Infrastructure Layer):** Updated to match the corrected interfaces, throwing `CoreError` subtypes (e.g., `NotFoundError`) on failure instead of returning `Result` or `IUseCaseResponse`.
    3.  **Use Cases (Application Layer):** Updated to call repository methods expecting direct returns or thrown exceptions. Removed internal `try/catch` blocks for expected domain/infrastructure errors, allowing the `UseCaseWrapper` to handle them. Use cases now focus solely on business logic and throw `ZodError` (for input validation) or `CoreError` subtypes (for business/domain errors).
- **Lesson Learned:** Strict adherence to Clean Architecture's Dependency Rule is paramount. Domain and Application layers must remain independent of outer layers. The `Result` type, while useful in some contexts, was being misused in a way that blurred architectural boundaries. The `UseCaseWrapper` is key to maintaining a clean use case interface while centralizing error handling and response formatting.
- **Post-Refactoring Verification:** After refactoring the main repository interfaces and in-memory implementations, a global search for the deprecated `@/shared/result` import revealed remaining instances in `agent-internal-state.repository.ts`, `source-code.repository.ts`, and `file-system.tool.ts`. This underscores the necessity of a final verification step to ensure the complete removal of old patterns across all parts of the codebase, not just the primary layers that were the focus of the refactoring effort.

## ESLint and TypeScript Compilation Issues

- **Problem:** Frequent ESLint errors (`import/no-unresolved`, `boundaries/element-types`, `no-undef`, `no-inline-comments`, `no-empty-object-type`, `max-lines`, `max-lines-per-function`) and TypeScript compilation errors (`TS2307: Cannot find module`, `TS2339: Property 'props' does not exist`) during refactoring.
- **Observation:** These errors often indicate architectural violations (e.g., `boundaries/element-types` when Application imports from Infrastructure) or inconsistencies in code style/structure. Single-file compilation issues are often misleading; full project compilation is the authoritative check.
- **Strategy:** Address errors systematically, prioritizing architectural violations and critical compilation failures. Use `npx eslint --fix` and `npx tsc --noEmit` regularly. For `max-lines` issues, plan for a dedicated refactoring phase to break down large files/functions into smaller, more cohesive units, adhering to Object Calisthenics principles.

## Learnings from Recent Type-Checking and File Deletion

- **Limitações do Comando `del` no Windows:** Encontrados problemas com o comando `del` devido ao comprimento do caminho e espaços, exigindo a exclusão manual dos arquivos de teste pelo usuário. Isso ressalta a necessidade de estratégias mais robustas de exclusão de arquivos em ambientes multiplataforma, possivelmente usando o módulo `fs` do Node.js ou uma biblioteca como `rimraf`.
- **Rigidez dos Caminhos do TanStack Router:** Repetidamente encontrados erros `TS2820` devido a caminhos relativos em componentes `Link` e na opção `from` de `useParams`. Isso enfatiza a importância de usar consistentemente caminhos absolutos (`/app/`) ao trabalhar com roteamento baseado em arquivos no TanStack Router.
- **Alinhamento de Dados Mock com Interfaces:** Erros `TS2353` frequentes em arquivos de dados mock (`agent-instance.mocks.ts`, `dm.mocks.ts`, `llm-config.mocks.ts`, `persona-template.mocks.ts`, `user.mocks.ts`) devido a discrepâncias entre as estruturas de objetos mock e suas interfaces TypeScript correspondentes. Isso reforça a necessidade de adesão estrita às definições de interface, especialmente ao criar dados mock.
- **Acesso a Propriedades de `JobEntity`:** Erros consistentes relacionados ao acesso a propriedades de `JobEntity` (por exemplo, `getProps()`, `getAttemptsMade()`, `getConversationHistory()`, `getExecutionHistory()`). Isso indica a necessidade de padronizar o acesso a propriedades em `JobEntity` para acesso direto a propriedades (`.id`, `.attemptsMade`, `.conversationHistory`, `.executionHistory`) após garantir que os getters da entidade sejam convertidos em propriedades.
- **Importância da Verificação Final:** A verificação final com `npx tsc --noEmit` foi crucial para identificar erros que não foram capturados durante a verificação de arquivos individuais.
