# Project Wiz: Padrões de Código e Convenções

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17

---

## 🎯 Filosofia dos Padrões

Os padrões do Project Wiz seguem três princípios fundamentais:

1. **KISS (Keep It Simple, Stupid)** - Simplicidade acima de tudo
2. **Clean Code** - Código legível como prosa
3. **Consistency** - Convenções uniformes em todo o projeto

> **"Qualquer tolo pode escrever código que um computador entende. Bons programadores escrevem código que humanos entendem."** - Martin Fowler

---

## 📁 Convenções de Nomenclatura

### Arquivos e Diretórios

```typescript
// ✅ Correto - kebab-case para arquivos
user - service.ts;
project - card.tsx;
use - auth.ts;
auth - store.ts;
message - item.tsx;

// ❌ Incorreto
userService.ts;
ProjectCard.tsx;
useAuth.ts;
authStore.ts;
MessageItem.tsx;
```

### Variáveis e Funções

```typescript
// ✅ Correto - camelCase
const userName = "john";
const isUserActive = true;
function calculateTotal() {}
const sendMessage = async () => {};

// ❌ Incorreto
const user_name = "john";
const IsUserActive = true;
function CalculateTotal() {}
const send_message = async () => {};
```

### Classes e Tipos

```typescript
// ✅ Correto - PascalCase
class UserService {}
interface ProjectData {}
type AgentStatus = "online" | "offline";
enum MessageType {}

// ❌ Incorreto
class userService {}
interface projectData {}
type agentStatus = "online" | "offline";
enum messageType {}
```

### Constantes

```typescript
// ✅ Correto - SCREAMING_SNAKE_CASE para constantes globais
const API_BASE_URL = "https://api.example.com";
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;

// ✅ Correto - camelCase para constantes locais
const defaultOptions = { timeout: 5000 };
const validStatuses = ["online", "offline"];
```

### Componentes React

```typescript
// ✅ Correto - PascalCase + descriptive names
export function ProjectCard() {}
export function ChatInput() {}
export function AgentAvatar() {}
export function MessageList() {}

// ❌ Incorreto
export function projectCard() {}
export function card() {}
export function Component1() {}
export function Comp() {}
```

---

## 🏗️ Estrutura de Código

### Organização de Imports

```typescript
// 1. Node.js built-ins
import { readFile } from "fs/promises";
import path from "path";

// 2. External libraries (alfabética)
import { eq } from "drizzle-orm";
import { z } from "zod";
import React, { useState, useEffect } from "react";

// 3. Internal imports (por camada)
import { db } from "@/infrastructure/database";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

// 4. Relative imports
import { validateInput } from "./utils";
import { MessageItem } from "../message-item";

// 5. Type-only imports (separados)
import type { User } from "@/shared/types/user";
import type { Project } from "@/shared/types/project";
```

### Estrutura de Domain Functions (KISS Approach)

```typescript
// ✅ Simple domain functions instead of complex classes
export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  // 1. Validação de entrada
  const validated = CreateProjectSchema.parse(input);

  // 2. Verificações de negócio
  await validateProjectBusinessRules(validated);

  // 3. Operação principal
  const db = getDatabase();
  const project = await db
    .insert(projects)
    .values({
      id: generateId(),
      ...validated,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  // 4. Efeitos colaterais (eventos)
  publishEvent("project.created", project[0]);

  return project[0];
}

// ✅ Support functions are simple and focused
async function validateProjectBusinessRules(
  data: CreateProjectInput,
): Promise<void> {
  // Simple validation logic
  if (await projectNameExists(data.name)) {
    throw new ValidationError("Project name already exists");
  }
}

async function projectNameExists(name: string): Promise<boolean> {
  const db = getDatabase();
  const existing = await db.query.projects.findFirst({
    where: eq(projects.name, name),
  });
  return !!existing;
}
```

### Transparent Infrastructure Access

```typescript
// ✅ Simple utility functions for infrastructure
import { getDatabase } from "@/infrastructure/database";
import { getLogger } from "@/infrastructure/logger";
import { publishEvent } from "@/infrastructure/events";

// ✅ Use directly in domain functions
export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const logger = getLogger("projects");
  const db = getDatabase();

  logger.info("Updating project", { id, input });

  const updated = await db
    .update(projects)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();

  publishEvent("project.updated", updated[0]);

  return updated[0];
}
```

### Estrutura de Component

```typescript
// Template padrão para componentes React
interface ComponentProps {
  // Props sempre tipadas com interface
  requiredProp: string;
  optionalProp?: boolean;
  onAction?: (data: ActionData) => void;
}

export function ComponentName({
  requiredProp,
  optionalProp = false,
  onAction
}: ComponentProps) {
  // 1. Hooks (sempre no topo)
  const [state, setState] = useState(initialValue);
  const { data, loading } = useCustomHook();

  // 2. Event handlers
  const handleAction = useCallback((data: ActionData) => {
    // Lógica do handler
    onAction?.(data);
  }, [onAction]);

  // 3. Effects
  useEffect(() => {
    // Setup/cleanup
  }, [dependencies]);

  // 4. Early returns
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!data) {
    return <EmptyState />;
  }

  // 5. Render principal
  return (
    <div className="component-container">
      {/* JSX estruturado e legível */}
      <ComponentHeader title={requiredProp} />
      <ComponentBody data={data} onAction={handleAction} />
    </div>
  );
}
```

