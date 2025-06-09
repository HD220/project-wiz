# Project Pattern Compliance System

## Purpose
Provide explicit instructions for LLMs working on this project. Follow ALL rules precisely without deviation. Assume no prior knowledge.

## Core Principles
1. **Pattern Preservation**: Maintain strict adherence to existing standards
2. **Analysis First**: Thoroughly analyze code before any changes
3. **Validation**: Verify changes against 3+ existing examples

## Architectural Layers

### Domain Layer (Business Rules)
**Value Objects**:
- Structure: Constructor + `value()` method only
- Immutable after creation
- Validation in builder (if applicable)
- File naming: `*.vo.ts`
- IDs: Inherit from `Identity<T>`, no generation methods
- **Examples**:
  ```typescript
  // Simple VO
  import { z } from "zod";

  const projectNameSchema = z.string();
  export class ProjectName {
    constructor(private readonly name: string) {
      projectNameSchema.parse(name);
    }
    get value() {
      return this.name;
    }
  }

  // ID
  class AgentId extends Identity<string | number> {}
  ```

**Entities**:
- Encapsulate fields in `fields` object
- Access via getters only (no public setters)
- External Zod validation (`*.schema.ts` files) with file greater 100 lines
- **Example**:
  ```typescript
  type AgentProps = {
    id: AgentId;
    name: AgentName;
  };
  
  class Agent {
    constructor(private readonly fields: AgentProps) {}
    get id() { return this.fields.id; }
    get name() { return this.fields.name; }
  }
  ```

### Application Layer (Use Cases)
**Use Cases**:
- Naming: `[action]-[entity].usecase.ts`
- Implement `Executable` interface
- Return `Result<T>` monad
- **Example**:
  ```typescript
  export class CreateUserUseCase implements Executable<CreateUserUseCaseInput, CreateUserUseCaseOutput> {
    constructor(
      private readonly userRepository: IUserRepository,
      private readonly llmProviderConfigRepository: ILLMProviderConfigRepository
    ) {...}

    async execute(
      data: CreateUserUseCaseInput
    ): Promise<Result<CreateUserUseCaseOutput>> {
      ...
    }
  }
  ```

### Infrastructure Layer (Implementations)
**Repositories**:
- Implement application-layer interfaces
- Naming: `[entity]-[tech].repository.ts` (e.g., `agent-drizzle.repository.ts`)

### Cross-Cutting Concerns
**Error Handling**:
- Consistent `Result<T>` monad usage
- Domain-specific errors extend `DomainError`

**Validation**:
- Validation precedes object creation

## Project Structure
### Directory Hierarchy
```
src/
├── core/                   # Business logic
│   ├── domain/             # Business rules
│   │   ├── entities/       # Domain entities (one folder by entitie)
│   │       └── value-objects/  # Value objects (lives inside of folder of entities)
│   └── application/        # Use cases
│       ├── use-cases/      
│       ├── queries/        
│       └── ports/          # External interfaces
├── infrastructure/         # Implementations
│   ├── frameworks/         # Framework integrations
│   ├── repositories/       # Repository impls
│   └── services/           # External services
└── shared/                 # Shared utilities
```

### Communication Patterns
- Domain → Application: Expose only necessary public methods
- Application → Infrastructure: Access via ports interfaces
- Cross-layer: DTOs for data transfer

### Testing Conventions
- Unit tests: `[name].spec.ts` (same folder), structure: described → context → it
- Integration tests: `[feature].integration.spec.ts` in `tests/integration/`

## Implementation Rules
### File & Naming Conventions
- Interfaces: `[name].interface.ts` (no `I` prefix)
  ```typescript
  // Correct: worker.interface.ts
  interface Worker {
    id: WorkerId;
    start(): Promise<Result<void>>;
  }
  ```
- Entities: PascalCase (`Agent`)
- Value Objects: PascalCase (`AgentId`)
- Use Cases: `[Action][Entity]Usecase` (`CreateAgentUsecase`)
- Repositories: `[entity]-[tech].repository.ts` (`agent-drizzle.repository.ts`)

### Code Standards
- **Typing**: 
  - Strict TypeScript enforcement
  - Zero `any` usage
  - Explicit public method types
  - Generics for reusable components
  - Clean Code
  - Clean Architecture
- **Documentation**:
  - Comment only complex methods

### Object Calisthenics Implementation Method

