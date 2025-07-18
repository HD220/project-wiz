# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Wiz** is a desktop application built with Electron that serves as an "autonomous software factory" using AI agents to automate software development workflows. The application enables collaboration between human developers and AI agents through a Discord-Like interface.

## Current Implementation Status

This application is in **active development** with the following components already implemented:

### ✅ Completed Features

- **Multi-account Authentication System** - Local authentication with JWT tokens
- **Database Schema** - Complete SQLite + Drizzle ORM implementation with all required tables
- **Backend Services** - Authentication, project, agent, and chat services
- **IPC Communication** - Type-safe communication between main and renderer processes
- **Frontend Authentication** - Login/Register pages with Zustand state management
- **Discord-like UI Structure** - Basic layout components and routing setup

### 🚧 In Progress Features

- **Agent Worker System** - Background AI workers for automated tasks
- **Chat Components** - Real-time messaging between users and agents
- **Project Management** - Full CRUD operations for projects and channels
- **Forum System** - Structured discussions within projects
- **Kanban Issues** - Task management with Git integration

## Core Architecture

### Technology Stack

- **Electron** - Desktop application framework
- **React 19** - Frontend with strict type safety
- **TypeScript** - Type-safe development throughout
- **Tailwind CSS** - Utility-first styling
- **Node.js** - Main process backend
- **SQLite + Drizzle ORM** - Type-safe database layer
- **TanStack Router** - File-based routing
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Zod** - Runtime validation
- **Shadcn/ui** - Component library
- **Vitest** - Testing framework
- **AI SDK** - LLM integrations (OpenAI, DeepSeek)

### KISS Principle (Keep It Simple, Stupid)

- **Simplicity above all else** - avoid over-engineering
- **Prefer simple solutions** to complex ones
- **One responsibility per function/class**
- **Avoid premature optimization**
- **Use clear, descriptive names** that eliminate need for comments
- **Break complex problems** into smaller, manageable pieces

### Clean Code Principles

- **Code should read like prose** - readable by humans
- **Functions should be small** and do one thing well
- **Use meaningful names** for variables, functions, and classes
- **No magic numbers** - use named constants
- **Consistent formatting** - use Prettier for automatic formatting
- **Error handling** - fail fast with clear error messages
- **No commented-out code** - remove dead code completely

### Boy Scout Rule

**"Always leave the campground cleaner than you found it"**

- **When touching existing code, improve it**
- **Refactor while you work** - don't leave technical debt
- **Extract duplicated code** into reusable functions
- **Simplify complex logic** when you encounter it
- **Update outdated patterns** to current standards
- **Remove unused imports, variables, and functions**
- **Improve variable names** to be more descriptive

## Development Patterns

### Implementation Guidelines

When working with this codebase, follow these patterns:

- **Use existing service layer patterns** - Follow the established AuthService pattern
- **Maintain type safety** - All IPC communication must be type-safe
- **Use the existing database schema** - Schema is complete and ready to use
- **Follow KISS principles** - Keep implementations simple and focused
- **Integrate with existing stores** - Use Zustand patterns already established

## Essential Commands

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
npm run test:watch
npm run test:coverage
```

### Code Quality

```bash
# Lint and fix code
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Format code
npm run format
npm run format:check

# Full quality check
npm run quality:check
```

### Database Operations

```bash
# Generate database migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open database studio
npm run db:studio

# Reset database
npm run db:reset
```

### Utilities

```bash
# Rebuild native dependencies
npm run rebuild

# Clean build artifacts
npm run clean

# Extract i18n messages
npm run extract

# Compile i18n messages
npm run compile
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Add required API keys:
   - `DEEPSEEK_API_KEY` - DeepSeek API key
   - `DB_FILE_NAME` - Database file name (optional)

## Current Architecture Implementation

### Directory Structure

