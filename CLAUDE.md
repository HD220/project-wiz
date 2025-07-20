# CLAUDE.md

Project guidance for Claude Code - **YAGNI | CLEAN CODE | SIMPLE**

## Project Overview

**Project Wiz** - Electron desktop app with AI agents for software development workflows.

## Tech Stack

- **Electron** + **React 19** + **TypeScript**
- **Tailwind CSS** + **Shadcn/ui**
- **SQLite** + **Drizzle ORM**
- **TanStack Router** + **TanStack Query**
- **Zustand** + **Zod**
- **AI SDK** + **Vitest**

## CORE PRINCIPLES - **MANDATORY**

### **YAGNI** - You Aren't Gonna Need It
- **NO ABSTRACTIONS** until actually needed
- **NO FRAMEWORKS** for simple problems
- **NO PREMATURE OPTIMIZATION**
- **SOLVE TODAY'S PROBLEM** only

### **CLEAN CODE** - Non-Negotiable
- **READABLE AS PROSE** - self-documenting
- **SINGLE RESPONSIBILITY** - one job per function
- **DESCRIPTIVE NAMES** - no comments needed
- **FAIL FAST** - clear error messages
- **NO DEAD CODE** - delete unused code

### **SIMPLICITY FIRST**
- **SIMPLE > CLEVER**
- **EXPLICIT > IMPLICIT**
- **BORING > EXCITING**
- **DELETE > ABSTRACT**

## **COMMANDS** - Run Quality First

```bash
# **MANDATORY** before any commit
npm run quality:check    # MUST PASS - lint + type-check + format + test

# Development
npm run dev             # Start development
npm run build           # Build for production

# Database
npm run db:generate     # Generate migrations
npm run db:migrate      # Apply migrations

# Setup
cp .env.example .env    # Add DEEPSEEK_API_KEY
```

## **ARCHITECTURE** - Bounded Contexts

```
src/
├── main/           # Backend (Electron)
│   ├── user/       # **BOUNDED CONTEXT** - Auth + Profile
│   ├── project/    # **BOUNDED CONTEXT** - Projects + Channels
│   ├── conversations/ # **BOUNDED CONTEXT** - Messages
│   ├── agents/     # **BOUNDED CONTEXT** - AI Agents
│   └── database/   # **SHARED KERNEL**
├── renderer/       # Frontend (React)
```

## **NAMING** - Consistent & Clear

- **Files**: `kebab-case.service.ts`
- **Functions**: `camelCase`
- **Types**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Database**: `snake_case`

## **IMPORTS** - Organized & Aliased

```typescript
// 1. Node built-ins
import { readFile } from "fs/promises";

// 2. External libraries
import { z } from "zod";

// 3. **ALWAYS USE ALIASES** - NEVER relative imports
import { getDatabase } from "@/main/database/connection";
import { Button } from "@/components/ui/button";
```

## **REACT PATTERNS** - Component Standards

```typescript
// **COMPONENT STRUCTURE** - Functional with hooks
export function UserProfile({ userId }: { userId: string }) {
  const { user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => window.api.user.getById(userId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return <div>{user.name}</div>;
}

// **STORE PATTERN** - Zustand with persist
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      setUser: (user) => set({ currentUser: user }),
    }),
    { name: "user-storage" }
  )
);

// **FORM PATTERN** - React Hook Form + Zod
const schema = z.object({
  name: z.string().min(1, "Name required"),
});

export function UserForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField name="name" render={({ field }) => (
          <Input {...field} placeholder="Name" />
        )} />
      </form>
    </Form>
  );
}
```

## **DATABASE** - Schema First, Type Safe

```typescript
// **SCHEMA DEFINITION** - Use type inference
export type ProjectStatus = "active" | "archived";

export const projectsTable = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  status: text("status").$type<ProjectStatus>().notNull().default("active"),
});

// **INFER TYPES** - Don't recreate manually
export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
```

### **MIGRATION WORKFLOW**
1. **Schema First** - Edit `*.schema.ts`
2. **Generate** - `npm run db:generate`
3. **Migrate** - `npm run db:migrate`

### **QUERY PATTERN** - Explicit Only
```typescript
// **CORRECT** - Explicit queries with destructuring
const [user] = await db
  .select({ theme: usersTable.theme })
  .from(usersTable)
  .where(eq(usersTable.id, userId))
  .limit(1);

if (!user) throw new Error("User not found");

// **FORBIDDEN** - db.query method
```

## **IPC COMMUNICATION** - Type Safe & Simple

```typescript
// **SERVICE PATTERN** - Return data directly, throw on error
export class AuthService {
  static async login(input: LoginInput): Promise<AuthResult> {
    const db = getDatabase();
    // Business logic here
    return { user: userWithoutPassword }; // **RETURN DATA**
  }
}

// **HANDLER PATTERN** - Try/catch wrapper only
export function setupAuthHandlers(): void {
  ipcMain.handle("auth:login", async (_, credentials: LoginCredentials) => {
    try {
      const result = await AuthService.login(credentials);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
```

## **CRITICAL RULES** - Non-Negotiable

1. **PATH ALIASES ONLY** - `@/` never relative imports
2. **SERVICES RETURN DATA** - handlers do try/catch
3. **TYPE INFERENCE** - never recreate Drizzle types
4. **BOUNDED CONTEXTS** - never mix domains
5. **SCHEMA FIRST** - database drives types
6. **QUALITY CHECK** - must pass before commit

## **DEVELOPMENT FLOW** - Simple & Systematic

1. **Schema** → Edit `*.schema.ts`
2. **Migrate** → `npm run db:generate && npm run db:migrate`
3. **Service** → Business logic
4. **Handler** → IPC wrapper
5. **Frontend** → Zustand store
6. **Quality** → `npm run quality:check`

## **FORBIDDEN PATTERNS**

- **NO ABSTRACTIONS** until needed 3+ times
- **NO FRAMEWORKS** for simple problems
- **NO RELATIVE IMPORTS** - use aliases
- **NO db.query** - use explicit queries
- **NO JWT** - simple session for desktop
- **NO COMMENTS** - code should be self-documenting
- **NO DEAD CODE** - delete immediately

## **TROUBLESHOOTING** - Quick Fixes

```bash
# **DATABASE LOCKED**
pkill -f "project-wiz" && npm run dev

# **TYPE ERRORS**
npm run type-check        # See specific errors
rm -rf node_modules && npm install  # Reset if needed

# **BUILD FAILURES**
npm run clean            # Clear cache
npm run build            # Rebuild

# **IPC NOT WORKING**
# Check handler registration in src/main/main.ts
# Verify preload.ts exposes correct API

# **MIGRATION ISSUES**
npm run db:studio        # Check current schema
rm -rf src/main/database/migrations/          # Reset migrations (dev only)
npm run db:generate && npm run db:migrate
```
