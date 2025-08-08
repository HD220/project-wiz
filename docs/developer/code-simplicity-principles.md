# Code Simplicity Principles

> **🚨 CRITICAL:** This document should be read together with **[Agent OS Critical Thinking Workflow](../../.agent-os/instructions/critical-thinking.md)** for complete anti-over-engineering approach.

This document captures the **INLINE-FIRST** philosophy adopted for Project Wiz, designed to optimize for **human readability** and **LLM-human collaboration**.

## 🎯 **Core Philosophy: QUESTION FIRST, CODE SECOND**

**Before writing ANY code, ask these questions:**
1. Can I solve this by writing the code inline instead of creating a function?
2. Am I creating a helper that will be used only once?
3. Am I wrapping an existing API without adding real value?
4. Is this abstraction solving a real problem or just "looking clean"?

**Primary Goal:** Code should be **instantly understandable** by a junior developer without jumping between files or understanding complex abstractions.

**Secondary Goal:** Enable **fast debugging** - find bugs in 30 seconds, not 30 minutes of file jumping.

## 🤖 **LLM Collaboration Context**

### **LLM Tendencies That Hurt Readability:**

- **Over-abstraction** - Creating unnecessary interfaces and classes
- **Premature optimization** - Abstracting before 3+ duplications exist
- **Clean code extremism** - Following patterns that increase complexity
- **Function soup** - Breaking simple logic into 5+ tiny functions

### **MANDATORY PUSHBACK SCENARIOS**

**You MUST challenge these requests immediately:**

- **"Create a helper for..."** → NO. Show them how to do it inline first.
- **"Make a utility function that..."** → STOP. Is this used 3+ times? If not, inline it.
- **"Abstract this into..."** → WHY? What concrete problem does this solve?
- **"Create a wrapper for..."** → RED FLAG. Wrappers are almost always unnecessary.

### **CONFRONTATIONAL RESPONSES (USE THESE)**

- **"NO. Do it inline first, abstract later if you actually need to."**
- **"STOP. This is over-engineering. Here's the simpler way..."**
- **"This approach is wrong because it creates unnecessary complexity."**
- **"Before creating any abstraction, show me 3 places where you'll use it."**

### **What Humans (Especially Juniors) Actually Want:**

- **Linear code flow** - Logic flows top to bottom
- **Visible at a glance** - Everything needed is in one place
- **Self-documenting** - Code explains itself without external context
- **Quick debugging** - Bug location is immediately obvious

## 🚫 **NEVER CREATE THESE**

**Automatic "NO" List:**
- **API wrappers**: `function getUsers() { return api.get('/users'); }`
- **One-line helpers**: `const getTitle = (item) => item.title;`
- **Premature mappers**: `function mapUserToDisplay(user) { return { name: user.name }; }`
- **Generic utilities for specific problems**: `function processItems<T>(...)`
- **Configuration objects for simple components**: Complex prop interfaces with 10+ optional properties
- **Pointless try-catch**: Catching errors just to re-throw them
- **Unnecessary variable assignments**: Creating variables for direct property access

## 📏 **MANDATORY Inline-First Rules**

### **1. Minimize Functions**

**✅ WRITE INLINE WHEN:**

- Logic is **< 15 lines**
- Only used **once**
- **Related operations** that belong together

**❌ EXTRACT FUNCTION ONLY WHEN:**

- **3+ exact duplications** (not similar, EXACT)
- Logic **> 20 lines** of same type
- **Security-critical** operations (encryption, auth)
- **Complex algorithms** (recursive, mathematical)

```typescript
// ✅ CORRECT: Simple logic stays inline
function createAgent(input: CreateAgentInput) {
  // Validation inline
  const validated = CreateAgentSchema.parse(input);

  // Business logic inline
  const permissions =
    validated.role === "admin"
      ? ["read", "write", "delete"]
      : ["read", "write"];

  // Database operation inline
  const [agent] = await db
    .insert(agentsTable)
    .values({
      ...validated,
      permissions,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    })
    .returning();

  return agent;
}

// ❌ WRONG: Unnecessary function extraction
function validateAgentInput(input: CreateAgentInput) {
  return CreateAgentSchema.parse(input); // Just use Zod inline
}

function calculatePermissions(role: string) {
  return role === "admin" ? ["read", "write", "delete"] : ["read", "write"];
}
```

