---
template_type: "architecture"
complexity: "high"
primary_agent: "solution-architect"
estimated_time: "2-4 hours"
related_patterns:
  - "docs/developer/code-simplicity-principles.md"
  - "docs/developer/data-loading-patterns.md"
  - "docs/developer/database-patterns.md"
  - "docs/developer/ipc-communication-patterns.md"
  - "docs/developer/folder-structure.md"
---

# System Design: [SYSTEM_NAME]

**Date:** [DATE]  
**Version:** [VERSION]  
**Status:** [Draft/In Review/Approved/Implemented]  
**Authors:** [AUTHOR_NAME], Claude Code  
**Reviewers:** [REVIEWER_NAMES]

## Executive Summary

### System Overview

[Provide a high-level description of the system being designed, its purpose, and how it fits into the overall Project Wiz architecture.]

### Key Design Decisions

- [Key decision 1]
- [Key decision 2]
- [Key decision 3]

### Success Criteria

- [Success criterion 1]
- [Success criterion 2]
- [Success criterion 3]

## Context and Scope

### Problem Statement

[Describe the problem this system design addresses. What business or technical challenge are we solving?]

### System Boundaries

**In Scope:**

- [Feature/component 1]
- [Feature/component 2]
- [Feature/component 3]

**Out of Scope:**

- [Item 1 explicitly excluded]
- [Item 2 for future consideration]
- [Item 3 delegated to other systems]

### Project Wiz Context

