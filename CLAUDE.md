# CLAUDE.md

Project guidance for Claude Code when working with this repository.

## Project Overview

**Project Wiz** is an Electron desktop application serving as an "autonomous software factory" using AI agents to automate software development workflows. It enables collaboration between humans and AI agents through a Discord-like interface.

## Tech Stack

- **Electron** + **React 19** + **TypeScript** - Desktop framework with strict type safety
- **Tailwind CSS** + **Shadcn/ui** - Styling and component library
- **SQLite** + **Drizzle ORM** - Type-safe database layer
- **TanStack Router** + **TanStack Query** - Routing and server state
- **Zustand** + **Zod** - Client state and validation
- **AI SDK** - LLM integrations (OpenAI, DeepSeek)
- **Vitest** - Testing framework

## Development Principles

### **YAGNI** - You Aren't Gonna Need It

- **NO ABSTRACTIONS** until actually needed
- **NO FRAMEWORKS** for simple problems
- **NO PREMATURE OPTIMIZATION**
- **SOLVE TODAY'S PROBLEM** only

### KISS Principle

- **Simplicity above all** - avoid over-engineering
- **One responsibility per function/class**
- **Clear, descriptive names** that eliminate comments need
- **Prefer simple solutions** to complex ones

### Clean Code

- **Code reads like prose** - human readable
- **Small functions** doing one thing well
- **No magic numbers** - use named constants
- **Fail fast** with clear error messages
- **No commented-out code** - remove dead code

### Boy Scout Rule

**"Always leave code cleaner than you found it"**

- **Refactor while working** - don't leave technical debt
- **Extract duplicated code** into reusable functions
- **Simplify complex logic** when encountered
- **Remove unused imports/variables/functions**

## Essential Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run test:watch       # Watch tests

# Quality
npm run lint             # Lint and fix code
npm run type-check       # TypeScript checking
npm run format           # Format code
npm run quality:check    # Full quality check

# Database
npm run db:generate      # Generate migrations
npm run db:migrate       # Apply migrations
npm run db:studio        # Open database studio

# Environment
cp .env.example .env     # Setup environment
# Add DEEPSEEK_API_KEY
```

## Architecture

### Directory Structure

```
src/
├── main/                # Backend (Node.js/Electron)
│   ├── user/           # User bounded context
│   │   ├── authentication/  # Auth handlers and services
│   │   └── profile/         # User profile management
│   ├── project/        # Project bounded context
│   │   ├── channels/        # Channel management
│   │   ├── members/         # Project membership
│   │   └── issues/          # Issue management
│   ├── conversations/  # Conversation bounded context
│   ├── agents/         # Agent bounded context
│   ├── database/       # Database layer
│   └── main.ts         # Application entry point
├── renderer/           # Frontend (React)
│   ├── app/           # TanStack Router pages
│   ├── components/    # Shared components
│   └── store/         # Zustand state management
```

### Database Schema

SQLite with Drizzle ORM including:

- **users** - User accounts with local authentication
- **projects** - Project containers (Discord-like servers)
- **channels** - Communication channels within projects
- **messages** - Unified messaging for channels and DMs
- **agents** - AI agent definitions and configurations
- **issues** - Kanban-style issue tracking

## Code Quality Rules

### Naming Conventions

- **Files**: `kebab-case` (e.g., `create-project.service.ts`)
- **Variables/Functions**: `camelCase`
- **Classes/Types**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Database columns**: `snake_case`

### Import Organization

```typescript
// 1. Node.js built-ins
import { readFile } from "fs/promises";

// 2. External libraries
import { z } from "zod";
import { drizzle } from "drizzle-orm";

// 3. Internal imports (use aliases)
import { getDatabase } from "@/main/database/connection";
import { usersTable } from "@/main/user/authentication/users.schema";

// 4. Relative imports
import { validateUserData } from "./validate-user-data";
```

### TypeScript Path Aliases

```typescript
// Always use aliases, never relative imports
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { AuthService } from "@/main/user/authentication/auth.service";
```

## Database Patterns

### Schema Definition

```typescript
// ✅ Correct - Use type inference and custom types
export type ProjectStatus = "active" | "archived";

export const projectsTable = sqliteTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  status: text("status").$type<ProjectStatus>().notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Type inference - don't recreate manually
export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
export type UpdateProject = Partial<InsertProject> & { id: string };
```

### Migration Workflow

1. Create/modify schema in `src/main/**/*.schema.ts`
2. `npm run db:generate` - auto-detects via `drizzle.config.ts`
3. `npm run db:migrate` - applies migrations
4. Update service layer if needed

### Drizzle Query Syntax

```typescript
// ✅ Correct - Use db.select().from().where() with destructuring
const [user] = await db
  .select({ theme: usersTable.theme })
  .from(usersTable)
  .where(eq(usersTable.id, userId))
  .limit(1);

