# CLAUDE.md

**Project Wiz Development Guide**

This file provides comprehensive guidance for Claude Code when working with the Project Wiz codebase.

## Project Overview

**Project Wiz** is a desktop application that automates the software development lifecycle using AI Agents. It combines artificial intelligence with project management to revolutionize software development through customizable AI agents, team collaboration, and integration with multiple LLM providers.

### Core Features
- **Intelligent AI Agents**: Create assistants with specific roles, backstories, and goals
- **Multi-Provider LLM Support**: OpenAI, Anthropic, DeepSeek, Google, and custom providers
- **Advanced Project Management**: Git integration, team collaboration, organized channels
- **Integrated Communication**: Project channels, direct messaging, AI chat
- **Enterprise Security**: Local SQLite database, API key encryption, secure authentication

### Target Users
- **Developers**: Automate code reviews, configure specialized assistants, manage multiple projects
- **Teams**: Create specialized agents, centralize project communication, maintain decision history
- **Enterprises**: Local deployment, corporate AI providers, permission management

## Architecture Overview

### Multi-Process Electron Architecture
```
src/
├── main/           # Node.js backend (IPC handlers, database, system operations)
├── renderer/       # React frontend (TanStack Router, UI components)
├── shared/         # Common types, utilities, services
└── worker/         # Background job processing (currently disabled)
```

### Key Architectural Components

**IPC Communication**: Domain-based handlers in `src/main/ipc/` following the pattern:
```
{domain-name}/
├── {action-name}/
│   └── invoke.ts
└── queries.ts
```

**Database**: SQLite with Drizzle ORM. Schemas in `src/main/schemas/`. Timestamps use `timestamp_ms` (integer)

**Frontend Structure**:
- File-based routing with TanStack Router in `src/renderer/app/`
- Feature-based organization in `src/renderer/features/`
- Shared UI components using shadcn/ui in `src/renderer/components/ui/` (generated, do not modify)

**Event System**: Type-safe EventBus for cross-process communication

### Technology Stack
- **Frontend**: React 19, TanStack Router, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Electron, Drizzle ORM, SQLite, Node.js
- **AI Integration**: Vercel AI SDK with multiple provider support
- **Build Tools**: Vite, Electron Forge, TypeScript, ESLint
- **Testing**: Vitest, Testing Library
- **I18n**: LinguiJS for translations (Portuguese and English)
- **UI Components**: shadcn/ui (built on Radix UI + Tailwind CSS)

## Development Commands

### Core Commands
```bash
# Code Quality (available via Bash tool)
npm run lint            # ESLint check
npm run lint:fix        # ESLint with auto-fix
npm run type-check      # TypeScript type checking
npm run format          # Prettier format
npm run format:check    # Check Prettier formatting
npm run quality:check   # Run all quality checks

# Database (available via Bash tool)
npm run db:generate     # Generate Drizzle migrations after schema changes
npm run db:migrate      # Run database migrations

# Internationalization (available via Bash tool)
npm run extract         # Extract i18n strings from code
npm run compile         # Compile translations to TypeScript

# Development (user-initiated)
npm run dev             # Start Electron app with hot reload
npm run build           # Extract i18n, compile translations, build app
npm run package         # Create distributable package
```

## Coding Style Guidelines

### File Naming Conventions

**General Rules**:
- Use kebab-case for files and directories
- Use descriptive suffixes for file types
- Group related files in directories

**File Suffixes**:
```
*.schema.ts        # Zod schemas and database schemas
*.types.ts         # Type definitions and interfaces
*.hook.ts          # Custom React hooks
*.action.ts        # Server actions and mutations
*.utils.ts         # Utility functions
*.constants.ts     # Application constants
*.config.ts        # Configuration files
```