```
src/
├── main/                           # Backend (Node.js/Electron)
│   ├── user/                      # User bounded context
│   │   ├── authentication/        # Auth handlers and services
│   │   ├── profile/              # User profile management
│   │   └── direct-messages/      # Direct messaging
│   ├── project/                   # Project bounded context
│   │   ├── channels/             # Channel management
│   │   ├── members/              # Project membership
│   │   ├── forums/               # Forum discussions
│   │   └── issues/               # Issue management
│   ├── conversations/             # Conversation bounded context
│   │   ├── channels/             # Channel chat
│   │   ├── direct-messages/      # Direct message chat
│   │   ├── routing/              # Message routing
│   ├── agents/                    # Agent bounded context
│   │   ├── worker/               # AI worker agents
│   │   └── queue/                # Job queue management
│   ├── database/                  # Database layer
│   │   ├── connection.ts         # Database connection
│   │   ├── schema/               # All schema definitions
│   │   └── migrations/           # Database migrations
│   ├── services/                  # Business logic services
│   ├── utils/                     # Backend utilities
│   └── main.ts                    # Application entry point
├── renderer/                      # Frontend (React)
│   ├── app/                      # TanStack Router pages
│   │   ├── login.tsx             # Authentication page
│   │   ├── (user)/               # User area routes
│   │   └── project/              # Project area routes
│   ├── components/                # Shared components
│   ├── store/                     # Zustand state management
│   │   ├── auth-store.ts         # Authentication state
│   │   ├── project-store.ts      # Project state
│   │   └── ui-store.ts           # UI state
│   └── utils/                     # Frontend utilities
```

### Database Schema

The application uses SQLite with Drizzle ORM and includes the following tables:

- **users** - User accounts with local authentication
- **agents** - AI agent definitions and configurations
- **projects** - Project containers (Discord-like servers)
- **channels** - Communication channels within projects
- **messages** - Unified messaging for channels and DMs
- **dm_conversations** - Direct message conversations
- **forum_topics** & **forum_posts** - Structured forum discussions
- **issues** & **issue_comments** - Kanban-style issue tracking
- **project_agents** & **project_users** - Relationship tables

### Authentication System

Complete multi-account authentication system with:

- **Local JWT authentication** - No external dependencies
- **Account creation and login** - Full user registration flow
- **Multi-user support** - Multiple accounts on same device
- **Session management** - Persistent login sessions
- **Security features** - Password hashing with bcrypt

### Services Layer

- **AuthService** - Complete authentication logic
- **ProjectService** - Project management operations
- **AgentService** - AI agent management
- **ChatService** - Messaging functionality
- **ChannelService** - Channel operations

### IPC Communication

Type-safe IPC handlers for:

- **Authentication** - Login, register, validate token
- **Projects** - CRUD operations for projects
- **Agents** - Agent management
- **Messages** - Chat functionality
- **Users** - User operations

## File Structure Rules

### TypeScript Path Aliases

```typescript
// Frontend aliases
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { AuthService } from "@/services/auth.service";

// Backend aliases
import { getDatabase } from "@/main/database/connection";
import { users } from "@/main/database/schema/users.schema";
```

## Code Quality Rules

### ESLint Configuration

The project uses comprehensive ESLint rules including:

- TypeScript strict rules
- React best practices
- Import/export organization
- Architectural boundaries enforcement

### Naming Conventions

- **Files**: `kebab-case` (e.g., `create-project.function.ts`)
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

// 3. Internal imports (ordered by path)
import { getDatabase } from "@/infrastructure/database";
import { ProjectName } from "@/main-domains/projects/value-objects/project-name";

// 4. Relative imports
import { validateProjectData } from "./validate-project-data";
```

## Database Schema

### Drizzle ORM Usage

```typescript
// Schema definition
export const projectsSchema = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Type inference
export type ProjectSchema = typeof projectsSchema.$inferSelect;
export type NewProjectSchema = typeof projectsSchema.$inferInsert;
```

### Migration Workflow

1. Modify/Create schema in `src/main/**/*.schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply migration
4. Update service layer if needed

## IPC Communication

### Handler Pattern

```typescript
// Main process handler setup
export function setupAuthHandlers(): void {
  ipcMain.handle("auth:login", async (event, data: LoginInput) => {
    try {
      const result = await AuthService.login(data);
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  });
}

// Service layer integration
export class AuthService {
  static async login(input: LoginInput): Promise<AuthResult> {
    const db = getDatabase();
    // Authentication logic...
  }
}
```

### Frontend API Usage

```typescript
// Zustand store integration
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      login: async (input: LoginInput) => {
        set({ isLoading: true, error: null });
        try {
          const result: AuthResponse = await window.api.auth.login(input);
          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
          });
        } catch (error) {
          set({ error: error.message });
        }
      },
    }),
    { name: "auth-storage" },
  ),
);

// React component usage
const { login, isLoading, error } = useAuthStore();
```

## Internationalization

### LinguiJS Setup

```typescript
// Extract messages
npm run extract

// Compile messages
npm run compile

// Usage in components
import { Trans } from "@lingui/macro";

<Trans>{"Welcome to Project Wiz"}</Trans>


```

## Deployment

### Building for Production

```bash
# Extract and compile i18n messages, then build
npm run build

# Package for distribution
npm run package

# Create distributable packages
npm run make
```

### Environment Variables

Production deployments should set:

