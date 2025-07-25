# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL ARCHITECTURE RULES

### **Code Simplicity (HIGHEST PRIORITY)** - @docs/developer/code-simplicity-principles.md

**INLINE-FIRST PHILOSOPHY:**

- ✅ **WRITE INLINE** when < 15 lines, single use, related operations
- ✅ **EXTRACT FUNCTION** only when 3+ exact duplications OR > 20 lines
- ✅ **OPTIMIZE FOR JUNIOR DEVELOPERS** - readable without file jumping
- ✅ **COPY-PASTE IS OK** for simple, contextually different logic
- ❌ **NEVER** over-abstract or create unnecessary functions
- ❌ **NEVER** split simple logic across multiple files

### **Data Loading Hierarchy** - @docs/developer/data-loading-patterns.md

**MANDATORY ORDER:**

1. **TanStack Router beforeLoad/loader** (HIGHEST PRIORITY)
2. **TanStack Query** (mutations/reactive data)
3. **Local React State** (simple UI state)
4. **Custom Hooks** (LAST RESORT)

**PROHIBITED:**

- ❌ **NEVER** `useRouteContext` - NOT part of our patterns
- ❌ **NEVER** API wrapper classes
- ❌ **NEVER** `useEffect` for data loading
- ❌ **NEVER** `localStorage` (desktop app - use main process)
- ❌ **NEVER** `window.api` in component bodies
- ❌ **NEVER** Zustand for simple UI state
- ❌ **NEVER** `search` parameter unless actual URL search/filters

### **Database Patterns** - @docs/developer/database-patterns.md

**CRITICAL MIGRATION RULE:**

- ❌ **NEVER EDIT SQL MIGRATION FILES DIRECTLY**
- ✅ **ONLY** modify `*.model.ts` files → `npm run db:generate` → `npm run db:migrate`

**MANDATORY:**

- Foreign key constraints on ALL relationships
- Indexes on ALL foreign keys and query columns
- Type inference: `typeof table.$inferSelect`
- Services return data directly, throw errors

### **IPC Communication** - @docs/developer/ipc-communication-patterns.md

**PATTERN:**

- Services: Return data directly, throw errors
- Handlers: Try/catch → standardized `IpcResponse<T>`
- Preload: Type-safe `window.api` exposure
- Security: `contextIsolation: true`, `nodeIntegration: false`

## **CRITICAL COMMANDS**

```bash
# Database (CRITICAL WORKFLOW)
npm run db:generate           # Generate migrations from *.model.ts
npm run db:migrate            # Apply migrations to database
npm run db:studio             # Database GUI - DO NOT EXECUTE

# Development
npm run dev                   # Electron dev server - DO NOT EXECUTE
npm run build                 # Production build + i18n compile
npm run package              # Package executable

# Quality Assurance (RUN BEFORE COMMITS)
npm run quality:check        # Comprehensive: lint + type + format + test
npm run lint                 # ESLint check
npm run lint:fix            # Auto-fix ESLint issues
npm run type-check          # TypeScript validation
npm run format              # Prettier formatting
npm run test                # Vitest run
npm run test:coverage       # Coverage report

# Internationalization
npm run extract             # Extract i18n strings
npm run compile             # Compile translations
```

## **ARCHITECTURE OVERVIEW**

**AI-powered software development automation platform** - Electron desktop app with Discord-like interface metaphor (projects as servers, channels for conversations).

### **Core Technologies**

- **Electron 35.1.4** + **React 19.0.0** + **TypeScript** (strict)
- **SQLite + Drizzle ORM** (WAL mode, foreign keys enabled)
- **TanStack Router 1.115.2** (file-based routing)
- **TanStack Query 5.83.0** (server state)
- **shadcn/ui** + **Tailwind CSS 4.0.14**
- **Vercel AI SDK** (multi-provider LLM support)
- **Vitest** (testing) + **LinguiJS** (i18n)

