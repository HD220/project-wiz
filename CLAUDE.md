# CLAUDE.md

This file provides guidance to Claude Code when working with this Electron + React + TypeScript codebase.

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

### **Code Simplicity (HIGHEST PRIORITY)**

**INLINE-FIRST PHILOSOPHY:**

- ✅ **WRITE INLINE** when < 15 lines, single use, related operations
- ✅ **EXTRACT FUNCTION** only when 3+ exact duplications OR > 20 lines
- ✅ **OPTIMIZE FOR JUNIOR DEVELOPERS** - readable without file jumping
- ✅ **COPY-PASTE IS OK** for simple, contextually different logic
- ❌ **NEVER** over-abstract or create unnecessary functions
- ❌ **NEVER** split simple logic across multiple files

### **Data Loading Hierarchy**

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

### **Database Patterns**

**CRITICAL MIGRATION RULE:**

- ❌ **NEVER EDIT SQL MIGRATION FILES DIRECTLY**
- ✅ **ONLY** modify `*.model.ts` files then execute `npm run db:generate` → `npm run db:migrate`

**CRITICAL TRANSACTION RULES:**

**❌ NEVER DO THIS (will fail with "Transaction function cannot return a promise"):**

```typescript
db.transaction(async (tx) => {  // ← async callback is the problem
  const result = await tx.select()...
});
```

**✅ ALWAYS DO THIS (await transaction, but synchronous callback):**

```typescript
const result = await db.transaction((tx) => {
  // ← await is OK here
  const results = tx.select().from(table).all(); // SELECT
  tx.insert().values().run(); // INSERT/UPDATE/DELETE
  return results[0];
});
```

**MANDATORY:**

- Foreign key constraints on ALL relationships
- Indexes on ALL foreign keys and query columns
- Use `.all()`, `.run()`, `.get()` methods in transactions
- No `async/await` in transaction callbacks

### **IPC Communication**

**PATTERN:**

- Services: Return data directly, throw errors
- Handlers: Try/catch → standardized `IpcResponse<T>`
- Preload: Type-safe `window.api` exposure
- **Main Process → Renderer**: Use `ipcHandler` utility in `src/main/utils/ipc-handler.ts`
- **Renderer → Main**: Use `window.api` methods defined in preload

### **React Components**

- ✅ **Function declarations ONLY** (NEVER React.FC or arrow functions)
- ✅ **No React import** (global React)
- ✅ Use **shadcn/ui components**
- ✅ Use **Props destructuring** in functions parameters
- ✅ **Inline exports** (`export const ABC`,`export function MyComponent`)

## 🔧 **ESSENTIAL COMMANDS**

```bash
# Database Workflow (CRITICAL)
npm run db:generate    # Generate migrations from *.model.ts
npm run db:migrate     # Apply migrations to database
npm run db:studio      # Open Drizzle Studio for database inspection
npm run db:setup-demo  # Setup demo user for testing

# Lint NEVER EXECUTE **PROIBIDED**
npm run quality:check  # Comprehensive: lint + type + format + test
npm run lint           # Run ESLint (no auto-fix)
npm run lint:fix       # Auto-fix ESLint issues
npm run dev            # Electron dev server
npm run build          # Production build + i18n compile
npm run package        # Package app for distribution

# Quality Assurance (RUN BEFORE COMMITS)
npm run type-check     # TypeScript type checking only

# Testing (ESSENTIAL)
npm run test           # Run all tests once
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report

# Internationalization
npm run extract        # Extract translatable strings
npm run compile        # Compile translations to TypeScript

# Maintenance
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
npm run rebuild       # Rebuild native dependencies (better-sqlite3)
```

## 🏆 **PERFORMANCE PATTERNS**

### **Component Reusability:**

- Compound components for complex UI

### **Type Safety:**

- Consistent `@/` import paths
- Never use `'as any'` casting
- Global React available (no React import needed)
- TypeScript strict mode with additional safety checks enabled

### **Testing Framework:**

- **Vitest** for unit and integration tests
- **@testing-library/react** for component testing
- Tests in `src/**/*.{test,spec}.ts` and `src/**/*.{test,spec}.tsx`
- SQLite in-memory database for test isolation
- Coverage reporting with V8 provider