**Language Guidelines**:
```typescript
// ✅ All code, UI text, and messages should be in English
export const WELCOME_MESSAGE = "Welcome to Project Wiz";
export const ERROR_MESSAGES = {
  INVALID_EMAIL: "Please enter a valid email address",
  REQUIRED_FIELD: "This field is required"
};

// ✅ Use LinguiJS for user-facing text that needs translation
import { msg } from "@lingui/macro";

export const welcomeText = msg`Welcome to Project Wiz`;
export const errorMessage = msg`Please enter a valid email address`;

// ❌ Do not write Portuguese directly in code
const mensagemBemVindo = "Bem-vindo ao Project Wiz"; // WRONG

// ❌ Avoid export default
export default ERROR_MESSAGES; // WRONG

// ✅ Always export on declaration
export const API_CONFIG = { baseUrl: "..." };
```

**Component Files**:
```
{feature-name}/
├── components/
│   ├── {feature-name}-form.tsx
│   ├── {feature-name}-list.tsx
│   └── index.ts          # Re-exports
├── hooks/
│   └── use-{feature-name}.hook.ts
├── utils/
│   └── {feature-name}.utils.ts
├── {feature-name}.schema.ts
├── {feature-name}.types.ts
└── index.ts
```

### TypeScript Conventions

**Naming**:
- **Variables/Functions**: camelCase (`getUserData`, `isLoading`)
- **Types/Interfaces**: PascalCase (`UserData`, `ApiResponse`)
- **Constants**: UPPER_CASE (`API_BASE_URL`, `DEFAULT_TIMEOUT`)
- **Enums**: PascalCase with PascalCase members (`Status.Active`)

**Type Definitions**:
```typescript
// Prefer interfaces for object shapes
interface UserConfig {
  name: string;
  email: string;
  preferences?: UserPreferences;
}

// Use type for unions, primitives, and complex types
type Status = "active" | "inactive" | "pending";
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

// Use const assertions for immutable data
const PROVIDERS = ["openai", "anthropic", "deepseek"] as const;
type Provider = typeof PROVIDERS[number];

// Prefer utility types for transformations
type CreateUser = Omit<User, "id" | "createdAt" | "updatedAt">;
type UpdateUser = Partial<CreateUser> & { id: string };
```

**Import Organization**:
```typescript
// 1. Node.js built-ins
import fs from "fs";
import path from "path";

// 2. React imports (avoid default React import)
import { useEffect, useState, useCallback } from "react";

// 3. External libraries (alphabetical)
import { z } from "zod";

// 4. Internal imports with aliases (avoid relative paths)
import { eventBus } from "@/shared/services/events/event-bus";
import { createAgent } from "@/main/ipc/agent/queries";
import { Button } from "@/components/ui/button";

// 5. Type imports (last, with 'type' keyword)
import type { Agent } from "@/shared/types/agent";
import type { ComponentProps } from "react";
```

### React Component Patterns

**Component Structure**:
```typescript
// 1. Imports (avoid default React import, use aliases)
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";

import { useAuth } from "@/contexts/auth.context";
import { useApiMutation } from "@/hooks/use-api-mutation.hook";

// 2. Types (inline for component-specific types)
interface ComponentProps {
  data: Data[];
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

// 3. Component implementation with destructured props
export function Component({ data, onSubmit, isLoading = false }: ComponentProps) {
  // 4. Hooks (in order: state, refs, context, custom hooks)
  const [state, setState] = useState();
  const ref = useRef<HTMLElement>(null);
  const { user } = useAuth();
  
  // Use useApiMutation for form submissions and actions
  const mutation = useApiMutation(
    (formData: FormData) => window.api.example.create(formData),
    {
      successMessage: "Created successfully",
      onSuccess: onSubmit,
    }
  );
  
  // 5. Event handlers
  function handleClick() {
    // Implementation
  }
  
  // 6. Effects
  useEffect(() => {
    // Implementation
  }, []);
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

**Custom Hooks**:
```typescript
// Use descriptive names with 'use' prefix, export on declaration
export function useAgentActions() {
  const mutation = useApiMutation(
    (agentId: string) => window.api.agent.inactivate({ id: agentId }),
    {
      successMessage: "Agent inactivated successfully",
      errorMessage: "Failed to inactivate agent",
      invalidateRouter: true,
    }
  );
  
  const handleAction = useCallback((id: string) => {
    mutation.mutate(id);
  }, [mutation]);
  
  return {
    handleAction,
    isLoading: mutation.isPending,
  };
}
```

**Compound Components**:
```typescript
// Use compound component pattern for complex components, destructure props
export function AgentForm({ initialData, providers, onSubmit, isLoading }: AgentFormProps) {
  return (
    <Form>
      <AgentFormIdentity initialData={initialData} />
      <AgentFormProvider providers={providers} />
    </Form>
  );
}

