# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL RULES - MUST FOLLOW

### **Data Loading & API Usage**

#### **✅ PREFERRED DATA LOADING HIERARCHY (Follow this order):**

1. **TanStack Router beforeLoad/loader** - For initial page data (HIGHEST PRIORITY)
   - Use `beforeLoad` for route guards and validation
   - Use `loader` for data that must be available before render
   - Direct `window.api` usage (fully typed via preload.ts)
   - Best performance with route-level preloading

2. **TanStack Query** - For mutations and reactive data (SECOND PRIORITY)
   - Use for data that changes frequently or needs caching
   - Use for mutations with optimistic updates
   - Direct `window.api` usage in queryFn/mutationFn

3. **Router Context** - For sharing route data (THIRD PRIORITY)
   - Share data loaded in routes with child components
   - Eliminate prop drilling
   - Type-safe access to route data

4. **Custom Hooks** - Only for specific behaviors (LAST RESORT)
   - Only when above patterns cannot handle the use case
   - Focus on single responsibility
   - Avoid combining multiple concerns

#### **❌ PROHIBITED:**

- **NEVER use API wrapper classes** - They add unnecessary abstraction over `window.api`
- **NEVER use `useEffect` for data loading** - Use route loading or TanStack Query
- **NEVER use `localStorage`** - This is an Electron desktop app, use main process
- **NEVER use `window.api` directly in component bodies** - Only in queries/beforeLoad/loader
- **NEVER edit migration SQL files directly** - Only modify `*.model.ts` files and regenerate
- **NEVER use Zustand for simple global UI state** - Use local React state or URL params

#### **✅ ALLOWED window.api usage:**

- **Route beforeLoad/loader** - `beforeLoad: async () => window.api.agents.list()`
- **TanStack Query functions** - `queryFn: () => window.api.auth.getCurrentUser()`
- **TanStack Query mutations** - `mutationFn: (data) => window.api.users.update(data)`

#### **✅ CORRECT patterns:**

```typescript
// ✅ CORRECT: Route beforeLoad with direct window.api (PREFERRED)
export const Route = createFileRoute("/_authenticated/user/agents/")({
  validateSearch: (search) => AgentFiltersSchema.parse(search),
  beforeLoad: async ({ search }) => {
    const response = await window.api.agents.list(search);
    if (!response.success) throw new Error(response.error);
    return { agents: response.data };
  },
  component: AgentsPage,
});

// ✅ CORRECT: TanStack Query for mutations
const createAgent = useMutation({
  mutationFn: (data: CreateAgentInput) => window.api.agents.create(data),
  onSuccess: () => {
    router.invalidate(); // Refresh route data
  },
});

// ✅ CORRECT: URL params for filters (shareable, bookmarkable)
const { search } = useSearch({ from: "/_authenticated/user/agents/" });
const navigate = useNavigate({ from: "/_authenticated/user/agents/" });
```

#### **❌ INCORRECT patterns:**

```typescript
// ❌ WRONG: API wrapper classes (unnecessary abstraction)
class AgentAPI {
  static async list() {
    return window.api.agents.list(); // Pointless wrapper
  }
}

// ❌ WRONG: useEffect for data loading
useEffect(() => {
  window.api.users.get(userId).then(setUser); // NEVER DO THIS
}, [userId]);

// ❌ WRONG: Zustand store for simple UI state
const useAgentStore = create((set) => ({
  selectedAgent: null,
  setSelectedAgent: (agent) => set({ selectedAgent: agent }),
}));

// ❌ WRONG: Complex hooks combining multiple concerns
const useAgent = () => {
  // 50+ lines mixing queries, stores, filters, etc.
  // Split into focused hooks or use route loading
};
```

## Development Commands

### Core Commands

```bash
# Development
npm run dev                    # Start Electron development server - NOT EXECUTE

# Build and Package
npm run build                  # Build for production (includes i18n compile)
npm run package               # Package as executable

# Database
npm run db:generate           # Generate database migrations
npm run db:migrate            # Run database migrations
npm run db:studio             # Open Drizzle Studio (database GUI) - NOT EXECUTE

# Testing
npm run test                  # Run all tests
npm run test:watch           # Run tests in watch mode
npm run test:coverage        # Run tests with coverage report

# Code Quality
npm run lint                 # Check code linting
npm run lint:fix            # Fix auto-fixable linting issues
npm run type-check          # TypeScript type checking
npm run format              # Format code with Prettier
npm run format:check        # Check code formatting

# Internationalization
npm run extract             # Extract translatable strings
npm run compile             # Compile translations

# Complete Quality Check
npm run quality:check       # Run linting, type-check, formatting, and tests
```

## Architecture Overview

This is an Electron desktop application built with React and TypeScript, designed as an AI-powered software development automation platform. The architecture follows a clear separation between main process (backend) and renderer process (frontend).

### Key Architectural Components

#### Main Process (Backend)

