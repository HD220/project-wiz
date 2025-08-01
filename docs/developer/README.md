# Developer Guide

Welcome to the Project Wiz developer documentation. This guide provides everything you need to start contributing to Project Wiz, an AI-powered software development automation platform.

## =� Quick Start for Developers

### Prerequisites

- **Node.js 18+** and **npm**
- **Git** for version control
- **SQLite** (comes with Node.js)
- Basic understanding of **TypeScript**, **React**, and **Electron**

### Initial Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/HD220/project-wiz.git
   cd project-wiz
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database:**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## =� Essential Reading

Before contributing, please read these core documents:

### **Must Read First:**

- **[Code Simplicity Principles](./code-simplicity-principles.md)** - Our INLINE-FIRST philosophy
- **[Contributing Guide](./contributing.md)** - Contribution workflow and standards
- **[Coding Standards](./coding-standards.md)** - File naming, structure, and patterns

### **Architecture Patterns:**

- **[Data Loading Patterns](./data-loading-patterns.md)** - TanStack Router � Query � State hierarchy
- **[Database Patterns](./database-patterns.md)** - SQLite + Drizzle ORM patterns
- **[IPC Communication Patterns](./ipc-communication-patterns.md)** - Main � Renderer communication
- **[Error Handling Patterns](./error-handling-patterns.md)** - Consistent error management

### **Project Structure:**

- **[Folder Structure](./folder-structure.md)** - How the codebase is organized

## <� Architecture Overview

Project Wiz is built as an **Electron desktop application** with a clear separation between main and renderer processes:

```
                                                             
                    RENDERER PROCESS                         
                                                      
     React UI         TanStack           Type-Safe    
     Components       Router/Query       window.api   
                                                      
                                                             
                              
                             4         
                       IPC Bridge      
                       (Preload)       
                             ,         
                              
                                                             
                     MAIN PROCESS                            
                                                      
     IPC Handlers       Services          Database    
     (API Layer)       (Business)         (SQLite)    
                                                      
                                                             
```

### Core Technologies

#### **Frontend Stack**

- **React:** 19.0.0 (latest with concurrent features)
- **TypeScript:** 5.8.3 (strict mode, full type safety)
- **TanStack Router:** 1.115.2 (file-based routing, type-safe)
- **TanStack Query:** 5.83.0 (server state management)
- **shadcn/ui:** Latest (Radix-based component system)
- **Tailwind CSS:** 4.0.14 (utility-first styling)

#### **Backend Stack**

- **Node.js:** Latest LTS with TypeScript 5.8.3
- **SQLite:** WAL mode with foreign key constraints
- **Drizzle ORM:** 0.44.2 (type-safe SQL with migrations)
- **Electron:** 35.1.4 (secure desktop runtime)

#### **AI Integration**

- **Vercel AI SDK:** 4.3.16 (unified provider interface)
- **OpenAI:** 1.3.23 (GPT-4, GPT-3.5-turbo support)
- **Anthropic:** 1.2.12 (Claude 3.5 Sonnet, Haiku)
- **OpenAI-Compatible:** 0.2.16 (DeepSeek, local models)

#### **Quality & Testing**

- **Vitest:** 3.1.1 (fast unit testing with v8 coverage)
- **ESLint:** 9.30.0 (TypeScript, React, accessibility rules)
- **Prettier:** Latest (consistent code formatting)
- **TypeScript:** Strict mode (zero `any` tolerance)

#### **Development Tools**

- **LinguiJS:** 5.3.2 (type-safe internationalization)
- **Drizzle Studio:** Visual database management
- **React DevTools:** Component debugging
- **TanStack Router DevTools:** Route debugging

## =� Development Workflow

### Database Changes

**CRITICAL:** Never edit SQL migration files directly!

```bash
# 1. Modify *.model.ts files
# 2. Generate migration
npm run db:generate

# 3. Apply migration
npm run db:migrate

# 4. Verify with database studio (optional)
npm run db:studio
```

### Code Quality