// Co-locate compound components, export on declaration
export function AgentFormIdentity({ initialData }: IdentityProps) {
  // Implementation
}
```

### Database Patterns

**Schema Definitions**:
```typescript
import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").unique().notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    // Performance indexes
    emailIdx: index("users_email_idx").on(table.email),
  }),
);

// Type inference
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type UpdateUser = Partial<InsertUser> & { id: string };
```

**Query Functions**:
```typescript
// ✅ Use descriptive function names, export on declaration
export async function findUserById(id: string): Promise<User | null> {
  const db = getDatabase();
  
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
    
  return user || null;
}

// ✅ Use transactions for complex operations, export on declaration
export async function createUserWithProfile(data: CreateUserData): Promise<User> {
  const db = getDatabase();
  
  return db.transaction((tx) => {
    // Implementation
  });
}
```

### IPC Handler Patterns

**Handler Structure**:
```typescript
// File: src/main/ipc/{domain-name}/{action-name}/invoke.ts
import { createIPCHandler } from "@/shared/utils/create-ipc-handler";
import { requireAuth } from "@/main/services/session-registry";

const InputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const OutputSchema = UserSchema;

const handler = createIPCHandler({
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  handler: async (input) => {
    const currentUser = requireAuth();
    
    // Business logic
    const result = await createUser({
      ...input,
      ownerId: currentUser.id,
    });
    
    // Event emission
    eventBus.emit("user:created", { userId: result.id });
    
    return result;
  },
});

// ✅ Export on declaration (preferred pattern)
// Note: Existing codebase uses export default for handlers, but export on declaration is preferred
export const handler = createIPCHandler({
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  handler: async (input) => {
    const currentUser = requireAuth();
    
    // Business logic
    const result = await createUser({
      ...input,
      ownerId: currentUser.id,
    });
    
    // Event emission
    eventBus.emit("user:created", { userId: result.id });
    
    return result;
  },
});

export default handler;

// Type declaration
declare global {
  namespace WindowAPI {
    interface User {
      create: InferHandler<typeof handler>;
    }
  }
}
```

### Styling Conventions

**shadcn/ui Components**:
```typescript
// Use existing shadcn/ui components (DO NOT modify files in components/ui/)
import { Button } from "@/renderer/components/ui/button";
import { Card, CardHeader, CardContent } from "@/renderer/components/ui/card";

// Extend with additional classes if needed
<Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-primary/0">
  <CardHeader className="pb-[var(--spacing-component-md)]">
    {/* Content */}
  </CardHeader>
</Card>

// Use semantic color tokens and variants
<Button variant="default" size="default">
  Submit
</Button>
```

**Custom Components**:
```typescript
// Create custom components outside of components/ui/
// Use shadcn/ui as building blocks
export function CustomFeatureCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="custom-feature-styles">
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
```

**CSS Variables** (in globals.css):
```css
:root {
  /* Spacing */
  --spacing-component-sm: 0.5rem;
  --spacing-component-md: 1rem;
  --spacing-component-lg: 1.5rem;
  --spacing-layout-md: 2rem;
  
  /* Colors - use HSL format */
  --primary: 210 100% 50%;
  --primary-foreground: 0 0% 100%;
}
```

### Error Handling Patterns

**IPC Handlers**:
```typescript
// Errors are automatically handled by createIPCHandler
const handler = createIPCHandler({
  // configuration
  handler: async (input) => {
    // Throw errors directly - they will be caught and formatted
    if (!input.email) {
      throw new Error("Email is required");
    }
    
    return result;
  },
});
```

**React Components**:
```typescript
// ❌ Avoid useQuery when data can be fetched at route level
// ✅ Use TanStack Router loaders instead for better performance
export function Component({ data }: { data: User[] }) {
  // Data comes from route loader
  
  return <div>{/* Content with data */}</div>;
}