- **Database**: SQLite with Drizzle ORM for data persistence
- **Feature-based structure**: Each domain (auth, agents, projects, conversations) has its own module
- **IPC Handlers**: Electron IPC communication layer between main and renderer
- **Service Layer**: Business logic separated from data access

#### Renderer Process (Frontend)

- **React with TypeScript**: Modern React patterns using function declarations
- **TanStack Router**: File-based routing with beforeLoad/loader for data loading
- **shadcn/ui**: Component library for consistent UI
- **State Management**: Router context for shared state, TanStack Query for server state, local state for UI
- **Internationalization**: LinguiJS for multi-language support

#### Database Schema

- **Users & Authentication**: User accounts and session management
- **Projects**: Git repository integration and project management
- **Agents**: AI agent configurations and LLM provider settings
- **Conversations**: Chat system for human-AI interaction
- **Memory**: Agent memory and context management

### Process Communication

All communication between main and renderer processes happens via Electron IPC:

- **Main Process**: Exposes handlers via `ipcMain.handle()`
- **Renderer Process**: Communicates via `window.electronAPI` (preload script)
- **Type Safety**: Shared types ensure end-to-end type safety

## Code Organization Standards

### File Naming Convention

- **All files**: `kebab-case` (e.g., `user-profile.tsx`, `auth-service.ts`)
- **Suffixes with dots**: `.model.ts` (Drizzle), `.schema.ts` (Zod), `.service.ts`, `.handler.ts`, `.store.ts`, `.api.ts`
- **Hook prefix**: `use-` (e.g., `use-auth.hook.ts`)
- **Components**: No suffix (e.g., `login-form.tsx`)

### Feature Structure Pattern

Each feature follows this simplified structure:

#### Main Process (Backend)

```
features/[feature-name]/
├── [feature].types.ts     # TypeScript interfaces (shared with renderer)
├── [feature].model.ts     # Drizzle database schema
├── [feature].schema.ts    # Zod validation schemas (shared with renderer)
├── [feature].service.ts   # Business logic
└── [feature].handler.ts   # IPC handlers
```

#### Renderer Process (Frontend)

```
features/[feature-name]/
├── [feature].queries.ts   # TanStack Query hooks (only for mutations)
├── use-[feature].hook.ts  # Custom hooks (only when necessary)
└── components/            # Feature-specific components
```

### React Component Standards

- **Function declarations only** (not arrow functions file or React.FC)
- **No React import** required (global React)
- **shadcn/ui components** for all UI elements
- **Props destructuring** in function parameters
- **Named exports** (e.g., `export { LoginForm }`)

Example:

```typescript
interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

function LoginForm(props: LoginFormProps) {
  const { onSuccess, className } = props;
  // Component logic
  return <div>...</div>;
}

export { LoginForm };
```

### Data Layer Separation

- **`.model.ts`**: Drizzle schemas for database tables
- **`.schema.ts`**: Zod schemas for validation and forms
- **`.types.ts`**: TypeScript interfaces and types

### State Management

**Priority Order:**

1. **TanStack Router Context**: Share route data with child components (no prop drilling)
2. **URL Parameters**: Filters, search, pagination (shareable, bookmarkable)
3. **Local React State**: Simple UI state (modals, selections, form inputs)
4. **TanStack Query**: Server state, mutations, caching, and synchronization
5. **Zustand**: Only for exceptional global state used across multiple routes

**Avoid:** Creating stores for simple UI state that could be local React state or URL parameters.

### Session Management (Electron Desktop)

- **Sessions managed by main process** - Never localStorage
- **Auth state via Router Context** - Shared across routes
- **Session persistence in database** - With automatic cleanup and expiration
- **Database-persisted sessions** with foreign key constraints for data integrity

## Testing Strategy

- **Framework**: Vitest with Node.js environment
- **Setup**: `tests/test-setup.ts` handles database migrations for tests
- **Coverage**: v8 provider with HTML, text, and JSON reporting
- **File patterns**: `src/**/*.spec.ts` and `src/**/*.test.ts`

## Development Principles

### YAGNI (You Aren't Gonna Need It)

- **NO ABSTRACTIONS** until actually needed
- **NO FRAMEWORKS** for simple problems
- **NO PREMATURE OPTIMIZATION**
- **SOLVE TODAY'S PROBLEM** only

### KISS Principle

- **Simplicity above all** - avoid over-engineering
- **One responsibility per function/class**
- **Clear, descriptive names** that eliminate need for comments
- **Prefer simple solutions** to complex ones

### Boy Scout Rule

**"Always leave code cleaner than you found it"**

- **Refactor while working** - don't leave technical debt
- **Extract duplicated code** into reusable functions
- **Simplify complex logic** when encountered
- **Remove unused imports/variables/functions**

## Database Patterns

### Schema Definition & Type Safety

```typescript
// ✅ CORRECT: Use type inference and custom types
export type ProjectStatus = "active" | "archived";

export const projectsTable = sqliteTable("projects", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  status: text("status").$type<ProjectStatus>().notNull().default("active"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Type inference - don't recreate manually
export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
export type UpdateProject = Partial<InsertProject> & { id: string };
```

