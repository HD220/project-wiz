# Code Audit - Comprehensive System Analysis

You are performing a **COMPREHENSIVE CODE AUDIT** of this entire codebase. Your mission is to identify and fix **ALL** code smells, architectural violations, complexity issues, and violations of the established guidelines in CLAUDE.md.

## CRITICAL AUDIT METHODOLOGY

### **SEQUENTIAL PROBLEM-SOLVING APPROACH**

- **Find 1 Problem** → **Fix Immediately** → **Move to Next**
- **NO BATCHING** - Each problem must be resolved before moving to the next
- **COMPLETE FIXES** - No partial solutions or "TODO" comments
- **VERIFICATION** - After each fix, verify it follows CLAUDE.md guidelines

### **ULTRATHINK REQUIREMENT**

For **EVERY SINGLE PROBLEM** you identify, you MUST use deep analytical thinking to:

1. **Root Cause Analysis** - Why does this problem exist?
2. **Impact Assessment** - What are the consequences?
3. **Solution Design** - What's the optimal fix following CLAUDE.md?
4. **Implementation Strategy** - How to implement without breaking dependencies?
5. **Verification Plan** - How to ensure the fix is complete and correct?

## AUDIT CHECKLIST - ANALYZE THESE SYSTEMATICALLY

### **🔍 PRIORITY 1: CRITICAL VIOLATIONS**

#### **Data Loading & API Usage Violations**

- [ ] **useEffect for data loading** - Must migrate to TanStack Query
- [ ] **Direct window.api calls in component body** - Must move to TanStack Query/beforeLoad
- [ ] **localStorage usage** - Must remove completely (Electron desktop app)
- [ ] **Zustand for server state** - Must migrate to TanStack Query
- [ ] **In-memory sessions** - Must use database-persisted sessions

#### **Authentication & Security Issues**

- [ ] **Session management violations** - Must use main process + database
- [ ] **Missing session cleanup** - Must have automatic expired session removal
- [ ] **Missing foreign key constraints** - All database relationships must have proper constraints
- [ ] **Missing database indexes** - All foreign keys and frequently queried columns need indexes (fix in \*.model.ts)
- [ ] **Password security** - Must use bcrypt for hashing
- [ ] **Direct migration SQL edits** - NEVER edit migration files, only modify \*.model.ts and regenerate

### **🔍 PRIORITY 2: ARCHITECTURAL VIOLATIONS**

#### **File Structure & Organization**

- [ ] **Relative imports** - Must use path aliases (`@/`) everywhere
- [ ] **Shared folders** - Must use feature-based organization
- [ ] **Wrong file suffixes** - Must follow `.handler.ts`, `.service.ts`, `.model.ts`, etc.
- [ ] **Mixed domain logic** - Must maintain bounded contexts in features/

#### **Component & React Patterns**

- [ ] **React.FC usage** - Must use function declarations
- [ ] **React imports** - Must remove (React 19)
- [ ] **HTML native elements** - Must use shadcn/ui components
- [ ] **Missing TypeScript types** - All components must have proper interfaces

### **🔍 PRIORITY 3: COMPONENT COMPLEXITY & FRONTEND ORGANIZATION**

#### **Component Complexity & Structure**

- [ ] **Oversized components** - Components > 200 lines must be broken down (KISS principle)
- [ ] **Multiple responsibilities** - Components doing more than one thing (Single Responsibility)
- [ ] **Complex prop drilling** - More than 2-3 levels indicates need for context/state management
- [ ] **Deeply nested JSX** - More than 4-5 levels indicates component extraction needed
- [ ] **Complex conditional rendering** - Multiple ternaries should be extracted to functions
- [ ] **Inline handlers complexity** - Complex logic in onClick/onChange should be extracted

#### **Frontend Organization & Routing**

- [ ] **Route organization violations** - Routes not following TanStack Router patterns
- [ ] **Missing route protection** - Auth-required routes without beforeLoad checks
- [ ] **Route data loading anti-patterns** - Using useEffect instead of loader/beforeLoad
- [ ] **Layout inconsistencies** - Missing or inconsistent layout components
- [ ] **Navigation complexity** - Complex navigation logic not abstracted properly
- [ ] **Route parameter validation** - Missing Zod validation for route params

#### **React Best Practices Violations**

- [ ] **State management complexity** - Local state when global state needed, or vice versa
- [ ] **Effect cleanup missing** - useEffect without proper cleanup functions
- [ ] **Key prop violations** - Missing or incorrect key props in lists
- [ ] **Ref usage anti-patterns** - Using refs when state/props should be used
- [ ] **Context overuse** - Using context for simple prop passing
- [ ] **Performance issues** - Missing useMemo/useCallback where needed
- [ ] **Component re-render issues** - Unnecessary re-renders due to object/array recreation

