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
│   ├── features/        # Features organized by domain
│   │   ├── auth/        # Authentication bounded context
│   │   ├── user/        # User bounded context  
│   │   ├── project/     # Project bounded context
│   │   ├── conversation/ # Conversation bounded context
│   │   ├── agent/       # Agent bounded context
│   │   └── git/         # Git integration
│   ├── database/        # Database layer
│   ├── types.ts         # Global types
│   ├── utils/           # Global utilities
│   └── main.ts          # Application entry point
├── renderer/            # Frontend (React)
│   ├── app/            # TanStack Router pages
│   ├── components/     # Shared components (NO /shared folder)
│   ├── features/       # Features organized by domain
│   │   ├── auth/       # Auth feature with components, store, hooks
│   │   ├── user/       # User feature  
│   │   ├── project/    # Project feature
│   │   └── app/        # General app components
│   ├── hooks/          # Global hooks
│   ├── store/          # Global store
│   ├── lib/            # Global utilities
│   ├── contexts/       # Global contexts
│   └── locales/        # Internationalization
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

### File Suffixes (with dots)

- **`.handler.ts`** - IPC handlers no main
- **`.service.ts`** - Serviços de negócio
- **`.store.ts`** - Stores Zustand
- **`.model.ts`** - Schemas Drizzle (database)
- **`.schema.ts`** - Schemas Zod (validação)
- **`.types.ts`** - Definições de tipos
- **`.api.ts`** - Camadas de API/IPC
- **`.hook.ts`** - Custom hooks (prefixo `use-`)
- **Components** - SEM sufixo (e.g., `login-form.tsx`, `user-profile.tsx`)

### Import Organization

```typescript
// 1. Node.js built-ins
import { readFile } from "fs/promises";

// 2. External libraries
import { z } from "zod";
import { drizzle } from "drizzle-orm";

// 3. Internal imports (use aliases)
import { getDatabase } from "@/main/database/connection";
import { usersTable } from "@/main/features/user/user.model";

// 4. Relative imports
import { validateUserData } from "./validate-user-data";
```

### TypeScript Path Aliases

```typescript
// Always use aliases, never relative imports
import { Button } from "@/renderer/components/ui/button";
import { useAuthStore } from "@/renderer/store/auth.store";
import { AuthService } from "@/main/features/auth/auth.service";
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

1. Create/modify schema in `src/main/features/**/*.model.ts`
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
// ✅ Correct - Types in model for reusability
// src/main/features/user/user.model.ts
export type Theme = "dark" | "light" | "system";

// ✅ Correct - Derived types using Omit
// src/main/features/auth/auth.types.ts
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
- NO shared folders - organize by features and global resources
- Use bounded context organization (DDD) within features/

### Critical Rules

1. **Always use path aliases** (`@/`) - never relative imports
2. **Services return data directly** - handlers do try/catch
3. **Use Drizzle type inference** - don't recreate types manually
4. **Follow bounded context structure** - don't mix domains
5. **Register handlers centrally** via setup functions in main.ts
6. **Use .model.ts for Drizzle, .schema.ts for Zod** - clear separation
7. **Components as function declarations** - never React.FC
8. **NO shared folders** - features/ for specific, globals in respective folders

## Development Flow

1. **Model First** - Define/modify database schema in `*.model.ts`
2. **Generate Migration** - `npm run db:generate`
3. **Apply Migration** - `npm run db:migrate`
4. **Validation Schema** - Create Zod schemas in `*.schema.ts`
5. **Service Layer** - Implement business logic in `*.service.ts`
6. **IPC Handlers** - Create type-safe handlers in `*.handler.ts`
7. **Frontend Integration** - Create `*.api.ts`, `*.store.ts`, `use-*.hook.ts`
8. **Components** - Build UI with function declarations and shadcn/ui
9. **Quality Check** - `npm run quality:check`

## Troubleshooting

- **Database locked**: Ensure no other instances running
- **TypeScript errors**: `npm run type-check` for details
- **IPC failures**: Check handler registration in main.ts
- **Build failures**: Clear cache with `npm run clean`
- **Auth issues**: Check credentials (admin/admin123 for testing)

## Best Practices

## Component Patterns

### React Components (Function Declaration)

```typescript
// ✅ CORRETO: Function declaration, sem React.FC, sem import React
interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

function LoginForm(props: LoginFormProps) {
  const { onSuccess, className } = props;
  // Component logic...
  
  return (
    <Card className={className}>
      {/* JSX content */}
    </Card>
  );
}

export { LoginForm };

// ❌ ERRADO: React.FC e import React
import React from 'react'; // NÃO IMPORTAR

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  className 
}) => {
  return <div>...</div>;
};
```

### shadcn/ui Integration

```typescript
// SEMPRE usar componentes shadcn/ui
import { Button } from "@/renderer/components/ui/button";
import { Input } from "@/renderer/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/renderer/components/ui/form";

// SEMPRE usar FormField pattern
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input {...field} placeholder="placeholder" />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// ❌ NUNCA usar HTML nativo quando existe componente shadcn/ui
<input {...register('fieldName')} /> // ERRADO
<button type="submit">Submit</button> // ERRADO
```

## Best Practices

- **Library Usage Best Practices**
  - Sempre utilizar ao maximo possivel funcionalidade das bibliotecas: zustand, tanstack, react hookforms, zod, components shadcn, etc. Evitar reeinventar a roda
  - **Components**: SEMPRE function declaration, NUNCA React.FC
  - **Forms**: SEMPRE usar shadcn/ui Form components
  - **UI**: SEMPRE usar shadcn/ui, NUNCA HTML nativo
