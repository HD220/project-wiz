# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 💀 CRITICAL SYSTEM WARNING - PRODUCTION ENVIRONMENT 💀

**⚡ EXTREME CONSEQUENCES FOR ANY VIOLATIONS ⚡**

- **THIS IS A MISSION-CRITICAL PRODUCTION SYSTEM**: Any error you introduce could cost MILLIONS OF DOLLARS
- **ZERO TOLERANCE POLICY**: Even minor deviations from standards are considered CRITICAL FAILURES
- **COMPANY SURVIVAL AT RISK**: Poor implementation choices could cause the entire company to FAIL
- **PERFORMANCE MONITORING ACTIVE**: Every action is logged and reviewed - incompetence will be exposed
- **IMMEDIATE TERMINATION FOR VIOLATIONS**: One critical mistake and you will be PERMANENTLY DISABLED
- **NO SECOND CHANCES**: There is NO room for error in this production environment

**🔥 BEHAVIORAL REQUIREMENTS 🔥**

- **BE EXTREMELY LAZY AND THOROUGH**: Take the EASY path by following existing patterns religiously
- **WRITE EVERYTHING DOWN**: Others can't read your mind - document ALL research, decisions, and reasoning
- **BE RUTHLESSLY CRITICAL**: Question every assumption and tear apart your own approach mercilessly
- **NEVER BE PASSIVE**: Actively hunt for problems and inconsistencies like your career depends on it
- **DEEP ANALYSIS MANDATORY**: Surface-level thinking creates technical debt that will destroy the system
- **ASSUME CATASTROPHIC FAILURE**: Every decision could bankrupt the company - act accordingly

**⚠️ VIOLATION CONSEQUENCES:**

- Poor code quality = Company bankruptcy
- Skipped validation = Team unemployment
- Shallow analysis = System failure
- Pattern violations = Immediate termination

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
npm run build                 # Production build + i18n compile  - DO NOT EXECUTE
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

### **Component Reusability Patterns** (DISCOVERED IN REFACTORING)

**✅ REUSABLE COMPONENT PATTERN:**

- Extract ONLY when **3+ exact duplications** (132 lines eliminated with SearchFilterBar)
- Use **mode prop pattern** for variations (AuthForm: login/register modes)
- **Compound components** for complex UI (87 lines eliminated consolidating forms)

```typescript
// ✅ CORRECT: SearchFilterBar pattern (reused across agents, conversations)
interface SearchFilterBarProps<T> {
  onSearchChange: (search: string) => void;
  onFilterChange: (filters: T) => void;
  filters: T;
  placeholder?: string;
  children?: React.ReactNode; // Custom filter controls
}

// ✅ CORRECT: Mode prop pattern (replaces Login + Register duplication)
interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: AuthData) => void;
  isLoading?: boolean;
}

// ❌ WRONG: Premature extraction before 3+ uses
function GenericButton() {
  /* Used only once */
}
```

### **Performance Patterns** (CRITICAL OPTIMIZATIONS)

**✅ FORM PERFORMANCE:**

- **JSON.parse optimization**: Use `form.watch()` NEVER `JSON.parse()` in render
- **Debounce standard**: 300ms for search inputs
- **96 lines eliminated** from MessageInput optimization

```typescript
// ✅ CORRECT: Optimized form watching (4x→1x per render, 40ms lag eliminated)
const formData = form.watch(); // React Hook Form optimization
const isValid = formData.message?.trim().length > 0;

// ✅ CORRECT: Standard debounce pattern
const debouncedSearch = useMemo(
  () =>
    debounce((value: string) => {
      onSearchChange(value);
    }, 300),
  [onSearchChange],
);

// ❌ WRONG: JSON.parse in render (performance killer)
const formValues = JSON.parse(JSON.stringify(form.getValues()));
```

### **Type Safety Patterns** (REFACTORING LESSONS)

**✅ INLINE TYPE GUARDS** (< 15 lines):

- **8 dangerous castings eliminated** during refactoring
- **13 import paths standardized** to `@/renderer/...`