---

## 🔍 Principles Aplicados

### KISS (Keep It Simple, Stupid)

```typescript
// ❌ Over-engineered
class UserValidatorFactory {
  static createValidator(type: "email" | "username"): UserValidator {
    switch (type) {
      case "email":
        return new EmailValidator();
      case "username":
        return new UsernameValidator();
      default:
        throw new Error("Unknown validator");
    }
  }
}

// ✅ Simple solution
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateUsername = (username: string): boolean => {
  return username.length >= 3 && username.length <= 20;
};
```

### Clean Code - Functions

```typescript
// ❌ Unclear and complex
function proc(u: any, p: any): boolean {
  if (u && u.id && p && p.id) {
    if (u.role === "owner" || u.role === "admin") {
      if (p.status === "active") {
        return true;
      }
    }
  }
  return false;
}

// ✅ Clear and readable
function canUserAccessProject(user: User, project: Project): boolean {
  if (!user?.id || !project?.id) {
    return false;
  }

  const hasPermission = user.role === "owner" || user.role === "admin";
  const projectIsActive = project.status === "active";

  return hasPermission && projectIsActive;
}
```

### Clean Code - Error Handling

```typescript
// ❌ Silent failures
function parseUserData(data: string) {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// ✅ Explicit error handling
function parseUserData(data: string): User {
  try {
    const parsed = JSON.parse(data);
    return UserSchema.parse(parsed);
  } catch (error) {
    throw new ValidationError(`Invalid user data: ${error.message}`);
  }
}
```

---

## 📝 Padrões de TypeScript

### Type Definitions

```typescript
// ✅ Preferred - Interface para objetos
interface User {
  id: string;
  name: string;
  email?: string;
}

// ✅ Type para unions e computações
type UserStatus = "active" | "inactive" | "pending";
type UserWithStatus = User & { status: UserStatus };

// ✅ Generic constraints
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>;
  create(item: Omit<T, "id">): Promise<T>;
}
```

### Utility Types

```typescript
// ✅ Use utility types para transformações
type CreateUserInput = Omit<User, "id" | "createdAt">;
type UpdateUserInput = Partial<Pick<User, "name" | "email">>;
type UserResponse = Required<Pick<User, "id" | "name">> & {
  status: UserStatus;
};
```

### Type Guards

```typescript
// ✅ Type guards para validação runtime
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" && obj !== null && "id" in obj && "name" in obj
  );
}

// ✅ Usage with type narrowing
function processUser(data: unknown): void {
  if (!isUser(data)) {
    throw new Error("Invalid user data");
  }

  // data is now typed as User
  console.log(data.name);
}
```

---

## ⚛️ React Patterns

### Custom Hooks

```typescript
// ✅ Hook focused on single responsibility
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = useCallback(async (credentials: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login(credentials);
      setUser(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
```

### Component Composition

```typescript
// ✅ Composition over inheritance
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="card-content">{children}</div>;
}

// Usage
<Card>
  <CardHeader>
    <h2>Project Name</h2>
  </CardHeader>
  <CardContent>
    <p>Project description</p>
  </CardContent>
</Card>
```

### Event Handlers

```typescript
// ✅ Typed event handlers
interface FormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export function Form({ onSubmit, onCancel }: FormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit">Submit</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}
```

---

## 🗃️ Database Patterns

### Drizzle Schema

```typescript
// ✅ Consistent schema patterns
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ✅ Type inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Query Patterns

```typescript
// ✅ Typed queries with proper error handling
export async function findUserById(id: string): Promise<User | null> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    return user || null;
  } catch (error) {
    throw new DatabaseError(`Failed to find user ${id}`, error);
  }
}

// ✅ Transaction patterns
export async function createUserWithProfile(
  userData: NewUser,
  profileData: NewProfile,
): Promise<{ user: User; profile: Profile }> {
  return await db.transaction(async (tx) => {
    const user = await tx.insert(users).values(userData).returning();
    const profile = await tx
      .insert(profiles)
      .values({
        ...profileData,
        userId: user[0].id,
      })
      .returning();

    return { user: user[0], profile: profile[0] };
  });
}
```

---

## 🎨 Styling Patterns

### TailwindCSS Conventions

```typescript
// ✅ Organized class names
const styles = {
  container: 'flex flex-col min-h-screen bg-discord-bg-primary',
  header: 'sticky top-0 z-10 bg-discord-bg-secondary border-b border-discord-bg-tertiary',
  content: 'flex-1 overflow-y-auto p-4',
  footer: 'mt-auto p-4 border-t border-discord-bg-tertiary',
};