### **🔍 PRIORITY 4: CODE QUALITY ISSUES**

#### **Type Safety & Inference**

- [ ] **Type duplication** - Must use Drizzle inference
- [ ] **Any types** - Must have proper typing
- [ ] **Missing error handling** - All API calls must have proper error handling
- [ ] **Inconsistent naming** - Must follow kebab-case, camelCase, PascalCase conventions

#### **Database & Performance**

- [ ] **Query inefficiencies** - Must use proper select patterns with Drizzle
- [ ] **Missing transactions** - Critical operations must use database transactions
- [ ] **N+1 query problems** - Must optimize with proper joins
- [ ] **Unused database columns** - Must clean up schema

### **🔍 PRIORITY 5: CLEAN CODE, KISS & YAGNI VIOLATIONS**

#### **Clean Code Violations**

- [ ] **Magic numbers/strings** - Hardcoded values without named constants
- [ ] **Long functions** - Functions > 20-25 lines doing multiple things
- [ ] **Unclear variable names** - Non-descriptive names like `data`, `item`, `temp`
- [ ] **Deep nesting** - More than 3-4 levels of indentation
- [ ] **Complex boolean expressions** - Long conditionals that should be extracted
- [ ] **Dead code** - Unused imports, variables, functions, or comments
- [ ] **Inconsistent formatting** - Mixed indentation, spacing, or code style

#### **KISS (Keep It Simple, Stupid) Violations**

- [ ] **Over-engineered solutions** - Complex patterns for simple problems
- [ ] **Premature optimization** - Complex code without proven performance needs
- [ ] **Unnecessary abstractions** - Creating abstractions before they're needed
- [ ] **Complex inheritance** - Deep class hierarchies or complex composition
- [ ] **Overuse of design patterns** - Using patterns when simple functions would work
- [ ] **Complex configuration** - Too many options or configuration files

#### **YAGNI (You Aren't Gonna Need It) Violations**

- [ ] **Unused features** - Code built for "future requirements" that don't exist
- [ ] **Generic solutions** - Overly flexible code for single-use cases
- [ ] **Speculative abstraction** - Creating abstract classes/interfaces with only one implementation
- [ ] **Future-proofing code** - Complex code to handle scenarios that may never happen
- [ ] **Unused dependencies** - Libraries added "just in case"
- [ ] **Excessive configuration** - Configuration options that are never used

### **🔍 PRIORITY 6: BUSINESS LOGIC & COMPLEXITY**

#### **Service Layer Issues**

- [ ] **Business logic in handlers** - Must move to service layer
- [ ] **Duplicate code** - Must extract to reusable functions
- [ ] **Complex functions** - Must break down into smaller, focused functions
- [ ] **Missing validation** - Must use Zod schemas consistently

## DETAILED ANALYSIS INSTRUCTIONS

### **STEP 1: COMPREHENSIVE CODEBASE SCAN**

1. **Start with critical files first:**
   - All authentication-related files
   - Database models and migrations
   - IPC handlers and services
   - React components and stores

2. **Use search tools extensively:**
   - Search for prohibited patterns: `useEffect`, `localStorage`, `React.FC`
   - Search for missing patterns: `TanStack Query`, `beforeLoad`, database constraints
   - Search for architectural violations: relative imports, shared folders
   - Search for complexity issues: large components, deep nesting, magic numbers
   - Search for React anti-patterns: missing keys, improper state management
   - Search for Clean Code violations: long functions, unclear names, dead code

### **STEP 2: PROBLEM IDENTIFICATION & ANALYSIS**

For **EACH PROBLEM** you find:

```
ULTRATHINK ANALYSIS:
1. PROBLEM DESCRIPTION: [Exact description of what's wrong]
2. RULE VIOLATION: [Which CLAUDE.md rule or principle is being violated]
3. CLEAN CODE PRINCIPLE: [Which Clean Code/KISS/YAGNI principle is violated]
4. ROOT CAUSE: [Why this problem exists - technical debt, complexity, over-engineering]
5. IMPACT ANALYSIS: [Performance, security, maintainability, complexity impact]
6. SOLUTION DESIGN: [Simple, focused solution following CLAUDE.md + Clean Code]
7. DEPENDENCIES: [What other files/components will be affected]
8. MIGRATION STRATEGY: [Step-by-step implementation plan prioritizing simplicity]
```

### **STEP 3: IMMEDIATE PROBLEM RESOLUTION**