Run before every commit:

```bash
# Comprehensive quality check (MANDATORY)
npm run quality:check

# Individual checks
npm run lint          # ESLint with TypeScript rules
npm run lint:fix      # Auto-fix ESLint issues
npm run type-check    # TypeScript strict compilation
npm run format        # Prettier formatting
npm run format:check  # Check formatting without changes
npm run test          # Vitest unit tests
npm run test:coverage # Coverage reports
npm run test:watch    # Development test watching
```

### Feature Development

1. **Create feature branch** from `jules-new-architecture`
2. **Follow INLINE-FIRST principles** - avoid premature abstraction
3. **Use established patterns** - data loading hierarchy, service patterns, [design system components](../design/README.md)
4. **Apply design tokens** - use [OKLCH color system](../design/design-tokens.md) and spacing tokens
5. **Write tests** for business logic
6. **Update documentation** if adding new patterns
7. **Run quality checks** before committing

## <� Key Principles

### 1. **INLINE-FIRST Development**

Write code inline first. Only extract when you have **3+ exact duplications** or **>20 lines** of complex logic.

```typescript
//  GOOD: Simple logic stays inline
function createAgent(input: CreateAgentInput) {
  const validated = CreateAgentSchema.parse(input);
  const permissions =
    validated.role === "admin" ? ALL_PERMISSIONS : BASIC_PERMISSIONS;
  const [agent] = await db
    .insert(agentsTable)
    .values({ ...validated, permissions })
    .returning();
  return agent;
}

// L AVOID: Unnecessary extraction
function validateAgentInput(input: CreateAgentInput) {
  return CreateAgentSchema.parse(input); // Just use Zod inline
}
```

### 2. **Data Loading Hierarchy**

Follow this **mandatory** order:

1. **TanStack Router beforeLoad/loader** (initial page data)
2. **TanStack Query** (mutations, reactive data)
3. **Local React State** (UI state)
4. **Custom Hooks** (last resort)

### 3. **Service Layer Pattern**

Services return data directly and throw errors. Handlers catch and wrap in `IpcResponse<T>`.

```typescript
//  Service: Direct return/throw
static async create(input: InsertAgent): Promise<SelectAgent> {
  const [agent] = await db.insert(agentsTable).values(input).returning();
  if (!agent) throw new Error('Failed to create agent');
  return agent;
}

//  Handler: Try/catch wrapper
ipcMain.handle('agents:create', async (_, input): Promise<IpcResponse<SelectAgent>> => {
  try {
    const result = await AgentService.create(input);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

## =' Common Tasks

### Adding a New Feature

1. **Database Model** (`*.model.ts`) � Run `npm run db:generate` � `npm run db:migrate`
2. **Validation Schema** (`*.schema.ts`) using Zod
3. **Service Layer** (`*.service.ts`) with business logic
4. **IPC Handler** (`*.handler.ts`) for renderer communication
5. **Frontend Route** with TanStack Router loader
6. **React Components** using shadcn/ui patterns

### Debugging Tips

- **Database issues:** Use `npm run db:studio` to inspect data
- **IPC communication:** Check browser DevTools Network tab
- **Type issues:** Run `npm run type-check` for detailed errors
- **Performance:** Use React DevTools Profiler

## =� Testing Strategy

- **Unit Tests:** Service layer business logic
- **Integration Tests:** Database operations
- **Component Tests:** Critical UI components
- **E2E Tests:** Main user workflows (planned)

```bash
# Run tests
npm run test

# With coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## =� Common Pitfalls

### **Avoid These Patterns:**

```typescript
// L NEVER: useEffect for data loading
useEffect(() => {
  window.api.getData().then(setData);
}, []);

// L NEVER: API wrapper classes
class DataAPI {
  static async get() { return window.api.getData(); }
}

// L NEVER: localStorage (use database sessions)
localStorage.setItem('user', JSON.stringify(user));

// L NEVER: Direct SQL migration edits
-- Don't edit 0001_migration.sql directly!
```