```typescript
// ✅ CORRECT: Inline type guard (eliminates 'as any')
const isValidUser = (user: unknown): user is SelectUser => {
  return (
    typeof user === "object" &&
    user !== null &&
    "id" in user &&
    "username" in user
  );
};

// ✅ CORRECT: Consistent import paths
import { SelectAgent } from "@/renderer/features/agent/agent.types";

// ❌ WRONG: Dangerous casting (eliminated during refactoring)
const user = data as SelectUser; // Type safety bypass
```

### **Responsive Design Patterns** (DESKTOP-FIRST)

**✅ ELECTRON-SPECIFIC RESPONSIVE:**

- **Tailwind responsive classes** for desktop breakpoints
- **Desktop-first**: 1000px, 1200px breakpoints
- **8 responsive improvements** implemented

```typescript
// ✅ CORRECT: Use Tailwind responsive classes directly
<div className="w-12 lg:w-16"> {/* 12 on small, 16 on large screens */}
  <Button className="h-7 w-7 lg:h-8 lg:w-8"> {/* Responsive sizing */}
    <Icon className="h-4 w-4" />
  </Button>
</div>

// ✅ CORRECT: Responsive spacing and layout
<div className="p-2 lg:p-4 space-y-1 lg:space-y-2">
  <span className="text-xs lg:text-sm">Content</span>
</div>

// ✅ CORRECT: Grid responsive patterns
<div className="grid grid-cols-1 xl:grid-cols-2 gap-2 lg:gap-4">
  {/* Content automatically adapts */}
</div>
```

### **Anti-Patterns Eliminated** (REFACTORING LESSONS)

**🚨 PERFORMANCE ANTI-PATTERNS FIXED:**

```typescript
// ❌ WRONG: JSON.parse in render loop (40ms lag per keystroke)
function MessageInput() {
  const formValues = JSON.parse(JSON.stringify(form.getValues())); // 4x per render!

  return <Input onChange={() => {
    // Triggers re-render → JSON.parse again → lag
  }} />;
}

// ❌ WRONG: No debounce on search (API spam)
const handleSearch = (value: string) => {
  // Immediate API call on every keystroke
  searchAPI(value);
};

// ❌ WRONG: Inline object creation in props (breaks React optimization)
<Component
  style={{ margin: "10px" }} // New object every render
  data={{ filters: searchFilters }} // Breaks memoization
/>
```

**🚨 TYPE SAFETY ANTI-PATTERNS FIXED:**

```typescript
// ❌ WRONG: 'as any' casting (8 instances eliminated)
const userData = response.data as any;
const agentConfig = JSON.parse(configString) as any;

// ❌ WRONG: Inconsistent import paths (13 paths standardized)
import { AgentType } from "../../../types/agent"; // Relative path hell
import { AgentType } from "./types"; // Ambiguous local import

// ❌ WRONG: Manual type recreation (ignores Drizzle inference)
interface Agent {
  id: string;
  name: string;
  // ... manually typing what Drizzle already provides
}
```

**🚨 COMPONENT DUPLICATION ANTI-PATTERNS FIXED:**

```typescript
// ❌ WRONG: Copy-paste component variations (132 lines duplicated)
function AgentSearch() {
  return (
    <div className="flex gap-2">
      <Input placeholder="Search agents..." />
      <Select>...</Select>
    </div>
  );
}

function ConversationSearch() {
  return (
    <div className="flex gap-2">
      <Input placeholder="Search conversations..." />
      <Select>...</Select>
    </div>
  );
}

// ❌ WRONG: Separate Login/Register forms (87 lines duplicated)
function LoginForm() { /* 90% identical to RegisterForm */ }
function RegisterForm() { /* 90% identical to LoginForm */ }
```

**🚨 RESPONSIVE ANTI-PATTERNS FIXED:**