if (!user) {
  throw new Error("User not found");
}

// ❌ Avoid - db.query requires schema registration
const user = await db.query.usersTable.findFirst({
  where: eq(usersTable.id, userId),
});
```

## IPC Communication

### Handler Pattern

```typescript
// ✅ Correct IPC Handler Pattern
export function setupAuthHandlers(): void {
  ipcMain.handle(
    "auth:login",
    async (_, credentials: LoginCredentials): Promise<IpcResponse> => {
      try {
        const result = await AuthService.login(credentials);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Login failed",
        };
      }
    },
  );
}

// Services return data directly - handlers do try/catch
export class AuthService {
  static async login(input: LoginInput): Promise<AuthResult> {
    const db = getDatabase();
    // Authentication logic...
    return { user: userWithoutPassword };
  }
}

// ✅ Correct ProjectService Pattern
export class ProjectService {
  static async create(input: InsertProject): Promise<SelectProject> {
    const db = getDatabase();

    const [newProject] = await db
      .insert(projectsTable)
      .values(input)
      .returning();

    if (!newProject) {
      throw new Error("Failed to create project");
    }

    return newProject; // Return data directly
  }

  static async findById(id: string): Promise<SelectProject | null> {
    const db = getDatabase();

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id))
      .limit(1);

    return project || null;
  }
}
```

### Type-Safe API Exposure

```typescript
// preload.ts - API exposure
contextBridge.exposeInMainWorld("api", {
  auth: {
    login: (credentials: LoginCredentials): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:login", credentials),
  },
});

// window.d.ts - Global typing
declare global {
  interface Window {
    api: {
      auth: {
        login: (credentials: LoginCredentials) => Promise<IpcResponse>;
      };
    };
  }
}
```

### Frontend Integration

```typescript
// Zustand store integration
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      login: async (input: LoginInput) => {
        set({ isLoading: true, error: null });
        try {
          const result = await window.api.auth.login(input);
          set({ user: result.user, isAuthenticated: true });
        } catch (error) {
          set({ error: error.message });
        }
      },
    }),
    { name: "auth-storage" },
  ),
);
```

## Type Organization

### Global Types

```typescript
// src/main/types.ts - Global types
export interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Domain Types

```typescript
// ✅ Correct - Types in schema for reusability
// src/main/user/authentication/users.schema.ts
export type Theme = "dark" | "light" | "system";

// ✅ Correct - Derived types using Omit
// src/main/user/authentication/auth.types.ts
export type AuthenticatedUser = Omit<SelectUser, "passwordHash">;
export type RegisterUserInput = Omit<InsertUser, "passwordHash"> & {
  password: string;
};
```

## Authentication Patterns

### Local Desktop Authentication

```typescript
// ✅ Correct - Simple in-memory session for Electron
let currentUserId: string | null = null;

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Verify with bcrypt
    const isValid = await bcrypt.compare(password, hash);

    // Set simple session
    currentUserId = user.id;

    return { user: userWithoutPassword };
  }

  static logout(): void {
    currentUserId = null;
  }
}

// ❌ Avoid JWT for local desktop apps - unnecessary complexity
```

## Key Principles

### Follow Established Patterns

- Use existing service layer patterns (AuthService example)
- Maintain type safety throughout IPC communication
- Leverage existing database schema
- Integrate with established Zustand patterns

### Architecture Compliance

- Follow directory structure exactly as defined
- Don't create redundant abstractions when framework provides them
- Organize types by domain, not in shared folders
- Use bounded context organization (DDD)

### Critical Rules

1. **Always use path aliases** (`@/`) - never relative imports
2. **Services return data directly** - handlers do try/catch
3. **Use Drizzle type inference** - don't recreate types manually
4. **Follow bounded context structure** - don't mix domains
5. **Register handlers centrally** via setup functions in main.ts
6. **Define types in schemas** for cross-domain reusability

## Development Flow

1. **Schema First** - Define/modify database schema
2. **Generate Migration** - `npm run db:generate`
3. **Apply Migration** - `npm run db:migrate`
4. **Service Layer** - Implement business logic
5. **IPC Handlers** - Create type-safe handlers
6. **Frontend Integration** - Update stores and components
7. **Quality Check** - `npm run quality:check`

## Troubleshooting

- **Database locked**: Ensure no other instances running
- **TypeScript errors**: `npm run type-check` for details
- **IPC failures**: Check handler registration in main.ts
- **Build failures**: Clear cache with `npm run clean`
- **Auth issues**: Check credentials (admin/admin123 for testing)

## Best Practices

- **Library Usage Best Practices**
  - Sempre utilizar ao maximo possivel funcionalidade das bibliotecas: zustand, tanstack, react hookforms, zod, components shadcn, etc. Evitar reeinventar a roda