- `DEEPSEEK_API_KEY` - Required for AI functionality
- `DB_FILE_NAME` - Custom database file location (optional)

## Troubleshooting

### Common Issues

1. **Database locked errors**: Ensure no other instances are running
2. **TypeScript errors**: Run `npm run type-check` for detailed errors
3. **IPC communication failures**: Check handler registration in `src/main/ipc/index.ts`
4. **Build failures**: Clear cache with `npm run clean`
5. **Authentication issues**: Check JWT_SECRET in environment variables

### Development Tips

- Use `npm run dev` for hot reloading
- Use `npm run test:watch` for continuous testing
- Use `npm run db:studio` for database inspection
- Check ESLint output for architectural violations
- Use the existing authentication system for testing (admin/admin123)

## Lessons Learned from Implementation

### Drizzle ORM Schema Patterns

**Schema Definition Best Practices:**

```typescript
// ✅ Correct - Use proper type inference
export type SelectUser = typeof usersTable.$inferSelect; // Has ALL fields including auto-generated
export type InsertUser = typeof usersTable.$inferInsert; // Excludes auto-generated fields (id, createdAt, updatedAt)
export type UpdateUser = Partial<InsertUser> & { id: string }; // Partial fields + required ID

// ❌ Avoid redundant manual type definitions when Drizzle provides inference
```

**Key Insights:**

- `$inferSelect` includes ALL fields (for reading from DB)
- `$inferInsert` automatically excludes auto-generated fields (for inserting to DB)
- Don't manually recreate types that Drizzle already provides
- Update types need the ID to identify which record to update

**Migration Workflow:**

1. Create schema file: `src/main/**/*.schema.ts`
2. Run `npm run db:generate` - Drizzle automatically detects schema files via config
3. The `drizzle.config.ts` with `schema: "./src/main/**/*.schema.ts"` handles everything
4. No manual schema registration needed in connection files

**Architecture Compliance:**

- Follow the established directory structure exactly as defined in architecture docs
- Implement one activity at a time from the development plan sequentially
- Don't create redundant abstractions when the framework already provides them

### Authentication Service Patterns

**Local Desktop Authentication Best Practices:**

```typescript
// ✅ Correct - Simple in-memory session for Electron apps
let currentUserId: string | null = null;

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    // Verify credentials with bcrypt
    const isValid = await bcrypt.compare(password, hash);

    // Set simple session
    currentUserId = user.id;

    return { user: userWithoutPassword };
  }

  static logout(): void {
    currentUserId = null;
  }
}

// ❌ Avoid JWT for local desktop applications
// JWT adds unnecessary complexity for single-user desktop apps
```

**Key Insights:**

- **JWT is overkill for local Electron apps** - designed for distributed systems
- **In-memory sessions are perfect** for desktop apps that restart when closed
- **Simpler authentication = fewer bugs** and easier maintenance
- **Still use bcrypt for password hashing** - essential for local security
- **Session persists only while app runs** - expected behavior for desktop apps

### IPC Handlers Implementation Patterns

**Handlers IPC de Autenticação (Atividade 1.3) - Implementado 2025-07-18:**

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
```

**Estrutura de Tipos Correta:**

```typescript
// ❌ ERRO CRÍTICO - Criar pasta shared/ que não existe na arquitetura
src / shared / types / auth.types.ts;

// ✅ CORRETO - Seguir estrutura definida na arquitetura
src / main / types.ts; // Tipos globais (IpcResponse)
src / main / user / authentication / auth.types.ts; // Tipos específicos do domínio
```

**Exposição IPC Type-Safe:**

```typescript
// preload.ts - Exposição da API
contextBridge.exposeInMainWorld("api", {
  auth: {
    login: (credentials: LoginCredentials): Promise<IpcResponse> =>
      ipcRenderer.invoke("auth:login", credentials),
  },
});

// window.d.ts - Tipagem global
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

**Aprendizados Críticos:**

1. **SEMPRE seguir arquitetura definida** - Não criar estruturas que não existem no plano
2. **IpcResponse como tipo global** - Reutilizável para todos os domínios futuros
3. **Organização por domínio** - Tipos específicos ficam no próprio domínio
4. **Registro centralizado** - Handlers registrados no main.ts via setup functions
5. **Type-safety completa** - Do backend até o frontend via preload.ts e window.d.ts

**Padrão para Próximos Handlers:**

- Criar `dominio.handlers.ts` no respectivo domínio
- Usar `IpcResponse<T>` de `@/main/types`
- Registrar via `setupDominioHandlers()` no main.ts
- Expor API tipada no preload.ts e window.d.ts