### **2. Inline Simple Operations**

**✅ ALWAYS INLINE:**

- Mathematical calculations
- Simple conditionals
- Property access
- One-line transformations
- Zod validations

```typescript
// ✅ CORRECT: Direct and obvious
const total = price * quantity * (1 + taxRate);
const isValidEmail = email.includes("@") && email.includes(".");
const canEdit = user.role === "admin" || project.ownerId === user.id;
const validated = CreateUserSchema.parse(input);

// ❌ WRONG: Pointless abstraction
function calculateTotal(price: number, quantity: number, taxRate: number) {
  return price * quantity * (1 + taxRate);
}

function isEmailValid(email: string) {
  return email.includes("@") && email.includes(".");
}
```

### **3. Reduce File Jumping**

**✅ KEEP TOGETHER:**

- **Validation + Business Logic + Database Operation**
- **Event Handler + State Update + Side Effects**
- **Component Logic + Render Logic**

**❌ SEPARATE ONLY WHEN:**

- Logic > 20 lines of same type
- 3+ exact duplications
- Different domains (auth vs. payments)

```typescript
// ✅ CORRECT: Everything visible in one place
function handleLogin(email: string, password: string) {
  // Validation inline
  if (!email.includes('@')) return { error: 'Invalid email' };
  if (password.length < 8) return { error: 'Password too short' };

  // Auth logic inline
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user) return { error: 'User not found' };

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return { error: 'Invalid password' };

  // Session creation inline
  const sessionToken = crypto.randomUUID();
  await db.insert(sessionsTable).values({
    userId: user.id,
    token: sessionToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { user: { ...user, password: undefined }, token: sessionToken };
}

// ❌ WRONG: Forces file jumping for simple operation
// auth.service.ts
async function validateCredentials(email: string, password: string) { ... }
// session.service.ts
async function createSession(userId: string) { ... }
// auth.handler.ts
async function handleLogin(email: string, password: string) {
  const user = await AuthService.validateCredentials(email, password);
  const session = await SessionService.createSession(user.id);
  return { user, session };
}
```

### **4. Prefer Explicit Over Abstract**

**✅ WRITE EXPLICITLY:**

- Direct property access
- Inline calculations
- Obvious transformations
- Clear conditionals

```typescript
// ✅ CORRECT: Explicit and clear
const userStats = {
  totalProjects: user.projects.length,
  activeProjects: user.projects.filter((p) => p.status === "active").length,
  completedToday: user.projects.filter(
    (p) =>
      p.completedAt &&
      p.completedAt.toDateString() === new Date().toDateString(),
  ).length,
};

// ❌ WRONG: Unnecessary abstraction
function calculateUserStats(user: User) {
  return {
    totalProjects: getTotalProjects(user),
    activeProjects: getActiveProjects(user),
    completedToday: getCompletedToday(user),
  };
}
```

### **5. Copy-Paste is OK (With Limits)**

**✅ DUPLICATE WHEN:**

- **< 10 lines** of simple logic
- **Different contexts** (user vs. agent validation)
- **Different evolution paths** (will change independently)

**❌ ABSTRACT WHEN:**

- **3+ exact duplications**
- **Complex logic** (> 15 lines)
- **Security-critical** operations
- **Algorithm implementations**

