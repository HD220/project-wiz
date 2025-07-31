# Contributing Guide

Thank you for your interest in contributing to Project Wiz! This guide will help you get started with contributing to our AI-powered software development automation platform.

## =� Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **Git** knowledge and GitHub account
- **TypeScript** and **React** experience
- **SQLite** basics (helpful but not required)

### Development Setup

1. **Fork and clone:**

   ```bash
   git clone https://github.com/YOUR-USERNAME/project-wiz.git
   cd project-wiz
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Setup environment:**

   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Initialize database:**

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start development:**
   ```bash
   npm run dev
   ```

## =� Contribution Workflow

### 1. **Find or Create an Issue**

- Browse [GitHub Issues](https://github.com/HD220/project-wiz/issues)
- Look for `good first issue` or `help wanted` labels
- **For new features:** Create an issue first to discuss the approach

### 2. **Create a Feature Branch**

```bash
# Create branch from main development branch
git checkout jules-new-architecture
git pull origin jules-new-architecture
git checkout -b feature/your-feature-name

# Or for bugs
git checkout -b fix/issue-description
```

### 3. **Follow Our Coding Standards**

#### **MUST READ:**

- **[Code Simplicity Principles](./code-simplicity-principles.md)** - INLINE-FIRST philosophy
- **[Data Loading Patterns](./data-loading-patterns.md)** - TanStack Router hierarchy
- **[Database Patterns](./database-patterns.md)** - SQLite + Drizzle patterns
- **[IPC Communication Patterns](./ipc-communication-patterns.md)** - Main � Renderer

#### **Key Rules:**

-  **INLINE-FIRST:** Write simple logic inline, extract only when 3+ exact duplications
-  **Function declarations** for React components (NOT React.FC)
-  **shadcn/ui components** (NEVER plain HTML)
-  **Database migrations** through `*.model.ts` � `npm run db:generate`
- L **NEVER** edit SQL migration files directly

### 4. **Write Quality Code**

#### **File Naming (kebab-case):**

```
user-profile.tsx         # React components
auth-service.ts          # Service layer
user.model.ts           # Database models
auth.schema.ts          # Zod validation
use-auth.hook.ts        # Custom hooks
```

#### **Component Pattern:**

```typescript
//  CORRECT: Function declaration with props destructuring
export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  // INLINE validation, state, and handlers
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: UserData) => {
    setIsLoading(true);
    try {
      await window.api.users.update(userId, data);
      onUpdate();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      {/* Use shadcn/ui components */}
    </Card>
  );
}

// L WRONG: React.FC, arrow functions, HTML elements
const UserProfile: React.FC<Props> = (props) => {
  return <div>...</div>; // Use Card component instead
};
```

#### **Service Pattern:**

```typescript
//  CORRECT: Return data directly, throw errors
export class UserService {
  static async create(input: InsertUser): Promise<SelectUser> {
    // Validation inline
    const validated = CreateUserSchema.parse(input);

    // Business logic inline
    const hashedPassword = await bcrypt.hash(validated.password, 12);

    // Database operation inline
    const [user] = await db
      .insert(usersTable)
      .values({ ...validated, password: hashedPassword })
      .returning();

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }
}
```

### 5. **Testing Requirements**

#### **Run Tests Before Committing:**

```bash
# Comprehensive quality check
npm run quality:check

# Individual checks
npm run lint          # ESLint
npm run type-check    # TypeScript validation
npm run format        # Prettier formatting
npm run test          # Vitest unit tests
```

#### **Write Tests For:**

- **Service layer methods** (business logic)
- **Database operations** (integration tests)
- **Complex utility functions**
- **Critical UI components**

```typescript
// Example service test
describe("UserService", () => {
  it("should create user with hashed password", async () => {
    const input = { username: "test", password: "password123" };

    const user = await UserService.create(input);

    expect(user.username).toBe("test");
    expect(user.password).not.toBe("password123"); // Should be hashed
  });
});
```

### 6. **Database Changes**

#### **CRITICAL:** Never Edit SQL Files Directly

```bash
# 1. Modify the model file
# src/main/features/user/user.model.ts

# 2. Generate migration
npm run db:generate

# 3. Apply migration
npm run db:migrate

# 4. Commit both model changes AND generated migration
git add src/main/features/user/user.model.ts
git add src/main/database/migrations/
```

### 7. **Commit Standards**

#### **Commit Message Format:**

```
type(scope): description

