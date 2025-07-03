# Learnings and Observations during Refactoring

This document serves as a running log of observations, challenges, and strategies encountered during the refactoring process. It aims to provide context and insights for future reference.

## TypeScript Alias Resolution and Single-File Compilation

- **Problem:** When running `npx tsc --noEmit --pretty <path/to/file.ts>` on individual files, TypeScript often fails to resolve path aliases (e.g., `@/core/common/value-objects/base.vo`). This results in `TS2307: Cannot find module` errors.
- **Observation:** This issue does not necessarily indicate a problem with the code itself or the `tsconfig.json` configuration. The project's `tsconfig.json` is correctly set up to resolve these aliases when the entire project is compiled. The single-file compilation context seems to be the limitation.
- **Strategy:** Continue to run `npx eslint --fix <path/to/file.ts>` and `npx tsc --noEmit --pretty <path/to/file.ts>` for immediate feedback on linting and basic type-checking within the file. However, the definitive type-check will be performed by running `npx tsc --noEmit` from the project root at the end of each major refactoring phase (e.g., after completing all VOs in Phase 1). This full project compilation will correctly resolve all aliases and provide a comprehensive report of type errors across the entire codebase.

## `this.props` Property Access in Value Objects

- **Problem:** After refactoring Value Objects to use `public get value(): PrimitiveType` and extending `AbstractValueObject<T extends ValueObjectProps>`, TypeScript sometimes reports `TS2339: Property 'props' does not exist on type 'MyVO'`.
- **Observation:** This error is often a symptom of the same alias resolution issue mentioned above, or a caching problem with the TypeScript language server in the IDE. The `AbstractValueObject` correctly defines `protected readonly props: Readonly<T>;`, making `this.props` accessible to subclasses.
- **Strategy:** Similar to alias resolution, this error is expected during single-file `tsc` checks. The full project `tsc --noEmit` at the end of the phase is the authoritative source for type correctness.

## Zod Schema and Interface Type Alignment

- **Problem:** Mismatches between Zod schema inference and explicit TypeScript interface definitions can lead to `TS2345: Argument of type 'ZodInferredType' is not assignable to parameter of type 'MyInterface'`. This often happens when Zod's `safeParse` or `parse` output is used to construct an object that is expected to conform to a specific interface, but Zod's inference makes properties optional that are required in the interface (or vice-versa).
- **Observation:** Even when Zod schema properties are defined as required (i.e., without `.optional()`), `z.union` or complex nested structures can sometimes lead to inferred types where properties become optional.
- **Strategy:** The most robust solution is to derive the TypeScript interface directly from the Zod schema using `z.infer<typeof MySchema>`. This ensures perfect type alignment between the Zod schema's output and the TypeScript interface, eliminating potential mismatches. For properties that are truly optional, ensure `.optional()` is explicitly used in the Zod schema. For properties that have default values, use `.default()` in the Zod schema.