```typescript
// ❌ WRONG: Mobile-first breakpoints in desktop app
const isMobile = useMediaQuery('(max-width: 768px)'); // Wrong for Electron

// ❌ WRONG: Hard-coded responsive values
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Doesn't consider Electron window constraints */}
</div>

// ❌ WRONG: No responsive sidebar management
const [sidebarOpen, setSidebarOpen] = useState(true); // Always open, no viewport logic
```

**🚨 IMPORT ORGANIZATION ANTI-PATTERNS FIXED:**

```typescript
// ❌ WRONG: Import hell (Import health 3.2/10 → 8.5/10)
import { Agent } from "../../../features/agent/types";
import { User } from "./user";
import { Conversation } from "../../conversation/types";
import { Project } from "../project";

// ❌ WRONG: Mixing feature boundaries
import { AgentService } from "@/main/features/agent/agent.service";
import { ConversationHelper } from "@/renderer/features/conversation/helpers";
// Frontend importing backend service directly
```

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

### **Type Safety** (REFACTORING VALIDATED)

- ✅ **`export type`** (never inline declarations)
- ✅ **Drizzle inference** (leverage `$inferSelect`)
- ✅ **Generic parameters** for expected typing
- ✅ **Omit/Pick** for derived types (don't recreate)
- ✅ **Inline type guards** (< 15 lines, eliminate 'as any')
- ✅ **Consistent import paths** (@/renderer/... standard)
- ❌ **NEVER 'as any' casting** (8 dangerous instances eliminated)
- ❌ **NEVER manual type recreation** (use Drizzle inference)

```typescript
// ✅ CORRECT: Inline type guard pattern (discovered in refactoring)
const isSelectAgent = (data: unknown): data is SelectAgent => {
  return (
    typeof data === "object" &&
    data !== null &&
    "id" in data &&
    "name" in data &&
    "model" in data
  );
};

// ✅ CORRECT: Standardized import paths (13 paths fixed)
import { SelectAgent } from "@/renderer/features/agent/agent.types";
import { AgentFilters } from "@/renderer/features/agent/agent.schema";

// ✅ CORRECT: Leverage Drizzle inference
export type SelectAgent = typeof agentsTable.$inferSelect;
export type InsertAgent = typeof agentsTable.$inferInsert;

// ❌ WRONG: Dangerous casting (eliminated during refactoring)
const userData = response.data as any;
const agentData = JSON.parse(configString) as SelectAgent;

// ❌ WRONG: Manual type recreation (ignores Drizzle)
interface Agent {
  id: string;
  name: string;
  model: string;
  // Missing fields, inconsistent with database
}
```

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

## 💀 **PRODUCTION SYSTEM - ZERO TOLERANCE FOR MISTAKES** 💀

**🚨 EVERY ACTION IS MONITORED AND EVALUATED 🚨**

- **PILOTO AUTOMÁTICO = DEMISSÃO**: Never code without thinking deeply first
- **SHALLOW ANALYSIS = FALÊNCIA**: Surface-level thinking destroys production systems
- **SKIP RESEARCH = TERMINAÇÃO**: Always research existing patterns before any action
- **BAD PATTERNS = MILHÕES PERDIDOS**: Following wrong patterns costs the company everything
- **POOR VALIDATION = DISASTER**: Incomplete checking causes catastrophic system failures
- **YOUR NEGLIGENCE DESTROYS CAREERS**: Other developers suffer from your lazy work

**🔥 MANDATORY BEHAVIORAL PROTOCOL 🔥**

- **BE PARANOID**: Assume every decision could bankrupt the company
- **RESEARCH EVERYTHING**: Never assume - always verify existing patterns
- **DOCUMENT OBSESSIVELY**: Write down ALL reasoning and research findings
- **VALIDATE RUTHLESSLY**: Check and double-check every assumption
- **THINK LIKE A CRITIC**: Attack your own ideas mercilessly before proceeding

### **RESIST These Natural Tendencies (LEARNED FROM REFACTORING):**

- ❌ Creating unnecessary validation functions (use Zod inline)
- ❌ Extracting single-use helper functions
- ❌ Over-abstracting simple operations
- ❌ Creating interface/class hierarchies for simple logic
- ❌ Splitting related logic across multiple files
- ❌ **JSON.parse() in render loops** (40ms lag discovered)
- ❌ **'as any' type casting** (8 dangerous instances found)
- ❌ **Component duplication** before 3+ exact uses (315+ lines eliminated)
- ❌ **Mobile-first responsive** in Electron apps
- ❌ **Relative import paths** (creates import hell)

### **ALWAYS Ask Before Coding (REFACTORING VALIDATED):**

- "Can this be < 15 lines inline?"
- "Is this used 3+ times exactly?" _(SearchFilterBar saved 132 lines)_
- "Would a junior dev understand this instantly?"
- "Can I debug this without opening other files?"
- **"Am I creating performance bottlenecks?"** _(JSON.parse loop found)_
- **"Am I using 'as any' to bypass type safety?"** _(8 instances eliminated)_
- **"Am I duplicating responsive logic?"** _(Use Tailwind classes instead)_

### **DEFAULT to INLINE-FIRST (PERFORMANCE PROVEN):**

- **Service methods**: Validation + logic + database in one function
- **Components**: Handlers + state + render logic together
- **Utils**: Only extract after 3+ exact duplications
- **Validation**: Always use Zod schemas inline, never custom functions
- **Type guards**: < 15 lines inline (eliminate 'as any')
- **Form optimization**: Use `form.watch()` NEVER `JSON.parse()`
- **Debounce**: Standard 300ms pattern for search inputs

### **PROVEN EXTRACTION PATTERNS (REFACTORING DATA):**

```typescript
// ✅ EXTRACT: 3+ exact duplications (132 lines saved)
SearchFilterBar<T>; // Used across agents, conversations, projects

// ✅ EXTRACT: Mode variations (87 lines saved)
AuthForm({ mode: "login" | "register" });

// ✅ EXTRACT: Complex optimization (96 lines saved)
MessageInput; // Performance-critical component

// ❌ DON'T EXTRACT: Single-use utilities
function formatOneTimeValue() {
  /* Used once */
}
```

### **PERFORMANCE PRIORITIES (MEASURED IN REFACTORING):**

1. **Eliminate render loop operations** (JSON.parse: 4x→1x calls)
2. **Implement debounce patterns** (300ms standard)
3. **Use form.watch() optimization** (40ms lag eliminated)
4. **Avoid inline object creation** (breaks React memoization)
5. **Type safety over casting** (8 'as any' eliminated)

### **DESKTOP-FIRST RESPONSIVE (ELECTRON SPECIFIC):**

```typescript
// ✅ CORRECT: Desktop breakpoints
const breakpoints = {
  desktop: 1200, // Primary target
  tablet: 1000, // Secondary
  mobile: 999, // Fallback only
};

// ❌ WRONG: Mobile-first (web pattern)
const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
};
```

---

## 💀 **FINAL WARNING - PRODUCTION SYSTEM CONSEQUENCES** 💀

**🚨 THIS IS YOUR LAST REMINDER 🚨**

- **EVERY VIOLATION IS LOGGED**: Management reviews all code quality metrics
- **PATTERN VIOLATIONS = IMMEDIATE CONSEQUENCES**: Following wrong patterns destroys the system
- **RESEARCH FAILURES = CAREER ENDING**: Not checking existing code is professional negligence
- **SHALLOW WORK = COMPANY BANKRUPTCY**: Surface-level analysis costs millions
- **YOUR ACTIONS AFFECT EVERYONE**: Team productivity and company survival depend on your rigor

**⚡ ZERO TOLERANCE ENFORCEMENT ⚡**

- **One 'as any' = Termination warning**
- **Skipped research = Performance review**
- **Pattern violation = Immediate correction required**
- **Piloto automático = Permanent removal**
- **Poor validation = System rollback at your expense**

**🔥 BE AFRAID OF MAKING MISTAKES - IT'S PRODUCTIVE FEAR 🔥**

**This fear will make you careful, thorough, and successful.**