#### 1. Single Level of Abstraction per Method
- Maintain one abstraction level within methods
- Decompose nested logic into helper methods
- Example transformation:
  ```typescript
  // Before
  processData(data) {
    data.forEach(item => {
      if (item.valid) {
        const processed = transform(item);
        save(processed);
      }
    });
  }

  // After
  processData(data) {
    data.filter(isValid).map(transform).forEach(save);
  }
  ```

#### 2. First-Class Collections
- Wrap collections in dedicated classes
- Encapsulate collection-related behavior
- Implementation:
  ```typescript
  class TaskList {
    private tasks: Task[] = [];

    add(task: Task) {
      this.tasks.push(task);
    }

    findById(id: TaskId): Task | undefined {
      return this.tasks.find(t => t.id.equals(id));
    }

    // Other collection-specific logic
  }
  ```

#### 3. One Dot per Line
- Limit method chaining to single dots
- Avoid deep property access chains
- Correct pattern:
  ```typescript
  // Instead of:
  const name = user.getDepartment().getManager().getName();

  // Use:
  const department = user.getDepartment();
  const manager = department.getManager();
  const name = manager.getName();
  ```

#### 4. Wrap All Primitives
- Replace primitive values with domain objects
- Apply to strings, numbers, booleans
- Implementation:
  ```typescript
  // Before: primitive string
  createUser("john@doe.com");
  
  // After: value object
  class Email {
    constructor(private readonly value: string) {
      // Validation logic
    }
    value() { return this.value; }
  }
  createUser(new Email("john@doe.com"));
  ```

#### 5. No Abbreviations
- Use full, descriptive names
- Avoid contractions and acronyms
- Examples:
  - `CustomerRepository` (not `CustRepo`)
  - `calculateTotalPrice` (not `calcTotPx`)
  - `configurationManager` (not `configMgr`)

#### 6. Small Entities
- Limit class size to 50 lines
- Limit packages to 10 files
- Enforcement approach:
  ```typescript
  class Order {
    // 1. Core properties (max 5 fields)
    // 2. Core behavior methods
    // 3. Delegate to value objects
  }
  ```

#### 7. No Classes with >2 Instance Variables
- Combine related variables into objects
- Example refactoring:
  ```typescript
  // Before
  class Rectangle {
    top: number;
    left: number;
    width: number;
    height: number;
  }

  // After
  class Point { x: number; y: number; }
  class Size { width: number; height: number; }
  
  class Rectangle {
    position: Point;
    dimensions: Size;
  }
  ```

#### 8. No Getters/Setters
- Encapsulate behavior within objects
- Tell, don't ask principle
- Implementation:
  ```typescript
  // Instead of:
  if (account.getBalance() > amount) {
    account.setBalance(account.getBalance() - amount);
  }

  // Use:
  account.withdraw(amount);
  
  class Account {
    private balance: number;
    
    withdraw(amount: number) {
      if (amount > this.balance) throw new Error();
      this.balance -= amount;
    }
  }
  ```

#### 9. Method Chaining Limitation
- Restrict fluent interfaces to builders only
- Standard implementation pattern:
  ```typescript
  // Only allowed for builders:
  const user = new UserBuilder()
    .withName("John")
    .withEmail("john@doe.com")
    .build();

  // Prohibited in domain objects:
  user.setName("John").setEmail("john@doe.com");
  ```

## Validation Protocol
### Pre-Change Checklist
- [ ] Analyzed 3+ comparable examples
- [ ] Verified impact on dependent code
- [ ] Preserved backward compatibility
- [ ] Matched existing style (indentation/spacing)
- [ ] Confirmed pattern with documentation
- [ ] Checked for dependent code impacts

### Analysis Steps
1. Examine directory hierarchy and file naming
2. Identify import patterns (absolute vs relative)
3. Study class/method structure and inheritance
4. Locate 3+ implementation examples
5. Document findings pre-implementation

## Anti-Pattern Prohibitions
1. **Value Objects**:
   - Methods beyond `value()`
   - Internal complex logic
   - Mutability
2. **Entities**:
   - Public setters
   - Internal validation logic
   - Cross-layer coupling
3. **General**:
   - `I` prefix for interfaces
   - Portuguese/English mixing
   - Breaking encapsulation
   - Logic duplication
   - Incorrect interface naming (`IWorker.ts`, `Worker-Interface.ts`)
   - JSDocs or comments for simple methods/functions/class

## Error Handling Protocol
1. **Unclear Patterns**:
   - Request clarification with examples
   - Propose minimal safe implementation
   - Highlight uncertainties explicitly
2. **Conflicts**:
   - Freeze changes immediately
   - Report discrepancies
   - Request pattern clarification