// Route file example:
// export const Route = createFileRoute('/users/')({
//   loader: () => window.api.user.list(),
//   component: UsersPage,
// })
```


## Key Development Patterns

### Feature Development Workflow

1. **Domain Analysis**: Understand the business domain and entities by examining existing code
2. **Schema Design**: Create database schemas in `src/main/schemas/` and Zod validation schemas
3. **IPC Handlers**: Implement backend logic in `src/main/ipc/{domain-name}/` with proper validation
4. **Type Definitions**: Define shared types in `src/shared/types/`
5. **React Components**: Build UI components in `src/renderer/features/{feature-name}/` following established patterns
6. **Custom Hooks**: Extract business logic into reusable hooks in feature directories
7. **Quality Checks**: Run `npm run lint`, `npm run type-check`, and `npm run format` via Bash tool

### Authentication Pattern

All IPC handlers requiring authentication should use:
```typescript
import { requireAuth } from "@/main/services/session-registry";

const handler = createIPCHandler({
  // configuration
  handler: async (input) => {
    const currentUser = requireAuth(); // Throws if not authenticated
    
    // Use currentUser.id for ownership checks
    return await doSomething({ ...input, ownerId: currentUser.id });
  },
});
```

### Event-Driven Architecture

**Main Process Only** - EventBus for IPC communication:
```typescript
// Main process - Emit events after significant operations
eventBus.emit("agent:created", { agentId: agent.id });
eventBus.emit("user:updated", { userId: user.id });

// ❌ Do NOT use EventBus in renderer process
// ✅ Use TanStack Router invalidation and useApiMutation instead
```

### Internationalization Pattern

All user-facing text must use LinguiJS with Trans component or useLingui hook:
```typescript
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export function Component({ userName }: { userName: string }) {
  const { t } = useLingui();
  
  return (
    <div>
      {/* Static text with Trans component */}
      <h1><Trans>Welcome to Project Wiz</Trans></h1>
      
      {/* Dynamic text with t function */}
      <p>{t`Hello, ${userName}!`}</p>
      
      {/* Form placeholders and labels */}
      <Input placeholder={t`Enter your email`} />
      
      {/* Error messages */}
      <FormMessage>{t`This field is required`}</FormMessage>
    </div>
  );
}

// ❌ NEVER write Portuguese directly in code
const errorMessage = "Este campo é obrigatório"; // WRONG

// ✅ Always use English in code, Portuguese comes from translations
const errorMessage = t`This field is required`; // CORRECT
```

### Form Handling Pattern

Use react-hook-form with Zod and useApiMutation:
```typescript
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";

import { useApiMutation } from "@/hooks/use-api-mutation.hook";

const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
});

export function MyForm({ onSuccess }: { onSuccess?: () => void }) {
  const { t } = useLingui();
  
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });
  
  // Use useApiMutation for form submissions
  const createMutation = useApiMutation(
    (data: z.infer<typeof FormSchema>) => window.api.user.create(data),
    {
      successMessage: "User created successfully",
      errorMessage: "Failed to create user",
      onSuccess,
      invalidateRouter: true,
    }
  );
  
  function handleSubmit(data: z.infer<typeof FormSchema>) {
    createMutation.mutate(data);
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel><Trans>Name</Trans></FormLabel>
              <FormControl>
                <Input placeholder={t`Enter your name`} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? t`Creating...` : t`Create User`}
        </Button>
      </form>
    </Form>
  );
}
```

## Code Quality Rules

### Design Principles

**KISS (Keep It Simple, Stupid)**:
- Write simple, readable code over clever solutions
- Prefer straightforward implementations over complex abstractions
- Use clear variable names and simple logic flows
- Break complex problems into smaller, manageable functions
- Avoid premature optimization

**YAGNI (You Aren't Gonna Need It)**:
- Only implement features that are currently needed
- Don't add functionality for potential future requirements
- Remove unused code, imports, and dependencies
- Avoid over-engineering solutions
- Start with the simplest implementation that works

```typescript
// ✅ KISS - Simple and clear
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Over-engineered for current needs
export class AdvancedCalculationEngine {
  private strategies: Map<string, CalculationStrategy> = new Map();
  private cache: WeakMap<Item[], number> = new WeakMap();
  
