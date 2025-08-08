# Code Style Guide

## Context

Code style rules for project-wiz Electron desktop application.

<conditional-block context-check="general-formatting">
IF this General Formatting section already read in current context:
  SKIP: Re-reading this section
  NOTE: "Using General Formatting rules already in context"
ELSE:
  READ: The following formatting rules

## General Formatting

### Indentation
- Use 2 spaces for indentation (never tabs)
- Maintain consistent indentation throughout files
- Align nested structures for readability

### Naming Conventions
- **Files**: kebab-case (user-profile.tsx, agent-card.tsx)
- **Variables/Functions**: camelCase (userProfile, calculateTotal, createAgent)
- **Components**: PascalCase (UserProfile, AgentCard, PaymentProcessor)
- **Types/Interfaces**: PascalCase (UserType, ApiResponse, AgentData)
- **Constants**: UPPER_SNAKE_CASE (MAX_RETRY_COUNT, API_ENDPOINTS)
- **Database columns**: snake_case (created_at, user_id, deactivated_at)

### String Formatting
- Use single quotes for strings: `'Hello World'`
- Use double quotes only when interpolation is needed
- Use template literals for multi-line strings or complex interpolation

### Code Comments
- Não deixe comentarios no codigo a não ser que seja extremamente necessario para o entendimento da funcionalidade
- Document complex algorithms or calculations only when absolutely necessary
- Explain the "why" behind implementation choices if not obvious
- Never remove existing comments unless removing the associated code
- Update comments when modifying code to maintain accuracy
- Keep comments concise and relevant
</conditional-block>

<conditional-block task-condition="html-css-tailwind" context-check="html-css-style">
IF current task involves writing or updating HTML, CSS, or TailwindCSS:
  IF html-style.md AND css-style.md already in context:
    SKIP: Re-reading these files
    NOTE: "Using HTML/CSS style guides already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get HTML formatting rules from code-style/html-style.md"
        REQUEST: "Get CSS and TailwindCSS rules from code-style/css-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ the following style guides (only if not already in context):
        - @.agent-os/standards/code-style/html-style.md (if not in context)
        - @.agent-os/standards/code-style/css-style.md (if not in context)
    </context_fetcher_strategy>
ELSE:
  SKIP: HTML/CSS style guides not relevant to current task
</conditional-block>

<conditional-block task-condition="typescript" context-check="typescript-style">
IF current task involves writing or updating TypeScript:
  IF typescript-style.md already in context:
    SKIP: Re-reading this file
    NOTE: "Using TypeScript style guide already in context"
  ELSE:
    <context_fetcher_strategy>
      IF current agent is Claude Code AND context-fetcher agent exists:
        USE: @agent:context-fetcher
        REQUEST: "Get TypeScript style rules from code-style/typescript-style.md"
        PROCESS: Returned style rules
      ELSE:
        READ: @.agent-os/standards/code-style/typescript-style.md
    </context_fetcher_strategy>
ELSE:
  SKIP: TypeScript style guide not relevant to current task
</conditional-block>

## Type Conversion Policy
- Do not use type conversions like `as any`, `as unknown`, or `as Type`
- Seek to understand the origin of the data and use the correct type
- Type conversions should only be used in exceptional cases and must be justified
- Use type guards and proper validation instead of type assertions

## Import Organization
- Use absolute imports with `@/` alias
- Group imports: external dependencies, internal modules, types, styles
- Avoid circular dependencies (enforced by ESLint boundaries)
- Use barrel exports for clean feature imports

## Anti-Over-Engineering Patterns

### TypeScript Best Practices
- **Use `type` over `interface`** for simple object shapes
- **Let TypeScript infer return types** - don't annotate what's already obvious
- **Use Zod schema inference** - `type User = z.infer<typeof userSchema>`
- **Avoid excessive `unknown`** - use specific types when structure is known
- **No type casting** - refactor structure instead of using `as any` or `as Type`

### React Component Guidelines
- **Simple function components** - no `React.FC` wrapper
- **Proper type definitions** - separate `type ComponentProps = {}` declarations
- **Direct property access** - use `user.name` instead of `const name = user.name`
- **Minimal props** - create different components instead of complex prop interfaces
- **Composable design** - use shadcn primitives inside components

### Function Signatures
- **Useful abstractions only** - functions that eliminate real duplication
- **Business logic naming** - complex calculations deserve descriptive names
- **No wrapper functions** - don't wrap existing APIs without adding value
- **Inline simple operations** - don't create functions for one-line operations

### Error Handling
- **Let errors bubble** - don't catch just to re-throw
- **Handle specific errors** - only catch what you can actually handle
- **Validate beforehand** - check constraints before operations when possible
- **Informative messages** - provide context without exposing internals

### Constants and Magic Values
```typescript
// ✅ Good: Centralize repeated values
const USER_ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
} as const;

// ✅ Good: Business logic functions for complex checks
function canManageUsers(user: User) {
  return user.role === USER_ROLES.ADMIN && 
         user.status === 'active' && 
         user.permissions.includes('manage_users');
}
```