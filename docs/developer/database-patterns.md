# Database Patterns

This document outlines the **MANDATORY** database patterns and practices for Project Wiz's SQLite + Drizzle ORM architecture.

## 🚨 CRITICAL MIGRATION RULES

### **NEVER EDIT SQL MIGRATION FILES DIRECTLY**

Migrations are **AUTO-GENERATED** by Drizzle from `*.model.ts` files:

1. **ONLY** modify schema in `src/main/features/**/*.model.ts`
2. Run `npm run db:generate` - auto-detects changes via `drizzle.config.ts`
3. Run `npm run db:migrate` - applies migrations
4. Direct SQL edits will be **OVERWRITTEN** and can **BREAK** the migration system

## Schema Definition Patterns

### **MUST USE:** Type Inference + Custom Types

```typescript
// ✅ CORRECT: Custom types with inference
export type ProjectStatus = "active" | "archived" | "deleted";
export type AgentModel = "gpt-4" | "claude-3-5-sonnet" | "gemini-pro";

export const agentsTable = sqliteTable(
  "agents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    model: text("model").$type<AgentModel>().notNull(),
    status: text("status").$type<ProjectStatus>().notNull().default("active"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    // MUST include indexes for foreign keys and common queries
    ownerIdIdx: index("agents_owner_id_idx").on(table.ownerId),
    statusIdx: index("agents_status_idx").on(table.status),
    createdAtIdx: index("agents_created_at_idx").on(table.createdAt),
  }),
);

// Type inference - NEVER recreate manually
export type SelectAgent = typeof agentsTable.$inferSelect;
export type InsertAgent = typeof agentsTable.$inferInsert;
export type UpdateAgent = Partial<InsertAgent> & { id: string };
```

### **MANDATORY:** Foreign Key Constraints

```typescript
// ✅ CORRECT: Always use foreign key constraints
export const conversationsTable = sqliteTable(
  "conversations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    projectIdIdx: index("conversations_project_id_idx").on(table.projectId),
    ownerIdIdx: index("conversations_owner_id_idx").on(table.ownerId),
  }),
);
```

### **MANDATORY:** Timestamp Patterns

```typescript
// ✅ CORRECT: Consistent timestamp columns
const baseTimestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
};

// Use in all tables
export const usersTable = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  ...baseTimestamps,
});
```

## Drizzle Query Patterns

### **MUST USE:** db.select().from().where() Pattern

```typescript
// ✅ CORRECT: Structured query with destructuring
const [user] = await db
  .select({
    id: usersTable.id,
    username: usersTable.username,
    theme: usersTable.theme,
  })
  .from(usersTable)
  .where(eq(usersTable.id, userId))
  .limit(1);

if (!user) {
  throw new Error("User not found");
}

// ✅ CORRECT: Join queries with proper selection
const agentsWithProviders = await db
  .select({
    agent: {
      id: agentsTable.id,
      name: agentsTable.name,
      model: agentsTable.model,
    },
    provider: {
      id: llmProvidersTable.id,
      name: llmProvidersTable.name,
      type: llmProvidersTable.type,
    },
  })
  .from(agentsTable)
  .innerJoin(
    llmProvidersTable,
    eq(agentsTable.providerId, llmProvidersTable.id),
  )
  .where(eq(agentsTable.ownerId, userId));
```

### **AVOID:** db.query Pattern

```typescript
// ❌ AVOID: Requires schema registration in drizzle.config.ts
const user = await db.query.usersTable.findFirst({
  where: eq(usersTable.id, userId),
  columns: { id: true, username: true },
});
```

## Service Layer Patterns

### **MUST FOLLOW:** Service Returns Data Directly

```typescript
// ✅ CORRECT: Services throw errors, return data directly
export class UserService {
  static async getById(userId: string): Promise<SelectUser> {
    const db = getDatabase();

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user;
  }

  static async create(input: InsertUser): Promise<SelectUser> {
    const db = getDatabase();

    const [newUser] = await db
      .insert(usersTable)
      .values({
        ...input,
        password: await bcrypt.hash(input.password, 12),
      })
      .returning();

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    return newUser;
  }

  static async update(
    userId: string,
    input: Partial<InsertUser>,
  ): Promise<SelectUser> {
    const db = getDatabase();

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error(`Failed to update user ${userId}`);
    }

    return updatedUser;
  }
}
```

## Database Configuration