  public calculateWithStrategy(items: Item[], strategy: string): number {
    // Complex implementation for simple sum
  }
}

// ✅ YAGNI - Only what's needed now
interface CreateUserInput {
  name: string;
  email: string;
}

// ❌ YAGNI violation - adding fields "just in case"
interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;          // Not needed yet
  address?: Address;       // Not needed yet
  preferences?: UserPrefs; // Not needed yet
  metadata?: unknown;      // Definitely not needed
}
```

### ESLint Configuration Highlights

- **TypeScript**: Strict naming conventions, no `any`, explicit return types
- **React**: Hooks rules, JSX accessibility, avoid default React import
- **Import Order**: Enforced import grouping, prefer aliases over relative paths
- **Code Complexity**: Max function length (150 lines), max depth (4), max statements (50)
- **Architecture Boundaries**: Renderer cannot import main process code except types
- **Component Props**: Destructure props in function parameters, not inside component
- **Exports**: Always use export on declaration, avoid export default (existing handlers use export default but should be migrated)
- **Language**: All code and UI text in English, Portuguese only via LinguiJS translations

### Prettier Configuration

- **Line Length**: 80 characters
- **Tabs**: 2 spaces
- **Semicolons**: Always
- **Quotes**: Double quotes
- **Trailing Commas**: ES5

### TypeScript Configuration

- **Strict Mode**: Enabled with additional safety checks
- **Path Mapping**: Configured for clean imports (`@/components/*`, `@/lib/*`)
- **Library Support**: ES2024, DOM, Vitest globals
- **Safety Checks**: `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`

## Common Patterns Reference

### Database Relationship Patterns
- **User-Agent**: Agents extend users table with additional fields
- **Project-Channel**: Channels belong to projects with proper foreign keys
- **Provider-Agent**: Agents reference LLM providers for AI functionality

### UI Component Patterns
- **shadcn/ui Components**: Use existing components from `src/renderer/components/ui/` (DO NOT modify these files)
- **Custom Components**: Create application-specific components in feature directories or `src/renderer/components/`
- **Compound Components**: Complex forms broken into logical sections
- **Form Components**: Standardized form fields with validation using shadcn/ui primitives

### State Management Patterns
- **TanStack Query**: Server state management with caching
- **React Hook Form**: Form state with validation
- **Zustand**: Client state when needed (currently minimal usage)

### Error Boundary Patterns
- **IPC Error Handling**: Centralized error formatting in `createIPCHandler`
- **React Error Boundaries**: Graceful error recovery in UI
- **Validation Errors**: Zod schema validation with user-friendly messages

---

## Quick Reference

**Always run before completing changes:**
```bash
npm run quality:check   # Available via Bash tool
```

**Common file operations:**
```bash
# Create new feature
mkdir -p src/renderer/features/{feature-name}/{components,hooks,utils}

# Generate database migration after schema changes
npm run db:generate

# Extract and compile translations after adding new text
npm run extract && npm run compile

# Database is SQLite binary file, use queries to read data
# Database location: project-wiz.db
```

**Architecture reminders:**
- IPC handlers in `src/main/ipc/{domain-name}/{action-name}/invoke.ts`
- Shared types in `src/shared/types/`
- Feature components in `src/renderer/features/{feature-name}/components/`
- Database schemas in `src/main/schemas/`
- Use shadcn/ui components from `src/renderer/components/ui/` (DO NOT create or modify)
- Create custom components in feature directories or `src/renderer/components/`