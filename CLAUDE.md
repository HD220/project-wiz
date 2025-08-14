# CLAUDE.md - Project Wiz Development Guide

> **Purpose**: This guide enables Claude Code to make correct architectural decisions and write consistent, high-quality code for Project Wiz.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Project Context](#project-context)
3. [Architecture & Structure](#architecture--structure)
4. [Code Standards](#code-standards)
5. [Development Patterns](#development-patterns)
6. [Common Tasks](#common-tasks)
7. [Quality Checklist](#quality-checklist)

---

## Quick Start

### Essential Commands

```bash
# Before ANY code changes
npm run quality:check    # Run all checks

# After schema changes
npm run db:generate     # Generate migrations
npm run db:migrate      # Apply migrations

# After adding UI text
npm run extract         # Extract i18n strings
npm run compile         # Compile translations
```

### Critical Rules

1. **NEVER modify** files in `/components/ui/` (shadcn/ui)
2. **ALWAYS use** English in code, Portuguese only via LinguiJS
3. **ALWAYS export** on declaration, avoid `export default`
4. **ALWAYS use** `requireAuth()` in protected IPC handlers
5. **NEVER use** EventBus in renderer process
6. **Files max** 500 lines, functions max 50 lines

---

## Project Context

**Project Wiz** is an Electron desktop application that automates software development using AI agents. It's designed for developers, teams, and enterprises who need intelligent automation in their development workflow.

### Core Capabilities

- **AI Agents**: Customizable autonomous agents with specific roles and expertise
- **Multi-LLM Support**: OpenAI, Anthropic, DeepSeek, Google providers
- **Project Management**: Git integration, channels, team collaboration
- **Local-First**: SQLite database, encrypted API keys, offline capability

### Design Philosophy

```typescript
// KISS - Keep It Simple, Stupid
// ✅ Simple and clear
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Over-engineered
class CalculationEngine {
  private strategies: Map<string, Strategy>;
  calculate(items: Item[], strategy: string): number {
    /* complex */
  }
}

// YAGNI - You Aren't Gonna Need It
// ✅ Only what's needed now
type User = { id: string; name: string; email: string };

// ❌ Speculative fields
type User = {
  id: string;
  name: string;
  email: string;
  futureField?: unknown; // Not needed yet
  metadata?: any; // Definitely not needed
};
```

---

## Architecture & Structure

### Directory Layout

```
src/
├── main/                 # Electron main process (Node.js)
│   ├── ipc/             # IPC handlers by domain
│   │   └── {domain}/    # e.g., agent/, user/, project/
│   │       └── {action}/
│   │           └── invoke.ts
│   ├── schemas/         # Database schemas (Drizzle ORM)
│   ├── services/        # Business logic services
│   └── utils/           # Main process utilities
│
├── renderer/            # Electron renderer (React)
│   ├── app/            # File-based routing (TanStack Router)
│   ├── features/       # Feature modules
│   │   └── {feature}/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── utils/
│   ├── components/
│   │   └── ui/        # shadcn/ui (DO NOT MODIFY)
│   ├── hooks/         # Global hooks
│   └── lib/           # Global utilities
│
└── shared/             # Cross-process code
    ├── types/         # TypeScript types
    └── utils/         # Shared utilities
```

### Technology Stack

| Layer      | Technology                      | Purpose                    |
| ---------- | ------------------------------- | -------------------------- |
| Frontend   | React 19, TanStack Router/Query | UI and state management    |
| Styling    | Tailwind CSS, shadcn/ui         | Component styling          |
| Backend    | Electron, Node.js               | Desktop integration        |
| Database   | SQLite, Drizzle ORM             | Local data persistence     |
| AI         | Vercel AI SDK                   | LLM provider abstraction   |
| i18n       | LinguiJS                        | Portuguese/English support |
| Validation | Zod                             | Runtime type validation    |

### File Naming Conventions

```typescript
// Suffix patterns - ALWAYS use these
*.schema.ts        // Zod validation or database schemas
*.types.ts         // TypeScript type definitions
*.hook.ts          // React hooks (use- prefix)
*.action.ts        // Server actions/mutations
*.utils.ts         // Utility functions
*.constants.ts     // Application constants
*.config.ts        // Configuration files

// Component organization
{feature}/
├── components/
│   ├── {feature}-form.tsx      // Form component
│   ├── {feature}-list.tsx      // List component
│   ├── {feature}-card.tsx      // Card component
│   └── index.ts                 // Re-exports
├── hooks/
│   └── use-{feature}.hook.ts   // Feature hook
├── {feature}.schema.ts         // Validation schemas
├── {feature}.types.ts          // Type definitions
└── index.ts                     // Public API
```

---

## Code Standards

### TypeScript Conventions

#### Imports - STRICT ORDER

```typescript
// 1. Node.js built-ins
import fs from "fs";
import path from "path";

// 2. React (NEVER use default import)
import { useState, useEffect, useCallback } from "react";

// 3. External libraries (alphabetical)
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// 4. Internal imports (use aliases, not relative paths)
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth.context";
import { createAgent } from "@/main/ipc/agent/queries";

// 5. Type imports (always last, with 'type' keyword)
import type { Agent } from "@/shared/types/agent";
import type { ComponentProps } from "react";
```

#### Type Definitions

```typescript
// ALWAYS use 'type' over 'interface'
type User = {
  id: string;
  name: string;
  email: string;
};

// Use const assertions for literals
const ROLES = ["admin", "user", "guest"] as const;
type Role = (typeof ROLES)[number];

// Utility types for transformations
type CreateUser = Omit<User, "id" | "createdAt">;
type UpdateUser = Partial<CreateUser> & Pick<User, "id">;

// ALWAYS export on declaration
export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// NEVER use export default
export default User; // ❌ WRONG
```

#### Naming Conventions

```typescript
// Variables and functions: camelCase
const userData = {};
function getUserById(id: string) {}

// Types and classes: PascalCase
type UserProfile = {};
class UserService {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = "https://api.example.com";

// Boolean variables: is/has/should prefix
const isLoading = true;
const hasPermission = false;
const shouldRefetch = true;

// Event handlers: handle prefix
const handleSubmit = () => {};
const handleUserClick = () => {};

// Async functions: descriptive verbs
async function fetchUserData() {}
async function createProject() {}
async function validateCredentials() {}
```

### React Patterns

#### Component Structure - STRICT ORDER

```typescript
// 1. Imports (follow import order rules)
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/hooks/use-api-mutation.hook";

// 2. Type definitions (inline for component-specific)
type ComponentProps = {
  initialData: Data | null;
  onSubmit: (data: FormData) => void;
  isDisabled?: boolean;
};

// 3. Schema definitions (if needed)
const FormSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Valid email required"),
});

// 4. Component (ALWAYS destructure props in parameters)
export function Component({
  initialData,
  onSubmit,
  isDisabled = false
}: ComponentProps) {
  // 5. State hooks (group related state)
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 6. Form hooks
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: initialData || { name: "", email: "" },
  });

  // 7. API mutations (use useApiMutation for all API calls)
  const mutation = useApiMutation(
    (data: z.infer<typeof FormSchema>) => window.api.user.create(data),
    {
      successMessage: "User created successfully",
      errorMessage: "Failed to create user",
      onSuccess: (result) => {
        onSubmit(result);
        setIsOpen(false);
      },
      invalidateRouter: true, // Refresh route data
    }
  );

  // 8. Event handlers (use handle prefix)
  const handleFormSubmit = (data: z.infer<typeof FormSchema>) => {
    mutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    setIsOpen(false);
  };

  // 9. Effects (minimal, prefer route loaders)
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  // 10. Early returns (guard clauses)
  if (!initialData && isDisabled) {
    return <div>No data available</div>;
  }

  // 11. Main render
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        {/* Form content */}
        <Button
          type="submit"
          disabled={mutation.isPending || isDisabled}
        >
          {mutation.isPending ? "Creating..." : "Create"}
        </Button>
      </form>
    </Form>
  );
}
```

#### Custom Hooks

```typescript
// Always in separate file with .hook.ts suffix
// hooks/use-agent-actions.hook.ts

export function useAgentActions() {
  // Group related mutations
  const inactivateMutation = useApiMutation(
    (agentId: string) => window.api.agent.inactivate({ id: agentId }),
    {
      successMessage: "Agent inactivated",
      invalidateRouter: true,
    },
  );

  const deleteMutation = useApiMutation(
    (agentId: string) => window.api.agent.delete({ id: agentId }),
    {
      successMessage: "Agent deleted",
      invalidateRouter: true,
    },
  );

  // Return consistent API
  return {
    inactivate: inactivateMutation.mutate,
    delete: deleteMutation.mutate,
    isInactivating: inactivateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
```

### IPC Handler Patterns

#### Handler Implementation

```typescript
// src/main/ipc/{domain}/{action}/invoke.ts
import { z } from "zod";
import { createIPCHandler } from "@/shared/utils/create-ipc-handler";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/services/events/event-bus";

// Input validation schema
const InputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
});

// Output validation schema
const OutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  createdAt: z.date(),
});

// Handler implementation
const handler = createIPCHandler({
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  handler: async (input) => {
    // Authentication check (throws if not authenticated)
    const currentUser = requireAuth();

    // Authorization check
    if (currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Business logic
    const user = await createUser({
      ...input,
      ownerId: currentUser.id,
      createdAt: new Date(),
    });

    // Event emission (main process only)
    eventBus.emit("user:created", {
      userId: user.id,
      createdBy: currentUser.id,
    });

    return user;
  },
});

// Export (existing code uses default, but prefer named)
export default handler;

// Type declaration for frontend
declare global {
  namespace WindowAPI {
    type User = {
      create: InferHandler<typeof handler>;
    };
  }
}
```

### Database Patterns (Drizzle ORM)

#### Schema Definition

```typescript
// src/main/schemas/users.schema.ts
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable(
  "users",
  {
    // Primary key with UUID
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Required fields
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    role: text("role", { enum: ["admin", "user"] })
      .notNull()
      .default("user"),

    // Timestamps (always use timestamp_ms)
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),

    // Soft delete
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
  },
  (table) => ({
    // Performance indexes for queried fields
    emailIdx: index("users_email_idx").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
    deletedIdx: index("users_deleted_idx").on(table.deletedAt),
  }),
);

// Type exports
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type UpdateUser = Partial<InsertUser> & Pick<InsertUser, "id">;
```

#### Query Functions

```typescript
// src/main/ipc/user/queries.ts
import { eq, isNull, and } from "drizzle-orm";
import { getDatabase } from "@/main/database";
import { usersTable } from "@/main/schemas/users.schema";

// Single record queries
export async function findUserById(id: string): Promise<SelectUser | null> {
  const db = getDatabase();

  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.id, id), isNull(usersTable.deletedAt)))
    .limit(1);

  return user || null;
}

// List queries with filtering
export async function listUsers(filters?: {
  role?: string;
  search?: string;
}): Promise<SelectUser[]> {
  const db = getDatabase();

  let query = db.select().from(usersTable).where(isNull(usersTable.deletedAt));

  if (filters?.role) {
    query = query.where(eq(usersTable.role, filters.role));
  }

  return query;
}

// Transactions for complex operations
export async function createUserWithProfile(
  userData: InsertUser,
  profileData: InsertProfile,
): Promise<SelectUser> {
  const db = getDatabase();

  return db.transaction(async (tx) => {
    // Insert user
    const [user] = await tx.insert(usersTable).values(userData).returning();

    // Insert profile
    await tx.insert(profilesTable).values({
      ...profileData,
      userId: user.id,
    });

    return user;
  });
}
```

### Internationalization (i18n)

#### Using LinguiJS

```typescript
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export function InternationalizedComponent() {
  const { t: translate } = useLingui();

  return (
    <div>
      {/* Static text - use Trans component */}
      <h1>
        <Trans>Welcome to Project Wiz</Trans>
      </h1>

      {/* Dynamic text - use t function */}
      <Input
        placeholder={translate(t`Enter your email`)}
      />

      {/* Conditional messages */}
      <Button>
        {isLoading ? (
          <Trans>Loading...</Trans>
        ) : (
          <Trans>Submit</Trans>
        )}
      </Button>

      {/* Variables in translations */}
      <p>
        <Trans>
          Hello {userName}, you have {count} new messages
        </Trans>
      </p>
    </div>
  );
}

// ❌ NEVER write Portuguese directly
const message = "Bem-vindo ao Project Wiz"; // WRONG

// ✅ ALWAYS use English with LinguiJS
const message = t`Welcome to Project Wiz`; // CORRECT
```

### UI Components (shadcn/ui)

#### Using shadcn/ui Components

```typescript
// IMPORTANT: Never modify files in /components/ui/
// These are generated by shadcn/ui CLI

// ✅ CORRECT - Use existing components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ✅ CORRECT - Extend with custom classes
<Card className="border-2 border-primary/20 shadow-xl">
  <CardContent className="p-6">
    {/* Custom content */}
  </CardContent>
</Card>

// ✅ CORRECT - Create wrapper components
export function FeatureCard({
  children,
  highlight = false
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "ring-2 ring-primary" : ""}>
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  );
}

// ❌ WRONG - Don't create new components in /ui/
// Don't modify existing shadcn/ui components
```

---

## Development Patterns

### Authentication & Authorization

```typescript
// IPC handler with auth
import { requireAuth, requireRole } from "@/main/services/session-registry";

const handler = createIPCHandler({
  handler: async (input) => {
    // Basic authentication
    const user = requireAuth(); // Throws if not authenticated

    // Role-based authorization
    requireRole(user, "admin"); // Throws if not admin

    // Owner-based authorization
    const resource = await findResource(input.id);
    if (resource.ownerId !== user.id) {
      throw new Error("Access denied");
    }

    return performAction(input);
  },
});
```

### Event System (Main Process Only)

```typescript
// Emit events after state changes
eventBus.emit("project:created", {
  projectId: project.id,
  userId: user.id,
});

// Listen to events
eventBus.on("project:created", async ({ projectId }) => {
  await notifyTeamMembers(projectId);
});

// ❌ NEVER use EventBus in renderer
// ✅ Use TanStack Router invalidation instead
```

### Form Handling with Validation

```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

// Schema with custom error messages
const ProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name too long"),
  description: z
    .string()
    .max(500, "Description too long")
    .optional(),
  visibility: z.enum(["public", "private"]),
});

type ProjectFormData = z.infer<typeof ProjectSchema>;

export function ProjectForm({
  onSuccess
}: {
  onSuccess?: (data: Project) => void;
}) {
  const { t: translate } = useLingui();

  // Form setup
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      visibility: "private",
    },
  });

  // API mutation
  const createMutation = useApiMutation(
    (data: ProjectFormData) => window.api.project.create(data),
    {
      successMessage: "Project created successfully",
      onSuccess: (project) => {
        form.reset();
        onSuccess?.(project);
      },
      invalidateRouter: true,
    }
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans>Project Name</Trans>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={translate(t`Enter project name`)}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <Trans>Creating...</Trans>
          ) : (
            <Trans>Create Project</Trans>
          )}
        </Button>
      </form>
    </Form>
  );
}
```

### Data Fetching Patterns

```typescript
// ✅ PREFERRED - Route loader for initial data
// routes/projects.$projectId.tsx
export const Route = createFileRoute('/projects/$projectId')({
  loader: async ({ params }) => {
    const project = await window.api.project.get({
      id: params.projectId
    });
    return { project };
  },
  component: ProjectPage,
});

function ProjectPage() {
  const { project } = Route.useLoaderData();
  return <div>{project.name}</div>;
}

// ✅ OK - useQuery for dynamic data (avoid when possible)
function DynamicDataComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => window.api.notification.list(),
    refetchInterval: 30000, // Poll every 30s
  });

  if (isLoading) return <Spinner />;
  return <NotificationList data={data} />;
}

// ❌ AVOID - useQuery for data that can be in route loader
```

### Error Handling

```typescript
// IPC handler errors
const handler = createIPCHandler({
  handler: async (input) => {
    // Validation errors (automatic via Zod)

    // Business logic errors
    if (!isValidOperation(input)) {
      throw new Error("Invalid operation");
    }

    // Database errors (caught automatically)
    const result = await database.insert(data);

    return result;
  },
});

// React error boundaries
export function FeatureErrorBoundary({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <Card>
          <CardContent>
            <h2><Trans>Something went wrong</Trans></h2>
            <p>{error.message}</p>
            <Button onClick={reset}>
              <Trans>Try again</Trans>
            </Button>
          </CardContent>
        </Card>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

## Common Tasks

### Creating a New Feature

```bash
# 1. Create feature structure
mkdir -p src/renderer/features/my-feature/{components,hooks,utils}

# 2. Create schema
touch src/main/schemas/my-feature.schema.ts

# 3. Create IPC handlers
mkdir -p src/main/ipc/my-feature/{create,list,update,delete}
touch src/main/ipc/my-feature/queries.ts

# 4. Create types
touch src/shared/types/my-feature.ts

# 5. Create route
touch src/renderer/app/routes/my-feature.tsx

# 6. Run migrations if database changed
npm run db:generate
npm run db:migrate

# 7. Extract i18n strings
npm run extract
npm run compile
```

### Adding a New IPC Handler

```typescript
// 1. Create handler file
// src/main/ipc/my-domain/my-action/invoke.ts

// 2. Register in main process
// src/main/ipc/index.ts
import myHandler from "./my-domain/my-action/invoke";
ipcMain.handle("my-domain:my-action", myHandler);

// 3. Add type declaration
declare global {
  namespace WindowAPI {
    type MyDomain = {
      myAction: InferHandler<typeof myHandler>;
    };
  }
}

// 4. Use in renderer
const result = await window.api.myDomain.myAction(input);
```

### Working with Database

```typescript
// 1. Define schema
export const itemsTable = sqliteTable("items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  // ... other fields
});

// 2. Generate migration
npm run db:generate

// 3. Run migration
npm run db:migrate

// 4. Create queries
export async function createItem(data: InsertItem) {
  const db = getDatabase();
  const [item] = await db.insert(itemsTable).values(data).returning();
  return item;
}
```

---

## Quality Checklist

### Before Committing Code

```bash
# Run all quality checks
npm run quality:check
```

### Code Review Checklist

#### Structure

- [ ] Files under 500 lines
- [ ] Functions under 50 lines
- [ ] Proper file naming (.schema.ts, .hook.ts, etc.)
- [ ] Imports in correct order
- [ ] No circular dependencies

#### TypeScript

- [ ] Using `type` not `interface`
- [ ] Export on declaration
- [ ] No `export default` (except existing IPC handlers)
- [ ] Proper type exports for database schemas
- [ ] No `any` types

#### React

- [ ] Props destructured in parameters
- [ ] Using `useApiMutation` for API calls
- [ ] Form validation with Zod
- [ ] Proper hook dependencies
- [ ] No inline styles

#### i18n

- [ ] All UI text uses LinguiJS
- [ ] No Portuguese in code
- [ ] Translations extracted and compiled

#### Database

- [ ] Indexes on queried fields
- [ ] Using `timestamp_ms` for dates
- [ ] Soft delete where appropriate
- [ ] Transactions for complex operations

#### Security

- [ ] IPC handlers use `requireAuth()`
- [ ] Proper authorization checks
- [ ] Input validation with Zod
- [ ] No sensitive data in logs

#### Performance

- [ ] Route loaders for initial data
- [ ] Minimal `useEffect` usage
- [ ] Proper React memo usage
- [ ] Database query optimization

---

## Troubleshooting

### Common Issues

**Issue**: Type errors after schema changes

```bash
npm run db:generate
npm run type-check
```

**Issue**: Missing translations

```bash
npm run extract
npm run compile
```

**Issue**: IPC handler not found

- Check handler registration in `src/main/ipc/index.ts`
- Verify type declaration in handler file
- Ensure proper export/import

**Issue**: shadcn/ui component styling broken

- Don't modify files in `/components/ui/`
- Use Tailwind classes for customization
- Create wrapper components if needed

**Issue**: Database migration fails

- Check schema syntax
- Verify no breaking changes
- Consider data migration script

---

## Final Notes

1. **Always prioritize simplicity** - If you're writing complex code, step back and reconsider
2. **Follow existing patterns** - Consistency is more important than perfection
3. **Test your changes** - Run quality checks before committing
4. **Document complex logic** - Future developers (including Claude) will thank you
5. **Ask when uncertain** - It's better to clarify than to guess

Remember: This codebase values **maintainability**, **consistency**, and **simplicity** over clever solutions.
