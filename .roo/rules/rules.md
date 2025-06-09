# Project Coding Standards

## 1.1. Core Principles

- **Strict Pattern Adherence:** All code MUST follow the existing patterns and standards documented here. Analyze existing files before writing new code.
- **Validation First:** Always validate data before creating objects.
- **No `any` Type:** The `any` type is strictly forbidden. Use specific types or generics.
- **Clean Architecture:** Adhere to the separation of concerns between layers.

## 1.2. Directory Structure

```plaintext
src/
├── core/
│   ├── domain/
│   │   ├── entities/         # One folder per entity
│   │   │   └── value-objects/  # Lives inside entity's folder
│   └── application/
│       ├── use-cases/
│       ├── queries/
│       └── ports/            # Interfaces for infrastructure
├── infrastructure/
│   ├── repositories/
│   └── services/
└── shared/
```

## 1.3. Architectural Layers & Naming Conventions

### Domain Layer (Business Rules)

- **Value Objects (`*.vo.ts`)**
  - **Structure:** MUST only contain a `constructor` and a `get value()` accessor.
  - **Immutability:** MUST be immutable after creation.
  - **Logic:** MUST NOT contain complex business logic.
  - **Example:** `class AgentId extends Identity<string | number> {}`
- **Entities (`*.ts`)**
  - **Structure:** Encapsulate properties in a `private readonly fields` object.
  - **Access:** Expose properties ONLY via getters. Public setters are forbidden.
  - **Validation:** MUST use external Zod schemas (`*.schema.ts`) if the entity file exceeds 100 lines.

### Application Layer (Use Cases)

- **Use Cases (`[action]-[entity].usecase.ts`)**
  - **Interface:** MUST implement the `Executable` interface.
  - **Return Type:** MUST return a `Result<T>` monad.
- **Ports (`*.interface.ts`)**
  - **Naming:** Do NOT use an "I" prefix for interfaces (e.g., `worker.interface.ts`).

### Infrastructure Layer (Implementations)

- **Repositories (`[entity]-[tech].repository.ts`)**
  - **Purpose:** Implement interfaces defined in the application layer's ports.
  - **Example:** `agent-drizzle.repository.ts`

## 1.4. Object Calisthenics (Strictly Enforced)

- [ ] **One Level of Indentation Per Method:** Refactor nested logic into new private methods.
- [ ] **Don't Use the `else` Keyword:** Use guard clauses or polymorphism.
- [ ] **Wrap All Primitives and Strings:** Encapsulate primitives in meaningful domain objects (Value Objects).
- [ ] **First-Class Collections:** Any collection (e.g., `Array`) MUST be wrapped in its own class with domain-specific methods.
- [ ] **One Dot Per Line:** Limit method chaining. Adhere to the Law of Demeter.
- [ ] **Don't Abbreviate:** Use full, descriptive names for variables, methods, and classes.
- [ ] **Keep Entities Small:** Aim for classes under 50 lines and functions under 15 lines.
- [ ] **No More Than Two Instance Variables Per Class:** Use composition if more state is needed.
- [ ] **No Getters/Setters/Properties (for behavior, not state):** Methods should describe what an object *does*, not just expose its internal state. Allow simple getters for Entities as defined above.
- [ ] **No Comments or documentation on code:**: avoid comments in the code, except for explaining very complex things that cannot be explicitly made readable with the previous rules.

## 2. Pre-Change Analysis Checklist

Before implementing any change, you MUST verify the following:

- [ ] Confirmed the project's dependencies and patterns.
- [ ] Analyzed 3+ comparable code examples in the existing codebase.
- [ ] Verified the impact of changes on dependent code.