// ✅ Conditional classes with clsx
import { clsx } from 'clsx';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function Button({ variant = 'primary', size = 'md', disabled }: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-colors',
        {
          'bg-discord-accent hover:bg-discord-accent-hover text-white': variant === 'primary',
          'bg-discord-bg-secondary hover:bg-discord-bg-tertiary': variant === 'secondary',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          'opacity-50 cursor-not-allowed': disabled,
        }
      )}
      disabled={disabled}
    >
      Button Text
    </button>
  );
}
```

---

## 🔧 Configuration Patterns

### Environment Variables

```typescript
// ✅ Typed environment configuration
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  DEEPSEEK_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  DB_FILE_NAME: z.string().default("project-wiz.db"),
});

export const env = envSchema.parse(process.env);
```

### Configuration Objects

```typescript
// ✅ Typed configuration
interface AppConfig {
  database: {
    filename: string;
    walMode: boolean;
  };
  llm: {
    defaultProvider: "deepseek" | "openai";
    maxTokens: number;
    temperature: number;
  };
  limits: {
    maxProjectsPerUser: number;
    maxAgentsPerUser: number;
  };
}

export const config: AppConfig = {
  database: {
    filename: env.DB_FILE_NAME,
    walMode: true,
  },
  llm: {
    defaultProvider: "deepseek",
    maxTokens: 4000,
    temperature: 0.7,
  },
  limits: {
    maxProjectsPerUser: 50,
    maxAgentsPerUser: 10,
  },
};
```

---

## ✅ Code Quality Checklist

### Before Committing

- [ ] **Naming** - All names are clear and descriptive
- [ ] **Single Responsibility** - Each function/class has one clear purpose
- [ ] **No Magic Numbers** - All constants are named
- [ ] **Type Safety** - All inputs/outputs are properly typed
- [ ] **Error Handling** - Errors are handled explicitly
- [ ] **No console.log** - Remove debug statements
- [ ] **Consistent Formatting** - Code is formatted with Prettier
- [ ] **No ESLint Errors** - All linting issues resolved

### Code Review Questions

1. **Is this code self-documenting?** Could someone understand it without comments?
2. **Is it simple?** Could this be done more simply?
3. **Is it consistent?** Does it follow existing patterns in the codebase?
4. **Is it testable?** Can this code be easily unit tested?
5. **Is it safe?** Are edge cases and errors handled?

---

## 🚫 Anti-Patterns to Avoid

### Don't

```typescript
// ❌ Avoid any types
function processData(data: any): any {
  return data.someProperty;
}

// ❌ Avoid deep nesting
if (user) {
  if (user.projects) {
    if (user.projects.length > 0) {
      if (user.projects[0].status === 'active') {
        // do something
      }
    }
  }
}

// ❌ Avoid long parameter lists
function createUser(
  name: string,
  email: string,
  password: string,
  role: string,
  isActive: boolean,
  department: string,
  manager: string
) {}

// ❌ Avoid mutation of props
function Component({ items }: { items: Item[] }) {
  items.push(newItem); // DON'T mutate props
  return <div>{items.map(...)}</div>;
}
```

### Do

```typescript
// ✅ Use proper types
function processUser(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    status: user.status,
  };
}

// ✅ Use early returns
function processUserProjects(user: User): void {
  if (!user) return;
  if (!user.projects) return;
  if (user.projects.length === 0) return;

  const activeProject = user.projects.find(p => p.status === 'active');
  if (!activeProject) return;

  // process active project
}

// ✅ Use configuration objects
interface CreateUserConfig {
  name: string;
  email: string;
  password: string;
  role: string;
  isActive?: boolean;
  department?: string;
  manager?: string;
}

function createUser(config: CreateUserConfig) {}

// ✅ Use immutable updates
function Component({ items }: { items: Item[] }) {
  const [localItems, setLocalItems] = useState(items);

  const addItem = () => {
    setLocalItems(prev => [...prev, newItem]);
  };

  return <div>{localItems.map(...)}</div>;
}
```

---

## 🎯 Benefits of These Standards

### ✅ For Junior Developers

- **Clear patterns** to follow
- **Consistent examples** throughout codebase
- **Reduced decision fatigue**
- **Faster onboarding**

### ✅ For Code Quality

- **Predictable structure**
- **Easier debugging**
- **Better maintainability**
- **Reduced bugs**

### ✅ For Team Collaboration

- **Shared understanding**
- **Consistent reviews**
- **Knowledge transfer**
- **Reduced conflicts**

### ✅ For Long-term Maintenance

- **Scalable patterns**
- **Easy refactoring**
- **Clear boundaries**
- **Technical debt prevention**

---

## 📈 Enforcement

### Automated Tools

- **ESLint** - Enforces syntax and pattern rules
- **Prettier** - Enforces formatting consistency
- **TypeScript** - Enforces type safety
- **Husky** - Runs checks on git hooks

### Manual Reviews

- **Code reviews** check for pattern compliance
- **Architecture reviews** ensure domain boundaries
- **Regular refactoring** to maintain standards

---

_These coding standards are designed to create a codebase that is simple, consistent, and maintainable for developers of all levels._