### **Main Process (Backend)**

**Feature Structure:** `features/[domain]/[domain].{model,schema,service,handler,types}.ts`

- **Database**: SQLite + WAL mode + foreign key constraints
- **Service Layer**: Business logic, throws errors directly
- **IPC Handlers**: Try/catch → `IpcResponse<T>`
- **Session Management**: Database-based (NOT localStorage)

### **Renderer Process (Frontend)**

**Route Structure:** File-based with `beforeLoad/loader` data loading

- **Components**: Function declarations only (NOT React.FC)
- **State**: Router context → URL params → Local state → TanStack Query → Zustand (exceptional)
- **Forms**: shadcn/ui FormField pattern
- **Security**: `contextIsolation: true`, `nodeIntegration: false`

## **CODING STANDARDS**

### **File Naming** (kebab-case)

- **All files**: `kebab-case` (user-profile.tsx, auth-service.ts)
- **Suffixes**: `.model.ts` (Drizzle), `.schema.ts` (Zod), `.service.ts`, `.handler.ts`
- **Hooks**: `use-` prefix (use-auth.hook.ts)
- **Components**: No suffix (login-form.tsx)

### **Feature Structure**

**Main Process:** `[feature].{types,model,schema,service,handler}.ts`
**Renderer:** `[feature].queries.ts`, `use-[feature].hook.ts`, `components/`

### **React Components** (**MANDATORY**)

- ✅ **Function declarations ONLY** (NEVER React.FC or arrow functions)
- ✅ **No React import** (global React)
- ✅ **shadcn/ui components** (NEVER HTML elements)
- ✅ **Props destructuring** in parameters
- ✅ **Named exports** (`export { Component }`)
- ✅ **INLINE LOGIC** - validation, handlers, state updates in component body
- ❌ **NEVER** extract single-use handler functions

### **Data Layer**

- `.model.ts` - Drizzle database schemas
- `.schema.ts` - Zod validation (forms/API)
- `.types.ts` - TypeScript interfaces

### **State Management Priority**

1. **TanStack Router beforeLoad/loader** (initial page data)
2. **URL Parameters** (ONLY for actual filters/search - shareable)
3. **Local React State** (simple UI)
4. **TanStack Query** (server state, mutations)
5. **Zustand** (EXCEPTIONAL global state ONLY)

**CRITICAL:**

- ❌ **NEVER use `useRouteContext`** - NOT part of our patterns
- ❌ **NEVER use `search` parameter** unless actual URL-based search/filters

### **Session Management**

- ✅ **Database sessions** (main process)
- ❌ **NEVER localStorage** (desktop app security)
- ✅ **beforeLoad/loader** for auth checks
- ✅ **Foreign key constraints** for data integrity

## **TESTING & QUALITY**

### **Testing Stack**

- **Vitest** (Node.js environment) + **v8 coverage**
- **Setup**: `tests/test-setup.ts` auto-runs migrations
- **Patterns**: `src/**/*.{spec,test}.ts`

### **Quality Assurance**

- **ESLint**: Architectural boundaries + TypeScript rules
- **Prettier**: Code formatting
- **Strict TypeScript**: End-to-end type safety
- **Import organization**: Dependency boundaries enforced

## **DEVELOPMENT PRINCIPLES**

### **INLINE-FIRST PRINCIPLES** - @docs/developer/code-simplicity-principles.md

- ✅ **< 15 LINES** → Write inline (validation + logic + persistence)
- ✅ **3+ EXACT DUPLICATIONS** → Extract function
- ✅ **JUNIOR DEVELOPER READABLE** → No file jumping for simple operations
- ✅ **DEBUGGING IN SECONDS** → Bug location immediately visible
- ❌ **NEVER** create single-use helper functions
- ❌ **NEVER** abstract until actually needed (3+ times)

### **Boy Scout Rule**

**"Always leave code cleaner than you found it"**