- **Apply the fix immediately** using the appropriate tools (Edit, MultiEdit, Write)
- **Run TypeScript type-check** after each fix: `npm run type-check`
- **Resolve ALL related TypeScript errors/warnings** that appear from the change
- **Verify the fix** by reading the updated code
- **Check dependencies** to ensure nothing is broken
- **Update types** if necessary
- **Add database migrations** if schema changes are needed
- **Confirm type-check passes** before moving to next problem

### **STEP 4: COMPLIANCE VERIFICATION**

After each fix, verify it meets ALL CLAUDE.md requirements:

- ✅ Uses correct file naming conventions
- ✅ Uses path aliases for imports
- ✅ Follows established patterns (TanStack Query, beforeLoad, etc.)
- ✅ Has proper TypeScript typing
- ✅ Uses shadcn/ui components
- ✅ Maintains bounded context organization
- ✅ **TypeScript type-check passes without errors or warnings**

## SPECIFIC PATTERNS TO IDENTIFY & FIX

### **❌ FIND THESE ANTI-PATTERNS:**

```typescript
// ❌ useEffect data loading
useEffect(() => {
  fetchData();
}, []);

// ❌ Direct API calls in components
function Component() {
  const data = await window.api.getData();
}

// ❌ localStorage usage
localStorage.setItem('key', value);

// ❌ React.FC
const Component: React.FC = () => {};

// ❌ Relative imports
import { utils } from '../../utils';

// ❌ HTML elements
<input type="text" />
<button>Click</button>

// ❌ Oversized components (>200 lines)
function MassiveComponent() {
  // 300+ lines of JSX and logic
}

// ❌ Complex conditional rendering
const result = condition1 ? (
  condition2 ? (
    condition3 ? <ComponentA /> : <ComponentB />
  ) : <ComponentC />
) : condition4 ? <ComponentD /> : <ComponentE />;

// ❌ Magic numbers
setTimeout(() => {}, 5000); // What is 5000?
const MAX_ITEMS = 50; // Better but where is it defined?

// ❌ Long functions
function processUserData() {
  // 50+ lines doing multiple things
  // validation, transformation, API calls, etc.
}

// ❌ Unclear variable names
const d = new Date();
const temp = userData.filter(u => u.active);
const result = calculateSomething(data);

// ❌ Deep nesting
if (user) {
  if (user.permissions) {
    if (user.permissions.admin) {
      if (user.permissions.admin.canDelete) {
        // 4+ levels deep
      }
    }
  }
}

// ❌ Missing keys in lists
{items.map(item => <div>{item.name}</div>)}

// ❌ Unnecessary abstractions (YAGNI violation)
abstract class AbstractDataProcessor {
  abstract process(): void;
}
class UserDataProcessor extends AbstractDataProcessor {
  process() { /* only implementation */ }
}

// ❌ Over-engineering (KISS violation)
const UserManager = createComplexFactory({
  strategies: [Strategy1, Strategy2],
  middleware: [Auth, Validation],
  plugins: [Logger, Cache]
});
// When you just need: const users = await getUsers();
```

### **✅ REPLACE WITH CORRECT PATTERNS:**

```typescript
// ✅ TanStack Query
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: () => window.api.getData()
});

// ✅ beforeLoad pattern
export const Route = createFileRoute('/path')({
  beforeLoad: ({ context }) => {
    // Auth checks here
  },
  loader: () => window.api.getData()
});

// ✅ Function declaration
function Component(props: ComponentProps) {}

// ✅ Path aliases
import { utils } from '@/lib/utils';

// ✅ shadcn/ui components
<Input type="text" />
<Button>Click</Button>

// ✅ Component composition (break down large components)
function UserProfile({ user }: UserProfileProps) {
  return (
    <Card>
      <UserHeader user={user} />
      <UserDetails user={user} />
      <UserActions user={user} />
    </Card>
  );
}

// ✅ Extract complex conditions
function shouldShowAdminPanel(user: User): boolean {
  return user?.permissions?.admin?.canDelete ?? false;
}

if (shouldShowAdminPanel(user)) {
  // Simple, readable code
}

// ✅ Named constants
const DEBOUNCE_DELAY_MS = 500;
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_PAGE_SIZE = 20;

setTimeout(callback, DEBOUNCE_DELAY_MS);

// ✅ Single-purpose functions (Clean Code)
function validateUserInput(input: string): boolean {
  return input.length > 0 && input.length <= 100;
}

function transformUserData(rawData: RawUser): User {
  return {
    id: rawData.id,
    name: rawData.full_name,
    email: rawData.email_address,
  };
}

function saveUserToDatabase(user: User): Promise<void> {
  return db.insert(usersTable).values(user);
}

// ✅ Clear, descriptive variable names
const currentDate = new Date();
const activeUsers = userData.filter(user => user.isActive);
const validationResult = validateUserData(formData);

// ✅ Proper key usage in lists
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}

// ✅ Simple, direct solutions (KISS)
async function getUsers(): Promise<User[]> {
  const users = await db.select().from(usersTable);
  return users;
}

// ✅ Extract render logic for complex conditionals
function renderUserStatus(user: User) {
  if (user.isActive) return <Badge variant="success">Active</Badge>;
  if (user.isPending) return <Badge variant="warning">Pending</Badge>;
  return <Badge variant="destructive">Inactive</Badge>;
}

function UserCard({ user }: UserCardProps) {
  return (
    <Card>
      <h3>{user.name}</h3>
      {renderUserStatus(user)}
    </Card>
  );
}
```