### **MANDATORY:** SQLite Configuration

```typescript
// ✅ CORRECT: WAL mode for better concurrency
const db = new Database("project-wiz.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("synchronous = NORMAL");
db.pragma("cache_size = 1000");
db.pragma("temp_store = memory");
```

### **MANDATORY:** Connection Management

```typescript
// ✅ CORRECT: Singleton database connection
let database: BetterSQLite3Database | null = null;

export function getDatabase(): BetterSQLite3Database {
  if (!database) {
    const sqlite = new Database(DATABASE_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");

    database = drizzle(sqlite);
  }

  return database;
}
```

## Transaction Patterns

### **MUST USE:** Transactions for Multi-Table Operations

```typescript
// ✅ CORRECT: Transaction for related operations
export class ProjectService {
  static async createWithDefaultChannel(input: InsertProject): Promise<{
    project: SelectProject;
    channel: SelectChannel;
  }> {
    const db = getDatabase();

    return await db.transaction(async (tx) => {
      // Create project
      const [project] = await tx
        .insert(projectsTable)
        .values(input)
        .returning();

      if (!project) {
        throw new Error("Failed to create project");
      }

      // Create default channel
      const [channel] = await tx
        .insert(channelsTable)
        .values({
          name: "general",
          projectId: project.id,
          type: "text",
        })
        .returning();

      if (!channel) {
        throw new Error("Failed to create default channel");
      }

      return { project, channel };
    });
  }
}
```

## Authentication & Session Patterns

### **MANDATORY:** Database Session Management

```typescript
// ✅ CORRECT: Database-based sessions for desktop app
export const userSessionsTable = sqliteTable(
  "user_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdIdx: index("user_sessions_user_id_idx").on(table.userId),
    tokenIdx: index("user_sessions_token_idx").on(table.token),
    expiresAtIdx: index("user_sessions_expires_at_idx").on(table.expiresAt),
  }),
);

// Session validation with cleanup
export class AuthService {
  static async validateSession(
    token: string,
  ): Promise<AuthenticatedUser | null> {
    const db = getDatabase();

    // Clean expired sessions first
    await db
      .delete(userSessionsTable)
      .where(lt(userSessionsTable.expiresAt, new Date()));

    const [result] = await db
      .select({
        user: {
          id: usersTable.id,
          username: usersTable.username,
          email: usersTable.email,
          theme: usersTable.theme,
        },
        session: {
          expiresAt: userSessionsTable.expiresAt,
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

## Migration Best Practices

### **MANDATORY:** Migration Workflow

1. **Modify `*.model.ts`** - Make schema changes
2. **Run `npm run db:generate`** - Creates migration files
3. **Review generated migration** - Ensure it matches intentions
4. **Run `npm run db:migrate`** - Applies to database
5. **Update service layer** - Adapt business logic if needed

### **CRITICAL:** Backward Compatibility

```typescript
// ✅ CORRECT: Safe column additions
export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  // New optional column (safe)
  timezone: text("timezone"), // NULL allowed for existing records
});

// ❌ DANGEROUS: Non-null columns without defaults
export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  // This will fail for existing records
  requiredField: text("required_field").notNull(),
});
```

## Index Strategy

### **MANDATORY:** Index All Foreign Keys

```typescript
// ✅ CORRECT: Comprehensive indexing
export const messagesTable = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id").notNull(),
    senderId: text("sender_id").notNull(),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    // Foreign key indexes (MANDATORY)
    conversationIdIdx: index("messages_conversation_id_idx").on(
      table.conversationId,
    ),
    senderIdIdx: index("messages_sender_id_idx").on(table.senderId),

    // Query optimization indexes
    createdAtIdx: index("messages_created_at_idx").on(table.createdAt),

    // Composite indexes for common queries
    conversationCreatedIdx: index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  }),
);
```

## Type Safety Best Practices

### **MUST FOLLOW:** Type Organization

```typescript
// ✅ CORRECT: Export types, don't declare inline
export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
export type UpdateProject = Partial<InsertProject> & { id: string };

// Custom types for specific use cases
export type ProjectWithChannels = SelectProject & {
  channels: SelectChannel[];
};

export type ProjectSummary = Pick<
  SelectProject,
  "id" | "name" | "status" | "createdAt"
>;

// ❌ WRONG: Recreating types manually
interface Project {
  id: string;
  name: string;
  // ... manually typing what Drizzle already infers
}
```