### **Do This Instead:**

```typescript
//  CORRECT: Route loader
loader: async () => {
  return await loadApiData(() => window.api.getData());
};

//  CORRECT: TanStack Query
const data = useQuery({
  queryKey: ["data"],
  queryFn: () => window.api.getData(),
});
```

## =� Getting Help

- **Questions:** Create a GitHub Discussion
- **Bugs:** Open a GitHub Issue with reproduction steps
- **Contributions:** Follow the [Contributing Guide](./contributing.md)
- **Architecture:** Check existing patterns in this documentation

## 🔗 Related Documentation

### 📖 **Must Read Next**

- **[Code Simplicity Principles](./code-simplicity-principles.md)** - INLINE-FIRST development philosophy **(10 min)**
- **[Contributing Guide](./contributing.md)** - Complete workflow for contributions **(15 min)**
- **[Coding Standards](./coding-standards.md)** - File naming and structure conventions **(10 min)**

### 🏗️ **Architecture Deep Dives**

- **[Data Loading Patterns](./data-loading-patterns.md)** - TanStack Router hierarchy **(15 min)**
- **[Database Patterns](./database-patterns.md)** - SQLite + Drizzle patterns **(15 min)**
- **[IPC Communication](./ipc-communication-patterns.md)** - Main ↔ Renderer communication **(15 min)**
- **[Error Handling](./error-handling-patterns.md)** - Consistent error management **(15 min)**

### 📋 **Strategic Planning Integration**

- **[PRP Methodology](../prps/README.md)** - AI-optimized planning system that connects to development workflows **(10 min)**
- **[Active PRPs](../prps/01-initials/README.md)** - Current implementation planning examples **(10 min)**
- **[PRP Concepts](../prps/concepts/prp-concept.md)** - Understanding when to use PRPs for complex features **(5 min)**

### ⚡ **Advanced Topics**

- **[Technical Guides](../technical-guides/)** - Deep implementation guides for specialized patterns
  - **[AI Integration](../technical-guides/ai-integration/)** - Multi-provider AI implementation with encryption and queue patterns
  - **[Frontend Architecture](../technical-guides/frontend/)** - React 19 + TanStack Router advanced patterns with MANDATORY data loading hierarchy
  - **[Electron Performance](../technical-guides/electron/)** - Desktop optimization, worker threads, and type-safe IPC patterns
- **[Architecture Documentation](./architecture/)** - System design decisions
- **[Folder Structure](./folder-structure.md)** - Codebase organization

### 🔙 **Navigation**

- **[← Back to Main Documentation](../README.md)**
- **[↑ User Documentation](../user/README.md)** - For end-user perspective
- **[↗ Technical Guides](../technical-guides/README.md)** - Specialized implementation guides

---

## 🎯 Learning Path for New Developers

### **Phase 1: Foundation** _(~30 min)_

1. **Start here** - This Developer Guide overview
2. **[Code Simplicity Principles](./code-simplicity-principles.md)** - Core philosophy
3. **[Contributing Guide](./contributing.md)** - Workflow basics

### **Phase 2: Architecture** _(~60 min)_

4. **[Data Loading Patterns](./data-loading-patterns.md)** - Frontend data flow
5. **[Database Patterns](./database-patterns.md)** - Backend data persistence
6. **[IPC Communication](./ipc-communication-patterns.md)** - Main ↔ Renderer bridge

### **Phase 3: Practice** _(~45 min)_

7. **[Folder Structure](./folder-structure.md)** - Navigate the codebase
8. **[Error Handling](./error-handling-patterns.md)** - Handle errors consistently
9. **Start with a small issue** - Apply the patterns

### **Phase 4: Specialization** _(as needed)_

10. **[Technical Guides](../technical-guides/)** - Deep dive into specific areas
11. **[Architecture Documentation](./architecture/)** - System design understanding

**🎯 Success Criteria:** Can implement a complete feature (DB → Service → IPC → Frontend) following all established patterns

Welcome to the team! 🚀
