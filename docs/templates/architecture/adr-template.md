---
template_type: "architecture"
complexity: "medium"
primary_agent: "solution-architect"
estimated_time: "1-2 hours"
related_patterns:
  - "docs/developer/code-simplicity-principles.md"
  - "docs/developer/database-patterns.md"
  - "docs/developer/ipc-communication-patterns.md"
---

# ADR-[NUMBER]: [DECISION_TITLE]

**Date:** [DATE]  
**Status:** [Proposed/Accepted/Deprecated/Superseded]  
**Authors:** [AUTHOR_NAME], Claude Code  
**Reviewers:** [REVIEWER_NAMES]

## Context and Problem Statement

### Problem Description

[Describe the architectural problem or decision that needs to be made. Be specific about what challenge you're trying to solve.]

### Current Situation

[Describe the current state of the system related to this decision. Include relevant code patterns, architectural constraints, and existing implementations.]

### Project Wiz Context

[Explain how this decision relates to Project Wiz's specific architecture and constraints:]

- **INLINE-FIRST Philosophy Impact:** [How does this decision align with or affect code simplicity principles?]
- **Technology Stack Considerations:** [Electron, React, SQLite, TanStack Router/Query implications]
- **Desktop App Constraints:** [Security, performance, user experience considerations]

## Decision Drivers

### Technical Requirements

- [Technical requirement 1]
- [Technical requirement 2]
- [Technical requirement 3]

### Business Requirements

- [Business requirement 1]
- [Business requirement 2]

### Quality Attributes

- [Performance requirements]
- [Security requirements]
- [Maintainability requirements]
- [Scalability requirements]

### Project Wiz Specific Drivers

- **Code Simplicity:** [How this affects inline-first development]
- **Developer Experience:** [Impact on debugging and maintenance]
- **Data Loading Patterns:** [Alignment with TanStack Router/Query hierarchy]
- **IPC Communication:** [Effects on main/renderer process communication]

## Considered Options

### Option 1: [OPTION_NAME]

**Description:** [Detailed description of this option]

**Pros:**

- [Advantage 1]
- [Advantage 2]
- [Advantage 3]

**Cons:**

- [Disadvantage 1]
- [Disadvantage 2]

**Project Wiz Alignment:**

- **INLINE-FIRST:** [How this option supports or conflicts with inline-first principles]
- **Patterns Compliance:** [Alignment with existing data loading, database, IPC patterns]
- **Security:** [Desktop app security implications]

**Code Example:**

```typescript
// Example implementation following Project Wiz patterns
export class [ExampleService] {
  static async [exampleMethod](input: [InputType]): Promise<[ReturnType]> {
    // INLINE-FIRST: Validation + business logic + database operation
    const validated = [ValidationSchema].parse(input);

    const [result] = await db
      .select()
      .from([table])
      .where(eq([table].[field], validated.[field]))
      .limit(1);

    if (!result) {
      throw new Error("[Specific error message]");
    }

    return result;
  }
}
```

### Option 2: [OPTION_NAME]

**Description:** [Detailed description of this option]

**Pros:**

- [Advantage 1]
- [Advantage 2]

**Cons:**

- [Disadvantage 1]
- [Disadvantage 2]

**Project Wiz Alignment:**

- **INLINE-FIRST:** [Analysis of inline vs abstraction trade-offs]
- **Patterns Compliance:** [How this fits with established patterns]
- **Security:** [Security considerations for desktop app]

**Code Example:**

```typescript
// Alternative implementation approach
[CODE_EXAMPLE_PLACEHOLDER];
```

### Option 3: [OPTION_NAME] (if applicable)

[Follow same structure as above options]

## Decision Outcome

### Chosen Option

**Option [NUMBER]: [CHOSEN_OPTION_NAME]**

### Rationale

[Explain why this option was chosen over the others. Include specific reasoning related to Project Wiz's context and constraints.]

### Project Wiz Specific Justification

- **Code Simplicity Impact:** [How this decision supports inline-first development]
- **Pattern Consistency:** [How this maintains consistency with existing patterns]
- **Performance Considerations:** [Desktop app performance implications]
- **Security Implications:** [Electron security pattern alignment]

## Implementation Strategy

### Phase 1: [PHASE_NAME]

**Timeline:** [ESTIMATED_TIME]  
**Deliverables:**

- [Deliverable 1]
- [Deliverable 2]

**Implementation Details:**

```typescript
// Phase 1 implementation example
[CODE_PLACEHOLDER_PHASE_1];
```

### Phase 2: [PHASE_NAME] (if applicable)

**Timeline:** [ESTIMATED_TIME]  
**Deliverables:**

- [Deliverable 1]
- [Deliverable 2]

**Implementation Details:**

```typescript
// Phase 2 implementation example
[CODE_PLACEHOLDER_PHASE_2];
```

### Migration Strategy (if applicable)

[Describe how to migrate from current implementation to the new approach, including backwards compatibility considerations.]

## Architecture Impact

### System Components Affected

- **Main Process:** [Impact on Electron main process]
- **Renderer Process:** [Impact on React frontend]
- **Database:** [Schema or query pattern changes]
- **IPC Communication:** [Changes to inter-process communication]

### Code Changes Required

- **Service Layer:** [Changes to `*.service.ts` files]
- **Handlers:** [Changes to `*.handler.ts` files]
- **Models:** [Changes to `*.model.ts` files]
- **Frontend Components:** [Changes to React components]

### Pattern Compliance

- **Database Patterns:** [Reference to docs/developer/database-patterns.md]
- **IPC Patterns:** [Reference to docs/developer/ipc-communication-patterns.md]
- **Data Loading:** [Reference to docs/developer/data-loading-patterns.md]

## Testing Strategy

### Unit Tests

```typescript
// Test example following Project Wiz patterns
describe("[ComponentName]", () => {
  beforeEach(async () => {
    // Setup test database
    await migrate(testDb, { migrationsFolder: "./migrations" });
  });

  it("should [expected behavior]", async () => {
    // Test implementation
    const input = [TEST_INPUT];
    const result = await [ServiceMethod](input);

    expect(result).toMatchObject([EXPECTED_OUTPUT]);
  });
});
```

### Integration Tests

[Describe integration test strategy, particularly for IPC communication and database interactions]

### Security Testing

[Describe security testing approach for desktop app context]

## Monitoring and Validation

### Success Metrics

- [Metric 1 with target value]
- [Metric 2 with target value]
- [Performance benchmarks]

### Monitoring Approach

[How to monitor the implementation and validate the decision was correct]

### Rollback Plan

[Plan for reverting this decision if it proves problematic]

## Documentation Updates Required

### Developer Documentation

- [ ] Update [docs/developer/coding-standards.md] if patterns change
- [ ] Update [docs/developer/database-patterns.md] if database patterns affected
- [ ] Update [docs/developer/ipc-communication-patterns.md] if IPC patterns affected
- [ ] Update [docs/developer/data-loading-patterns.md] if data loading affected

### Technical Guides

- [ ] Update relevant guides in [docs/technical-guides/]
- [ ] Create new guides if new patterns introduced

### Architecture Documentation

- [ ] Update [docs/developer/architecture/] with new architectural decisions
- [ ] Cross-reference this ADR in related architectural documents

## Related Decisions

### Previous ADRs

- [ADR-XXX: Related previous decision]
- [ADR-YYY: Another related decision]

### Future Decisions

- [Potential future decisions that may be affected by this choice]

### Dependencies

- [Other architectural decisions this depends on]
- [External factors that influence this decision]

## References

### Project Wiz Documentation

- [Code Simplicity Principles](../../developer/code-simplicity-principles.md)
- [Database Patterns](../../developer/database-patterns.md)
- [IPC Communication Patterns](../../developer/ipc-communication-patterns.md)
- [Data Loading Patterns](../../developer/data-loading-patterns.md)

### External References

- [Relevant external documentation]
- [Industry best practices]
- [Technology-specific guidelines]

### Code Examples

- [Link to relevant code in the codebase]
- [Examples from similar implementations]

---

## Template Usage Notes

**For Claude Code Agents:**

1. Replace all `[PLACEHOLDER]` text with specific content
2. Include actual code examples from the Project Wiz codebase
3. Reference specific files and patterns from the documentation
4. Ensure all sections are completed before finalizing the ADR
5. Cross-reference with related Project Wiz patterns and guidelines

**File Naming Convention:** `adr-[number]-[kebab-case-title].md`  
**Location:** Save completed ADRs in `docs/architecture/decisions/`