```typescript
// ✅ OK: Similar but contextually different
function createUser(input: CreateUserInput) {
  if (!input.email.includes("@")) throw new Error("Invalid email");
  if (input.password.length < 8) throw new Error("Password too short");
  // ... user-specific logic
}

function createAgent(input: CreateAgentInput) {
  if (!input.email.includes("@")) throw new Error("Invalid email"); // OK to duplicate
  if (!input.name.trim()) throw new Error("Name required");
  // ... agent-specific logic
}

// ❌ ABSTRACT: Complex duplicated logic
function processPayment(type: "user" | "subscription", amount: number) {
  // 30+ lines of identical payment processing logic
  // This should be extracted to PaymentService
}
```

## 🚦 **When to Break the Rules**

### **EXTRACT Functions When:**

1. **Visual Complexity Threshold:**

   ```typescript
   // ❌ Too complex to be inline
   if (
     user.permissions.some(
       (p) =>
         p.scope === "global" ||
         (p.scope === "project" &&
           p.resourceId === project.id &&
           p.actions.includes(action) &&
           (!p.conditions ||
             p.conditions.every((c) => evaluateCondition(c, context)))),
     )
   ) {
     // Extract this monster
   }
   ```

2. **Line Count Threshold:**
   - **> 15 lines** of consecutive validation logic
   - **> 20 lines** of consecutive business logic
   - **> 25 lines** total function length

3. **Duplication Threshold:**
   - **3+ EXACT duplications** (not similar)
   - **Complex logic** being duplicated (> 10 lines)

4. **Domain Complexity:**
   - **Encryption/Security** operations
   - **Complex algorithms** (sorting, searching, mathematical)
   - **External API integration** with multiple steps

### **Real-World Examples in Project Wiz:**

```typescript
// ✅ KEEP INLINE: Service methods
class AgentService {
  static async create(input: InsertAgent): Promise<SelectAgent> {
    // Validation inline (Zod)
    const validated = CreateAgentSchema.parse(input);

    // Check provider exists inline
    const [provider] = await db
      .select()
      .from(providersTable)
      .where(eq(providersTable.id, validated.providerId));

    if (!provider) throw new Error("Provider not found");

    // Business logic inline
    const permissions =
      validated.role === "admin" ? ALL_PERMISSIONS : BASIC_PERMISSIONS;

    // Database operation inline
    const [agent] = await db
      .insert(agentsTable)
      .values({
        ...validated,
        permissions,
        id: crypto.randomUUID(),
      })
      .returning();

    return agent;
  }
}

// ✅ EXTRACT: Complex AI processing
class ConversationService {
  static async processMessage(input: ProcessMessageInput) {
    // Simple validation inline
    const validated = ProcessMessageSchema.parse(input);

    // Complex AI processing extracted
    const aiResponse = await AIProcessor.generateResponse({
      messages: validated.messages,
      context: validated.context,
      agent: validated.agent,
    });

    // Simple persistence inline
    const [message] = await db
      .insert(messagesTable)
      .values({
        conversationId: validated.conversationId,
        content: aiResponse.content,
        metadata: aiResponse.metadata,
      })
      .returning();

    return message;
  }
}
```

## 🎯 **Benefits for LLM-Human Collaboration**

### **For Humans:**

- **Faster debugging** - See entire flow at once
- **Easier onboarding** - No complex architecture to learn
- **Reduced cognitive load** - Less context switching
- **Self-documenting** - Code tells the story

### **For LLMs:**

- **Better context understanding** - See full operation scope
- **Improved code generation** - Less abstraction complexity
- **Easier modifications** - Change logic without breaking abstractions
- **Consistent patterns** - Predictable code structure

### **For Maintenance:**

- **Bug isolation** - Problems are localized
- **Feature changes** - Modifications are contained
- **Performance optimization** - Bottlenecks are visible
- **Testing** - Logic is testable in isolation

## 🤖 **Strategic Connection to PRP Methodology**

The INLINE-FIRST philosophy aligns perfectly with our [PRP (Project Requirements & Planning) methodology](../prps/README.md):

### **Shared AI-Optimization Goals:**

- **PRP Planning**: "Context-is-king" approach provides LLMs with comprehensive implementation context
- **INLINE-FIRST**: Keep related logic together so AI can understand full scope at once
- **Both Systems**: Optimize for LLM understanding while maintaining human readability