## 🚨 **ANTI-PATTERNS TO AVOID**

### **Type Safety Violations:**

- 'as any' casting
- Inconsistent import paths
- Copy-paste component variations before 3+ exact uses
- useRouteContext usage
- localStorage in desktop app renderer process
- Import hell with relative paths

### **ESLint Boundary Rules (CRITICAL):**

- **NEVER** import main process code from renderer (except types)
- **NEVER** import renderer code from main process
- Use `src/renderer/preload.ts` and `src/renderer/window.d.ts` for type-safe IPC
- Boundaries enforced automatically by `eslint-plugin-boundaries`

## 🏗️ **ARCHITECTURE OVERVIEW**

**Project Wiz** is an autonomous software engineering factory - an AI-powered development automation platform that functions as a complete team of AI specialists. Users act as Product Managers or Tech Leads, delegating tasks through natural conversations while AI agents autonomously analyze, plan, and execute development work.

### **Core Concept**

- **Management Interface**: Discord-like UI (projects as servers, channels for conversations)
- **Autonomous Execution**: AI agents work independently after receiving high-level intentions
- **Natural Delegation**: "Team, we need to implement two-factor authentication" → System analyzes, plans, and executes
- **Exception Management**: Monitor progress without micromanagement, intervene only when needed

### **Key Features**

- **Personal Space**: Direct messages with agents, global settings, secure API key management
- **Project Workspaces**: Independent environments with dedicated AI teams per project
- **Automatic Hiring**: System analyzes projects and recruits relevant specialist agents
- **Structured Forum**: Multi-agent collaboration on complex problems with documented decisions
- **Intelligent Workflow**: Natural language task initiation → Activity dashboard monitoring → Exception-based intervention

### **Core Technologies**

- **Electron** + **React** + **TypeScript** (strict)
- **SQLite + Drizzle ORM** (WAL mode, foreign keys enabled)
- **TanStack Router** (file-based routing)
- **TanStack Query** (server state)
- **shadcn/ui** + **Tailwind CSS**
- **Vercel AI SDK** (multi-provider LLM support)

### **File Naming** (kebab-case)

- **All files**: `kebab-case`
- **Suffixes**: `.model.ts` (Drizzle), `.schema.ts` (Zod), `.service.ts`, `.handler.ts`
- **Hooks**: `use-` prefix
- **Components**: No suffix

### **Feature Structure**

**Main Process:** `[feature].{types,model,schema,service,handler}.ts`
**Renderer:** `[feature].queries.ts`, `components/`

### **State Management Priority**

1. **TanStack Router beforeLoad/loader** (initial page data)
2. **URL Parameters** (ONLY for actual filters/search - shareable)
3. **Local React State** (simple UI)
4. **TanStack Query** (server state, mutations)
5. **Zustand** (EXCEPTIONAL global state ONLY)

### **Session Management**

- ✅ **Database sessions** (main process)
- ❌ **NEVER localStorage** (desktop app security)
- ✅ **beforeLoad/loader** for auth checks
- ✅ **Foreign key constraints** for data integrity

### **Internationalization (i18n)**

- **Lingui 5.3.2** for translations
- **Supported locales**: `en` (English), `pt-BR` (Portuguese Brazil)
- **Message files**: `.po` format in `src/renderer/locales/`
- **Workflow**: Extract → Translate → Compile
- **CRITICAL**: Always run `npm run compile` after translation changes

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

### **RESIST These Natural Tendencies:**

- Creating unnecessary validation functions (use Zod inline)
- Extracting single-use helper functions
- Over-abstracting simple operations
- Creating interface/class hierarchies for simple logic
- Splitting related logic across multiple files
- JSON.parse() in render loops
- 'as any' type casting
- Component duplication before 3+ exact uses
- Mobile-first responsive in Electron apps
- Relative import paths

### **EXTRACTION PATTERNS:**

- **✅ EXTRACT**: 3+ exact duplications
- **✅ EXTRACT**: Mode variations (login/register)
- **✅ EXTRACT**: Performance-critical components
- **❌ DON'T EXTRACT**: Single-use utilities

---

**Remember**: These patterns optimize for **developer productivity** and **code maintainability**. When in doubt, choose the more **inline**, **readable** option that keeps related logic together.