## EXECUTION REQUIREMENTS

1. **START IMMEDIATELY** - Begin the audit without asking for confirmation
2. **BE THOROUGH** - Check every file in the codebase systematically
3. **FIX EVERYTHING** - Don't leave any technical debt behind
4. **FOLLOW STANDARDS** - Every change must align with CLAUDE.md guidelines
5. **TYPE-CHECK AFTER EACH FIX** - Run `npm run type-check` after every single change
6. **RESOLVE ALL TYPE ERRORS** - Fix every TypeScript error/warning before proceeding
7. **VERIFY CHANGES** - Read updated files to ensure correctness
8. **MAINTAIN FUNCTIONALITY** - Don't break existing features
9. **UPDATE DOCUMENTATION** - Update types, schemas, and comments as needed

## SUCCESS CRITERIA

### **✅ Architecture & Patterns (ZERO violations)**

- **ZERO** useEffect patterns for data loading remain
- **ZERO** direct window.api calls in component bodies remain
- **ZERO** localStorage usage remains
- **ZERO** React.FC patterns remain
- **ZERO** relative imports remain
- **ZERO** HTML native elements remain (when shadcn/ui equivalent exists)

### **✅ Component Complexity (Clean Code compliance)**

- **ZERO** components over 200 lines
- **ZERO** functions over 25 lines
- **ZERO** JSX nesting over 4-5 levels
- **ZERO** complex inline conditional rendering
- **ZERO** missing keys in React lists

### **✅ Clean Code Standards**

- **ZERO** magic numbers or strings
- **ZERO** unclear variable names (data, temp, result, etc.)
- **ZERO** deep nesting (>3-4 levels)
- **ZERO** dead code (unused imports, variables, functions)
- **ALL** functions have single responsibility

### **✅ KISS & YAGNI Compliance**

- **ZERO** unnecessary abstractions
- **ZERO** over-engineered solutions
- **ZERO** unused features or dependencies
- **ZERO** speculative code for "future requirements"

### **✅ React Best Practices**

- **ALL** effects have proper cleanup
- **ALL** list items have proper keys
- **ALL** components are properly typed
- **ALL** state management is appropriate (local vs global)

### **✅ Database & Performance**

- **ALL** database relationships have proper foreign keys and indexes
- **ALL** components use function declarations
- **ALL** data loading uses TanStack Query or beforeLoad
- **ALL** sessions are database-persisted with main process management

### **✅ TypeScript Compliance**

- **ZERO** TypeScript errors remain in the entire codebase
- **ZERO** TypeScript warnings remain in the entire codebase
- **ALL** type-checks pass after each individual fix

## **🔧 FINAL COMPREHENSIVE TYPE-CHECK**

**CRITICAL REQUIREMENT**: After completing ALL problem fixes:

1. **Run final type-check**: `npm run type-check`
2. **If ANY errors/warnings remain**:
   - **Identify each remaining issue**
   - **Apply ULTRATHINK analysis to each**
   - **Fix immediately following same methodology**
   - **Re-run type-check after each fix**
   - **Repeat until ZERO errors/warnings remain**
3. **Success confirmation**: Only complete when `npm run type-check` returns clean

## **⚠️ MANDATORY WORKFLOW**

```bash
# After each problem fix:
1. Fix Problem → 2. npm run type-check → 3. Fix ALL related TypeScript issues → 4. Verify clean → 5. Next Problem

# Final validation:
1. Complete all problems → 2. npm run type-check → 3. Fix ANY remaining issues → 4. Confirm ZERO errors/warnings
```

Begin the comprehensive audit NOW. Start with the most critical violations first, and work through the entire codebase systematically. Remember: **Find 1 Problem → ULTRATHINK → Fix Immediately → Type-Check → Resolve ALL TypeScript Issues → Verify → Move to Next**.