### **When to Use PRPs with INLINE-FIRST:**

Consider creating a PRP when INLINE-FIRST principles suggest complexity warrants planning:

- **>3 services affected** → Reference [Service Layer CRUD Duplication PRP](../prps/01-initials/service-layer-crud-duplication-refactor.md)
- **>20 lines of complex logic** → Reference [Agent Service Complexity PRP](../prps/01-initials/agent-service-complexity-refactor.md)
- **Database architecture changes** → Reference [Database Timestamp Standardization PRP](../prps/01-initials/database-timestamp-pattern-standardization.md)
- **Performance implications** → Reference [Database Performance Indexes PRP](../prps/01-initials/database-performance-indexes.md)

### **Workflow Integration:**

```
Assess Feature Complexity → Consider PRP Planning → Apply INLINE-FIRST Implementation → Update PRP Status
        ↑                                                                                    ↓
Complex (>3 services, >20 lines)  ←------ Implementation Learnings -------→  Simple (inline patterns)
```

The [PRP methodology](../prps/README.md) provides strategic planning context that complements INLINE-FIRST tactical implementation, both optimized for effective AI-human collaboration.

## 📋 **Checklist for Code Reviews**

### **Before Writing:**

- [ ] Can this be solved with < 15 lines inline?
- [ ] Is this logic used elsewhere exactly the same way?
- [ ] Would a junior developer understand this in 10 seconds?
- [ ] Can I debug this without opening other files?

### **Before Extracting:**

- [ ] Do I have 3+ exact duplications?
- [ ] Is this > 20 lines of similar logic?
- [ ] Is this security-critical or algorithmically complex?
- [ ] Will this abstraction be used in different contexts?

### **Red Flags (Refactor These):**

- [ ] Functions with only 1-3 lines
- [ ] Classes with single methods
- [ ] Utilities that wrap library functions
- [ ] Helper functions used only once
- [ ] Validators that just call Zod schemas

## 💡 **Remember: Optimize for Human Understanding**

**The best code is code that:**

1. **Junior developers can read** without explanation
2. **Bugs are found** in seconds, not minutes
3. **Changes are made** confidently without fear
4. **LLMs can understand** the full context at once

**Abstraction is a tool, not a goal. Use it when it genuinely helps, not because "clean code" says so.**

---

## 🔗 Related Documentation

### **📖 Must Read Next**

- **[Contributing Guide](./contributing.md)** - Workflow that implements these principles **(15 min)**
- **[Coding Standards](./coding-standards.md)** - File naming and structure patterns with [shadcn/ui integration](../design/component-design-guidelines.md) **(10 min)**
- **[Data Loading Patterns](./data-loading-patterns.md)** - INLINE-FIRST in frontend with [design system components](../design/README.md) **(15 min)**
- **[Design System Overview](../design/README.md)** - Component library that implements INLINE-FIRST principles **(25 min)**

### **🏗️ Implementation Patterns**

- **[Database Patterns](./database-patterns.md)** - INLINE-FIRST in services **(15 min)**
- **[IPC Communication](./ipc-communication-patterns.md)** - Simple service → handler pattern **(15 min)**
- **[Error Handling](./error-handling-patterns.md)** - Consistent error management **(15 min)**

### **🔙 Navigation**

- **[← Back to Developer Guide](./README.md)**
- **[↑ Main Documentation](../README.md)**
- **[🔍 Search & Glossary](../glossary-and-search.md)** - Find specific concepts

### **🎯 Apply These Principles**

- **Next Step:** Read [Contributing Guide](./contributing.md) to see these principles in practice
- **Practice:** Review existing code with the [Red Flags checklist](#red-flags-refactor-these)
- **Implement:** Start with a small feature following [Database Patterns](./database-patterns.md)

**💡 Remember:** These principles guide ALL development patterns in Project Wiz. When in doubt, choose the more inline, more readable option.