- ✅ **Refactor while working** (no technical debt)
- ✅ **Extract duplicated code**
- ✅ **Simplify complex logic**
- ✅ **Remove unused imports/variables/functions**

## **CORE PATTERNS** (See detailed docs)

### **Service Layer (INLINE-FIRST)**

- ✅ **Validation + Business Logic + Database** in single function
- ✅ **< 20 lines total** - keep everything visible
- ✅ **Zod inline** - `CreateAgentSchema.parse(input)`
- ✅ **Direct database operations** - no repository abstractions
- ❌ **NEVER** split simple CRUD across multiple functions

### **Database** - @docs/developer/database-patterns.md

- ✅ Type inference: `typeof table.$inferSelect`
- ✅ Foreign keys + indexes on ALL relationships
- ✅ Services return data directly, throw errors
- ❌ **NEVER** edit SQL migrations directly

### **IPC Communication** - @docs/developer/ipc-communication-patterns.md

- **Services**: Return data, throw errors
- **Handlers**: Try/catch → `IpcResponse<T>`
- **Preload**: Type-safe `window.api`
- **Security**: Context isolation enabled

### **Data Loading** - @docs/developer/data-loading-patterns.md

- **1st**: TanStack Router `beforeLoad/loader`
- **2nd**: TanStack Query (mutations)
- **3rd**: Router Context (share data)
- **4th**: Custom Hooks (last resort)

## **IMPLEMENTATION NOTES**

### **Database Management**

- **SQLite + WAL mode** for concurrency
- **Database file**: `project-wiz.db` (project root)
- **Auto-migrations**: `npm install` → `postinstall` script
- **ALWAYS**: Foreign keys + indexes for relationships

### **Type Safety**

- ✅ **`export type`** (never inline declarations)
- ✅ **Drizzle inference** (leverage `$inferSelect`)
- ✅ **Generic parameters** for expected typing
- ✅ **Omit/Pick** for derived types (don't recreate)

### **Security (Desktop App)**

- ✅ **`nodeIntegration: false`**
- ✅ **`contextIsolation: true`**
- ✅ **Database sessions** (NOT JWT/localStorage)
- ✅ **Session validation** with expiration checks

### **Development Workflow**

1. **Model First**: Modify `*.model.ts`
2. **Generate**: `npm run db:generate`
3. **Migrate**: `npm run db:migrate`
4. **Validate**: Create `*.schema.ts` (Zod)
5. **Service**: Business logic `*.service.ts`
6. **Handler**: IPC `*.handler.ts`
7. **Frontend**: Route loading + components
8. **Quality**: `npm run quality:check`

### **Library Usage**

- ✅ **shadcn/ui** (NEVER HTML elements)
- ✅ **Function declarations** (NEVER React.FC)
- ✅ **FormField pattern** for forms
- ✅ **Path aliases** (`@/`) - never relative imports
- ✅ **Leverage existing solutions** (don't reinvent)

### **Interface Metaphor**

- **Projects = Discord servers**
- **Channels = Conversations within projects**
- **AI interactions**: Conversational + context-aware

## 🤖 **CRITICAL REMINDERS FOR LLMs**

### **RESIST These Natural Tendencies:**

- ❌ Creating unnecessary validation functions (use Zod inline)
- ❌ Extracting single-use helper functions
- ❌ Over-abstracting simple operations
- ❌ Creating interface/class hierarchies for simple logic
- ❌ Splitting related logic across multiple files

### **ALWAYS Ask Before Coding:**

- "Can this be < 15 lines inline?"
- "Is this used 3+ times exactly?"
- "Would a junior dev understand this instantly?"
- "Can I debug this without opening other files?"

### **DEFAULT to INLINE-FIRST:**

- **Service methods**: Validation + logic + database in one function
- **Components**: Handlers + state + render logic together
- **Utils**: Only extract after 3+ exact duplications
- **Validation**: Always use Zod schemas inline, never custom functions
