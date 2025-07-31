# Database Transaction Patterns

**CRITICAL:** This document contains the **MANDATORY** transaction patterns for Project Wiz's better-sqlite3 + Drizzle ORM architecture.

**Context:** All transactions in this project use better-sqlite3, which is **synchronous by design**.

## 🚨 CRITICAL RULE: No Async Transaction Callbacks

### ❌ **NEVER DO THIS** (Will Fail)

```typescript
// This will throw: "Transaction function cannot return a promise"
db.transaction(async (tx) => {  // ← async callback is the problem
  const result = await tx.select().from(table)...
  return result;
});
```

### ✅ **ALWAYS DO THIS** (Correct Pattern)

```typescript
// await the transaction, but callback must be synchronous
const result = await db.transaction((tx) => {
  // ← await is OK here
  const results = tx.select().from(table).all();
  const result = results[0];

  if (!result) {
    throw new Error("Not found"); // Triggers automatic rollback
  }

  return result;
});
```

## Transaction Method Reference

| Method               | Use Case                  | Returns          | Example                                            |
| -------------------- | ------------------------- | ---------------- | -------------------------------------------------- |
| `.all()`             | SELECT queries            | `Array<T>`       | `tx.select().from(users).all()`                    |
| `.get()`             | Single row SELECT         | `T \| undefined` | `tx.select().from(users).limit(1).get()`           |
| `.run()`             | INSERT/UPDATE/DELETE      | `RunResult`      | `tx.insert(users).values({...}).run()`             |
| `.returning().all()` | INSERT/UPDATE with return | `Array<T>`       | `tx.insert(users).values({...}).returning().all()` |

## Real-World Examples

### ✅ Create Operation with Validation

```typescript
// From AgentService.create() - Production code
static async create(input: CreateAgentInput, ownerId: string): Promise<SelectAgent> {
  const db = getDatabase();

  return await db.transaction((tx) => {  // ← await is OK here
    // 1. Validate dependencies exist
    const providers = tx
      .select()
      .from(llmProvidersTable)
      .where(eq(llmProvidersTable.id, input.providerId))
      .limit(1)
      .all();

    if (!providers[0]) {
      throw new Error("Provider not found"); // Automatic rollback
    }

    // 2. Create related record first
    const users = tx
      .insert(usersTable)
      .values({
        name: input.name,
        type: "agent",
      })
      .returning()
      .all();

    const agentUser = users[0];
    if (!agentUser?.id) {
      throw new Error("Failed to create user");
    }

    // 3. Create main record
    const agents = tx
      .insert(agentsTable)
      .values({
        userId: agentUser.id,
        ownerId: ownerId,
        name: input.name,
        // ... other fields
      })
      .returning()
      .all();

    const agent = agents[0];
    if (!agent) {
      throw new Error("Failed to create agent");
    }

    return agent; // All operations committed atomically
  });
}
```

### ✅ Soft Delete Pattern

```typescript
// From AgentService.softDelete() - Production code
static async softDelete(id: string, deletedBy: string): Promise<boolean> {
  const db = getDatabase();

  return await db.transaction((tx) => {  // ← await is OK here
    // 1. Verify record exists and is active
    const agents = tx
      .select()
      .from(agentsTable)
      .where(and(
        eq(agentsTable.id, id),
        eq(agentsTable.isActive, true)
      ))
      .limit(1)
      .all();

    if (!agents[0]) {
      throw new Error("Agent not found or already inactive");
    }

    // 2. Perform soft delete
    tx
      .update(agentsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: deletedBy,
        updatedAt: new Date(),
      })
      .where(eq(agentsTable.id, id))
      .run();

    return true;
  });
}
```

### ✅ Complex Multi-Table Operation

```typescript
static createProjectWithChannel(input: CreateProjectInput): {
  project: SelectProject;
  channel: SelectChannel;
} {
  const db = getDatabase();

  return db.transaction((tx) => {
    // 1. Create project
    const projects = tx
      .insert(projectsTable)
      .values(input)
      .returning()
      .all();

    const project = projects[0];
    if (!project) {
      throw new Error("Failed to create project");
    }

    // 2. Create default channel
    const channels = tx
      .insert(channelsTable)
      .values({
        name: "general",
        projectId: project.id,
        type: "text",
      })
      .returning()
      .all();

    const channel = channels[0];
    if (!channel) {
      throw new Error("Failed to create default channel");
    }

    return { project, channel };
  });
}
```

## Error Handling & Rollback

### Automatic Rollback

```typescript
db.transaction((tx) => {
  // Any thrown error automatically rolls back ALL operations
  const results = tx.select().from(table).all();

  if (results.length === 0) {
    throw new Error("No data found"); // ← Triggers rollback
  }

  // This won't execute if error is thrown above
  tx.insert(otherTable).values({...}).run();

  return results[0];
});
```

### Manual Rollback (Advanced)

```typescript
db.transaction((tx) => {
  const results = tx.select().from(table).all();

  if (someComplexCondition) {
    tx.rollback(); // Explicit rollback (advanced usage)
    return null;
  }

  return results[0];
});
```

## Performance Benefits

1. **Synchronous Operations**: No promise overhead
2. **Atomic Transactions**: All-or-nothing guarantees
3. **Type Safety**: Full TypeScript inference maintained
4. **Better-SQLite3 Optimized**: Leverages native SQLite performance

## Common Mistakes to Avoid

### ❌ Using await inside transaction

```typescript
db.transaction((tx) => {
  const result = await tx.select()...; // ← ERROR: Cannot use await
});
```

### ❌ Forgetting .all()/.run()/.get()

```typescript
db.transaction((tx) => {
  const query = tx.select().from(table); // ← ERROR: Returns query object, not data
  return query[0]; // ← Will fail
});
```

### ❌ Not handling array results

```typescript
db.transaction((tx) => {
  const result = tx.select().from(table).all(); // ← Returns Array<T>
  return result.id; // ← ERROR: result is array, not object
});
```

## References

- **Drizzle ORM GitHub Discussion**: [#1170](https://github.com/drizzle-team/drizzle-orm/discussions/1170)
- **better-sqlite3 Documentation**: [Transaction Methods](https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/api.md#transactionfunction---function)
- **Project Implementation**: See `src/main/features/agent/agent.service.ts` for working examples

---

**Last Updated**: 2025-07-31  
**Status**: Production Implementation ✅