[Explain how this system fits within Project Wiz's architecture and constraints:]

- **Electron Desktop App:** [How this system leverages or is constrained by the desktop app context]
- **INLINE-FIRST Philosophy:** [How this system design supports inline-first development]
- **Technology Stack:** [Specific usage of React, SQLite, TanStack Router/Query]
- **Security Model:** [Desktop app security considerations]

## Architecture Analysis

### Current State Assessment

[Analyze the current system state, including existing components, patterns, and limitations.]

**Existing Components:**

```typescript
// Current implementation structure
src/main/features/[existing-feature]/
├── [existing-feature].model.ts      // Current data model
├── [existing-feature].service.ts    // Current business logic
├── [existing-feature].handler.ts    // Current IPC handlers
└── [existing-feature].types.ts      // Current type definitions
```

**Current Limitations:**

- [Limitation 1 with specific impact]
- [Limitation 2 with performance metrics]
- [Limitation 3 with maintenance burden]

### Requirements Analysis

#### Functional Requirements

- **FR-001:** [Specific functional requirement]
- **FR-002:** [Another functional requirement]
- **FR-003:** [Additional functional requirement]

#### Non-Functional Requirements

- **Performance:** [Specific performance requirements]
- **Security:** [Desktop app security requirements]
- **Usability:** [User experience requirements]
- **Maintainability:** [Code maintainability requirements aligned with INLINE-FIRST]

#### Project Wiz Specific Requirements

- **Code Simplicity:** [Requirements that affect inline vs abstraction decisions]
- **Data Loading:** [Requirements affecting TanStack Router/Query patterns]
- **IPC Security:** [Requirements for secure main/renderer communication]

## Proposed System Design

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Renderer      │    │   Main Process  │    │   External      │
│   Process       │    │                 │    │   Systems       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ [Component A]   │◄──►│ [Service A]     │◄──►│ [External API]  │
│ [Component B]   │    │ [Service B]     │    │ [Database]      │
│ [Component C]   │    │ [Handler Layer] │    │ [File System]   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

#### Main Process Components

**[Service Component Name]**

```typescript
// Service layer following Project Wiz patterns
export class [ServiceName] {
  static async [methodName](input: [InputType]): Promise<[ReturnType]> {
    // INLINE-FIRST: Validation + business logic + database in one place
    const validated = [ValidationSchema].parse(input);

    // Business logic inline (< 15 lines)
    const [businessLogicResult] = [BUSINESS_LOGIC_IMPLEMENTATION];

    // Database operation inline
    const [result] = await db
      .insert([tableName])
      .values(validated)
      .returning();

    if (!result) {
      throw new Error('[Specific error message]');
    }

    return result;
  }
}
```

**[Handler Component Name]**

```typescript
// IPC handler following Project Wiz patterns
export function setup[FeatureName]Handlers(): void {
  ipcMain.handle(
    '[feature]:[action]',
    async (_, input: [InputType]): Promise<IpcResponse<[ReturnType]>> => {
      try {
        const result = await [ServiceName].[methodName](input);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : '[Default error message]',
        };
      }
    },
  );
}
```

#### Renderer Process Components

**[React Component Name]**

```typescript
// React component following Project Wiz patterns
export function [ComponentName]() {
  // Data loading via TanStack Router (highest priority)
  const data = Route.useLoaderData();

  // Local state for UI interactions
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Mutations via TanStack Query
  const createMutation = useMutation({
    mutationFn: (data: [InputType]) =>
      loadApiData(() => window.api.[feature].[action](data)),
    onSuccess: () => {
      router.invalidate();
      toast.success('[Success message]');
    },
  });

  // Event handlers inline (INLINE-FIRST)
  const handleSubmit = async (formData: [FormDataType]) => {
    setIsLoading(true);
    try {
      await createMutation.mutateAsync(formData);
      setShowModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Component JSX following shadcn/ui patterns
    <div className="[tailwind-classes]">
      {/* Component implementation */}
    </div>
  );
}
```

### Data Flow Architecture

#### Data Loading Hierarchy (MANDATORY ORDER)

1. **TanStack Router beforeLoad/loader** - Initial page data
2. **TanStack Query** - Mutations and reactive data
3. **Local React State** - Simple UI state
4. **Custom Hooks** - Last resort only

```typescript
// Route data loading (highest priority)
export const Route = createFileRoute('[route-path]')({
  loader: async () => {
    return await loadApiData(
      () => window.api.[feature].list(),
      'Failed to load [feature] data'
    );
  },
  component: [ComponentName],
});
```

#### IPC Communication Flow

```
Renderer Component → window.api.[feature].[action]()
                  → Preload Script
                  → ipcRenderer.invoke('[feature]:[action]')
                  → Main Process Handler
                  → Service Layer
                  → Database/External Systems
                  → Return IpcResponse<T>
```

### Database Design

#### Schema Design

```typescript
// Database schema following Project Wiz patterns
export const [tableName]Table = sqliteTable(
  '[table_name]',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    [field1]: text('[field1]').notNull(),
    [field2]: text('[field2]').$type<[CustomType]>().notNull(),
    [foreignKeyField]: text('[foreign_key_field]')
      .notNull()
      .references(() => [referencedTable].id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    // MANDATORY: Indexes for foreign keys and query optimization
    [foreignKeyField]Idx: index('[table]_[foreign_key]_idx').on(table.[foreignKeyField]),
    [commonQueryField]Idx: index('[table]_[field]_idx').on(table.[commonQueryField]),
  }),
);

// Type inference (NEVER recreate manually)
export type Select[EntityName] = typeof [tableName]Table.$inferSelect;
export type Insert[EntityName] = typeof [tableName]Table.$inferInsert;
```

#### Migration Strategy

```bash
# CRITICAL: Never edit SQL migrations directly
# 1. Modify *.model.ts files
# 2. Generate migrations
npm run db:generate
# 3. Apply migrations
npm run db:migrate
```

### Security Architecture

#### Desktop App Security Model

```typescript
// Secure Electron configuration
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false, // CRITICAL: Disable node in renderer
      contextIsolation: true, // CRITICAL: Enable context isolation
      enableRemoteModule: false, // CRITICAL: Disable remote module
      preload: path.join(__dirname, "preload.js"),
    },
  });
};
```

#### Session Management

```typescript
// Database-based sessions (NOT localStorage)
export class AuthService {
  static async validateSession(token: string): Promise<[UserType] | null> {
    // Clean expired sessions
    await db
      .delete(userSessionsTable)
      .where(lt(userSessionsTable.expiresAt, new Date()));

    // Validate current session
    const [result] = await db
      .select({
        user: {
          /* user fields */
        },
        session: {
          /* session fields */
        },
      })
      .from(userSessionsTable)
      .innerJoin(usersTable, eq(userSessionsTable.userId, usersTable.id))
      .where(
        and(
          eq(userSessionsTable.token, token),
          gt(userSessionsTable.expiresAt, new Date()),
        ),
      )
      .limit(1);

    return result?.user || null;
  }
}
```

## Implementation Strategy

### Phase 1: Foundation ([DURATION])

**Objective:** [Phase 1 objective]

**Deliverables:**

- [ ] Database schema design and migration
- [ ] Core service layer implementation
- [ ] Basic IPC handler setup
- [ ] Type definitions and validation schemas

**Implementation Steps:**

1. **Database Setup**

   ```bash
   # Create model files
   # Generate and apply migrations
   npm run db:generate && npm run db:migrate
   ```

2. **Service Layer Development**

   ```typescript
   // Implement core services following INLINE-FIRST
   export class [ServiceName] {
     // Implementation following Project Wiz patterns
   }
   ```

3. **IPC Handler Implementation**
   ```typescript
   // Setup type-safe IPC handlers
   export function setup[Feature]Handlers(): void {
     // Handler implementation
   }
   ```

### Phase 2: Integration ([DURATION])

**Objective:** [Phase 2 objective]

**Deliverables:**

- [ ] Frontend component implementation
- [ ] Route setup with data loading
- [ ] Error handling and validation
- [ ] Testing infrastructure

**Implementation Steps:**

1. **Frontend Development**

   ```typescript
   // Implement React components with TanStack Router
   export const Route = createFileRoute("[path]")({
     // Route implementation
   });
   ```

2. **Component Integration**
   ```typescript
   // Component implementation with shadcn/ui
   export function [ComponentName]() {
     // Component logic following INLINE-FIRST
   }
   ```

### Phase 3: Optimization ([DURATION])

**Objective:** [Phase 3 objective]

**Deliverables:**

- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation completion
- [ ] Testing and validation

## Testing Strategy

### Unit Testing

```typescript
// Service layer testing
describe('[ServiceName]', () => {
  beforeEach(async () => {
    await migrate(testDb, { migrationsFolder: './migrations' });
  });

  it('should [expected behavior]', async () => {
    const input = [TEST_INPUT];
    const result = await [ServiceName].[methodName](input);

    expect(result).toMatchObject([EXPECTED_OUTPUT]);
  });
});
```

### Integration Testing

```typescript
// IPC communication testing
describe("[Feature] IPC", () => {
  it("should handle [action] successfully", async () => {
    const response = await ipcRenderer.invoke("[feature]:[action]", [INPUT]);

    expect(response.success).toBe(true);
    expect(response.data).toMatchObject([EXPECTED_DATA]);
  });
});
```

### End-to-End Testing

[Describe E2E testing strategy for complete user workflows]

## Performance Considerations

### Database Performance

- **Indexing Strategy:** [Specific indexes and their purpose]
- **Query Optimization:** [Query patterns and performance targets]
- **Connection Management:** [SQLite WAL mode and connection pooling]

### Frontend Performance

- **Data Loading:** [TanStack Router/Query optimization]
- **Component Rendering:** [React optimization strategies]
- **Bundle Size:** [Code splitting and lazy loading]

### IPC Performance

- **Message Size:** [Optimization for large data transfers]
- **Frequency:** [Batching and throttling strategies]
- **Security Overhead:** [Performance impact of security measures]

## Monitoring and Observability

### Key Metrics

- **Performance Metrics:** [Response times, throughput, resource usage]
- **Business Metrics:** [User engagement, feature usage, error rates]
- **Technical Metrics:** [Database performance, IPC latency, memory usage]

### Logging Strategy

```typescript
// Consistent logging following Project Wiz patterns
import { logger } from '../utils/logger';

export class [ServiceName] {
  static async [methodName](input: [InputType]): Promise<[ReturnType]> {
    logger.info('[Action description]', { input });

    try {
      const result = [IMPLEMENTATION];
      logger.info('[Success message]', { result });
      return result;
    } catch (error) {
      logger.error('[Error context]', { error, input });
      throw error;
    }
  }
}
```

## Risk Assessment

### Technical Risks

| Risk     | Probability     | Impact          | Mitigation            |
| -------- | --------------- | --------------- | --------------------- |
| [Risk 1] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |
| [Risk 2] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |

### Business Risks

| Risk     | Probability     | Impact          | Mitigation            |
| -------- | --------------- | --------------- | --------------------- |
| [Risk 1] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |
| [Risk 2] | High/Medium/Low | High/Medium/Low | [Mitigation strategy] |

### Project Wiz Specific Risks

- **INLINE-FIRST Violations:** [Risk of over-abstraction and mitigation]
- **Pattern Inconsistency:** [Risk of deviating from established patterns]
- **Security Vulnerabilities:** [Desktop app specific security risks]

## Documentation Requirements

### Developer Documentation Updates

- [ ] [docs/developer/coding-standards.md] - If new patterns introduced
- [ ] [docs/developer/database-patterns.md] - If database patterns change
- [ ] [docs/developer/ipc-communication-patterns.md] - If IPC patterns change
- [ ] [docs/developer/data-loading-patterns.md] - If data loading patterns change

### Technical Guides

- [ ] Create new guides in [docs/technical-guides/] for complex integrations
- [ ] Update existing guides if patterns change

### Architecture Documentation

- [ ] Create ADRs for major architectural decisions
- [ ] Update system overview documentation
- [ ] Document integration patterns and examples

## Success Criteria and Validation

### Acceptance Criteria

- [ ] All functional requirements implemented and tested
- [ ] Performance requirements met or exceeded
- [ ] Security requirements validated
- [ ] Code quality standards maintained (INLINE-FIRST compliance)

### Validation Methods

- **Functional Validation:** [How to validate functional requirements]
- **Performance Validation:** [Benchmarking and load testing approach]
- **Security Validation:** [Security testing and audit approach]
- **Code Quality Validation:** [Code review and static analysis]

## Future Considerations

### Scalability

[How this system design accommodates future growth and expansion]

### Extensibility

[How new features can be added without major architectural changes]

### Technology Evolution

[How this design adapts to technology stack updates and evolution]

## References

### Project Wiz Documentation

- [Code Simplicity Principles](../../developer/code-simplicity-principles.md)
- [Data Loading Patterns](../../developer/data-loading-patterns.md)
- [Database Patterns](../../developer/database-patterns.md)
- [IPC Communication Patterns](../../developer/ipc-communication-patterns.md)
- [Folder Structure](../../developer/folder-structure.md)

### External References

- [Relevant external documentation]
- [Technology documentation]
- [Industry best practices]

### Related Architectural Documents

- [Related ADRs]
- [Related system designs]
- [Integration specifications]

---

## Template Usage Notes

**For Claude Code Agents:**

1. Replace all `[PLACEHOLDER]` text with system-specific content
2. Include actual code examples from the Project Wiz codebase
3. Reference specific files and patterns from the existing documentation
4. Ensure all architecture decisions align with Project Wiz patterns
5. Complete all sections before finalizing the system design

**File Naming Convention:** `system-design-[kebab-case-name].md`  
**Location:** Save completed designs in `docs/architecture/systems/`