### Migration Workflow & Critical Rules

1. Create/modify schema in `src/main/features/**/*.model.ts`
2. `npm run db:generate` - auto-detects via `drizzle.config.ts`
3. `npm run db:migrate` - applies migrations
4. Update service layer if needed

**🚨 CRITICAL RULE: NEVER edit migration SQL files directly!**

- Migrations are auto-generated by Drizzle from `*.model.ts` files
- Always modify the `*.model.ts` files and regenerate migrations
- Direct SQL edits will be overwritten and can break the migration system

### Drizzle Query Patterns

```typescript
// ✅ CORRECT: Use db.select().from().where() with destructuring
const [user] = await db
  .select({ theme: usersTable.theme })
  .from(usersTable)
  .where(eq(usersTable.id, userId))
  .limit(1);

if (!user) {
  throw new Error("User not found");
}

// ❌ AVOID: db.query requires schema registration
const user = await db.query.usersTable.findFirst({
  where: eq(usersTable.id, userId),
});
```

## IPC Communication Patterns

### Service & Handler Pattern

```typescript
// ✅ CORRECT: Services return data directly - handlers do try/catch
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
}

// ✅ CORRECT: IPC Handler Pattern with error handling
export function setupProjectHandlers(): void {
  ipcMain.handle(
    "project:create",
    async (_, input: InsertProject): Promise<IpcResponse<SelectProject>> => {
      try {
        const result = await ProjectService.create(input);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Creation failed",
        };
      }
    },
  );
}
```

### Authentication Patterns (Desktop Security)

```typescript
// ✅ CORRECT: Database sessions + main process management
export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    const db = getDatabase();

    // 1. Verify credentials with bcrypt
    const isValid = await bcrypt.compare(credentials.password, storedHash);
    if (!isValid) throw new Error("Invalid credentials");

    // 2. Create session token in database
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await db.insert(userSessionsTable).values({
      userId: user.id,
      sessionToken,
      expiresAt,
    });

    // 3. Return user + token (stored in main process, NOT localStorage)
    return { user: userWithoutPassword, sessionToken };
  }

  static async getCurrentUser(
    sessionToken: string,
  ): Promise<AuthenticatedUser> {
    const db = getDatabase();

    // Verify session is valid and not expired
    const [result] = await db
      .select()
      .from(userSessionsTable)
      .innerJoin(usersTable, eq(userSessionsTable.userId, usersTable.id))
      .where(
        and(
          eq(userSessionsTable.token, sessionToken),
          gt(userSessionsTable.expiresAt, new Date()),
        ),
      );

    if (!result) throw new Error("Invalid or expired session");
    return result.user;
  }
}
```

## Important Implementation Notes

### Database Management

- Uses SQLite with WAL mode for better concurrency
- Database file: `project-wiz.db` in project root
- Migrations run automatically on `npm install` (postinstall script)
- **Always use database foreign keys and indexes** for relationships

### Type Organization Best Practices

- **Don't declare types inline** - always create using `export type`
- **Reuse types whenever possible** - leverage Drizzle inference
- **Pass types in generic parameters** to get expected typing
- **Use Omit/Pick for derived types** instead of recreating manually

### Security Considerations

- No `nodeIntegration` in renderer process
- Context isolation enabled
- Preload script for secure IPC communication
- **Database-based session management** (not JWT for desktop apps)
- **Session validation** checks expiration on each request

### Development Workflow

1. **Model First**: Define/modify database schema in `*.model.ts`
2. **Generate Migration**: `npm run db:generate`
3. **Apply Migration**: `npm run db:migrate`
4. **Validation Schema**: Create Zod schemas in `*.schema.ts`
5. **Service Layer**: Implement business logic in `*.service.ts`
6. **IPC Handlers**: Create type-safe handlers in `*.handler.ts`
7. **Frontend Integration**: Implement route loading, queries for mutations, and components
8. **Components**: Build UI with function declarations and shadcn/ui
9. **Quality Check**: `npm run quality:check`

### Quality Assurance

- ESLint with TypeScript, React, and architectural boundary rules
- Prettier for code formatting
- Strict TypeScript configuration
- Import organization and dependency boundaries enforced
- Maximum function/file length limits to maintain readability

### Key Library Usage Best Practices

- **Always utilize maximum functionality** from libraries: Zustand, TanStack, React Hook Form, Zod, shadcn/ui components
- **Avoid reinventing the wheel** - leverage existing solutions
- **Components**: ALWAYS function declaration, NEVER React.FC
- **Forms**: ALWAYS use shadcn/ui Form components with FormField pattern
- **UI**: ALWAYS use shadcn/ui, NEVER HTML native elements

## Development Tips

- The app uses a Discord-like interface metaphor with projects as servers and channels for conversations
- All AI interactions are designed to be conversational and context-aware
- **Follow established patterns** - use existing service layer patterns as reference
- **Maintain type safety** throughout IPC communication
- **Use path aliases** (`@/`) - never relative imports