feat(auth): add two-factor authentication
fix(ui): resolve sidebar navigation bug
refactor(db): simplify user query patterns
docs(api): update authentication guide
```

#### **Types:**

- `feat` - New features
- `fix` - Bug fixes
- `refactor` - Code improvements without behavior change
- `docs` - Documentation changes
- `test` - Test additions/changes
- `chore` - Build process, tooling changes

### 8. **Pull Request Process**

1. **Create PR against `jules-new-architecture` branch**
2. **Fill out PR template completely**
3. **Ensure all checks pass:**
   -  All tests passing
   -  Type checking clean
   -  Linting passing
   -  Build succeeds

4. **Request review from maintainers**
5. **Address feedback promptly**

#### **PR Title Format:**

```
feat(auth): implement two-factor authentication

fix(ui): resolve mobile navigation overflow issue

refactor(agents): simplify service layer patterns
```

## <� Contribution Areas

### **Good First Issues:**

1. **Documentation Improvements**
   - Fix typos and unclear sections
   - Add code examples
   - Improve README files

2. **UI Enhancements**
   - Improve component styling
   - Add loading states
   - Enhance responsive design

3. **Testing**
   - Add missing test coverage
   - Write integration tests
   - Improve test utilities

### **Intermediate Contributions:**

1. **Feature Implementation**
   - New UI components
   - Service layer methods
   - Database model extensions

2. **Bug Fixes**
   - Resolve GitHub issues
   - Fix edge cases
   - Improve error handling

3. **Performance Improvements**
   - Optimize database queries
   - Improve component rendering
   - Reduce bundle size

### **Advanced Contributions:**

1. **Architecture Improvements**
   - New design patterns
   - Performance optimizations
   - Security enhancements

2. **New Feature Areas**
   - AI integration improvements
   - Advanced agent capabilities
   - System orchestration

## =� Common Mistakes to Avoid

### **Code Quality Issues:**

```typescript
// L DON'T: Extract single-use functions
function validateEmail(email: string) {
  return email.includes('@'); // Just use inline
}

// L DON'T: Use React.FC or arrow functions
const Component: React.FC = () => <div />;

// L DON'T: Use HTML elements directly
return <div className="card">...</div>; // Use <Card> from shadcn/ui

// L DON'T: useEffect for data loading
useEffect(() => {
  fetchData().then(setData);
}, []);
```

### **Architecture Violations:**

```typescript
// L DON'T: Skip the data loading hierarchy
// Use Router loader � TanStack Query � Local State � Custom Hooks

// L DON'T: Edit SQL migrations directly
-- 0001_create_users.sql
-- Don't edit this file!

// L DON'T: Use localStorage in desktop app
localStorage.setItem('user', data); // Use database sessions

// L DON'T: Create API wrapper classes
class UserAPI {
  static get() { return window.api.users.get(); } // Unnecessary
}
```

## =� Getting Help

### **Communication Channels:**

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - Questions and general discussion
- **Pull Request Reviews** - Code feedback and guidance

### **Documentation Resources:**

- **[Developer README](./README.md)** - Complete development guide
- **[Code Simplicity Principles](./code-simplicity-principles.md)** - Core philosophy
- **[Architecture Patterns](../README.md)** - All pattern documentation

### **Review Process:**

1. **Self-review** using our checklist
2. **Automated checks** must pass
3. **Maintainer review** within 48-72 hours
4. **Address feedback** and iterate
5. **Merge** when approved

##  Pre-Commit Checklist

Before submitting your PR:

- [ ] **Read relevant pattern documentation**
- [ ] **Follow INLINE-FIRST principles**
- [ ] **Use function declarations for components**
- [ ] **Database changes through model files only**
- [ ] **All tests passing** (`npm run quality:check`)
- [ ] **TypeScript clean** (no type errors)
- [ ] **Linting clean** (ESLint passing)
- [ ] **Proper commit messages** (conventional format)
- [ ] **PR description** filled out completely
- [ ] **Related issues** linked in PR

## <� Recognition

Contributors are recognized in:

- **GitHub contributors list**
- **Release notes** for significant contributions
- **Project documentation** for pattern creators
- **Community acknowledgments**

Thank you for contributing to Project Wiz! Every contribution helps make AI-powered development more accessible and powerful. =�
