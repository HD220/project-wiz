# Development Best Practices

## Context

Development guidelines for project-wiz Electron desktop application.

<conditional-block context-check="core-principles">
IF this Core Principles section already read in current context:
  SKIP: Re-reading this section
  NOTE: "Using Core Principles already in context"
ELSE:
  READ: The following principles

## Core Principles

### Keep It Simple
- Implement code in the fewest lines possible
- Avoid over-engineering solutions
- Choose straightforward approaches over clever ones

### Optimize for Readability
- Prioritize code clarity over micro-optimizations
- Write self-documenting code with clear variable names
- Add comments only for "why" not "what" and only when extremely necessary

### DRY (Don't Repeat Yourself)
- Extract repeated business logic to private methods
- Extract repeated UI markup to reusable components
- Create utility functions for common operations

### File Structure
- Keep files focused on a single responsibility
- Group related functionality together
- Use consistent naming conventions
</conditional-block>

## Electron Architecture Patterns

### Process Communication
- Use `createIPCHandler` for type-safe IPC communication
- Main process handles database operations and system interactions
- Renderer process focuses on UI logic and user interactions  
- Worker process for AI operations and background queues
- Always validate IPC inputs and outputs with Zod schemas

### File Organization
```
src/
├── main/              # Main process (backend)
│   ├── ipc/          # IPC handlers organized by domain
│   ├── schemas/      # Drizzle ORM database schemas
│   └── services/     # Core services (session, worker management)
├── renderer/         # Renderer process (frontend)
│   ├── app/         # TanStack Router file-based routes
│   ├── components/  # React components (UI primitives, layout)
│   ├── features/    # Feature-specific components and logic
│   └── hooks/       # Custom React hooks
└── shared/          # Code shared between processes
    ├── types/       # Shared TypeScript types and Zod schemas
    ├── services/    # Shared services (logger, event bus)
    └── utils/       # Shared utilities
```

### Security Practices
- **Session Management**: Use JWT tokens with proper expiration
- **Password Security**: Use bcrypt for hashing with appropriate salt rounds
- **API Key Protection**: Encrypt all provider API keys with AES-256-GCM
- **Context Isolation**: Always enable context isolation in Electron
- **Input Validation**: Validate all IPC inputs with Zod schemas
- **Error Handling**: Never expose sensitive information in error messages

## Development Workflow

### Local Development
- `npm run dev` - Start Electron with hot reload (usually already running, don't start)
- `npm run db:studio` - Database inspection and modification via Drizzle Studio
- `npm run db:generate` - Create migrations after schema changes
- `npm run db:migrate` - Apply pending migrations to database

### Quality Assurance
- Always execute `npm run type-check` before task completion (never use `npx tsx`)
- Use `npm run lint:fix` for automatic ESLint corrections
- Verify with `npm run quality:check` before commits (runs lint, type-check, format)
- Never commit code with type errors or linting issues

### Database Changes Workflow
1. Modify schema in `src/main/schemas/[table].schema.ts`
2. Generate migration: `npm run db:generate`
3. Review generated migration file
4. Apply migration: `npm run db:migrate`
5. Verify changes in DB Studio: `npm run db:studio`

### Code Quality Strategy
- **Type Safety**: 100% TypeScript coverage with strict mode
- **Linting**: ESLint with project-specific rules
- **Code Formatting**: Prettier with consistent style
- **Quality Gates**: npm run quality:check before commits
- **Data Validation**: Zod schemas for runtime validation

## Component Architecture

### UI Components
- Use shadcn/ui components from `src/renderer/components/ui/`
- Feature components in `src/renderer/features/[feature]/components/`
- Maintain consistent design system across all components
- Follow composition over inheritance pattern

### Feature Organization
- Group related functionality in `src/renderer/features/[feature]/`
- Each feature should be self-contained with its own:
  - Components (UI logic)
  - Hooks (data fetching and mutations)
  - Schemas (validation logic)  
  - Utils (feature-specific utilities)
- Use barrel exports (`index.ts`) for clean imports
- Avoid cross-feature dependencies when possible

### Routing Patterns
- File-based routing with TanStack Router in `src/renderer/app/`
- Data loading via `loadApiData()` helper for critical data
- Use mutations with `useApiMutation()` hook for consistent error handling
- Implement route-level error boundaries for graceful error handling
- Lazy load routes for better performance

### State Management Strategy
- **TanStack Query** for server state and caching
- **TanStack Router** for routing state and data loading
- **Local React State** for UI-only state (forms, modals, toggles)
- **Event Bus** for cross-process event communication
- Avoid global state unless absolutely necessary

## AI Integration Patterns

### Provider Management
- Support multiple providers via Vercel AI SDK unified interface
- Store provider configurations encrypted in SQLite database
- Use `agent/create` and `agent/update` IPC handlers for configuration
- Validate all provider data through Zod schemas

### AI Operations Architecture
- **Main Process**: Provider configuration and management
- **Worker Process**: AI operations, queue processing, and background tasks
- **Renderer Process**: UI for AI interactions and result display
- Use type-safe communication between all processes

### Error Handling & Security
- Implement provider-specific error handling with graceful degradation
- Add rate limiting and intelligent retry logic for AI operations
- Never log API keys, responses, or sensitive AI data
- Encrypt all provider data at rest using AES-256-GCM
- Validate all AI inputs and outputs through strict schemas

## Database Patterns

### Schema Definition
- Define schemas in `src/main/schemas/*.schema.ts` using Drizzle ORM
- Use TypeScript integration for compile-time type safety
- Follow soft deletion pattern: `deactivatedAt`, `deactivatedBy` columns
- All tables must include: `id` (primary), `createdAt`, `updatedAt` timestamps
- Use appropriate indexes for performance-critical queries

### Query Patterns
- Use type-safe Drizzle queries with proper TypeScript inference
- Implement soft deletion filters in queries (exclude `deactivatedAt IS NOT NULL`)
- Use foreign key constraints with proper cascade behavior
- Batch operations when possible for better performance
- Always handle database errors with proper logging

### Migration Best Practices  
- Review all generated migrations before applying
- Verify migrations on sample data before production
- Use transactions for complex multi-step migrations
- Document breaking changes in migration comments
- Keep migrations idempotent when possible

<conditional-block context-check="dependencies" task-condition="choosing-external-library">
IF current task involves choosing an external library:
  IF Dependencies section already read in current context:
    SKIP: Re-reading this section  
    NOTE: "Using Dependencies guidelines already in context"
  ELSE:
    READ: The following guidelines
ELSE:
  SKIP: Dependencies section not relevant to current task

## Dependencies

### Choose Libraries Wisely
When adding third-party dependencies:
- Select the most popular and actively maintained option
- Check the library's GitHub repository for:
  - Recent commits (within last 6 months)
  - Active issue resolution
  - Number of stars/downloads
  - Clear documentation and TypeScript support
- Prefer libraries that integrate well with existing stack
- Consider bundle size impact on Electron app performance
- Ensure compatibility with Electron's security model
</conditional-block>

## Performance Considerations

### Electron-Specific Optimizations
- Minimize main process blocking operations
- Use Worker processes for CPU-intensive tasks
- Implement proper memory management in long-running processes
- Optimize IPC communication frequency and payload size
- Use lazy loading for non-critical UI components

### Database Performance
- Use appropriate indexes for frequently queried columns
- Implement pagination for large data sets
- Use database-level filtering instead of in-memory operations
- Monitor query performance with Drizzle Studio
- Consider read replicas for heavy query workloads

## Error Handling Standards

### IPC Error Pattern
```typescript
// Always return structured errors
return { success: false, error: 'User-friendly error message' };

// Log detailed errors for debugging
logger.error('Detailed error context', { error, input, context });
```

### UI Error Boundaries
- Implement error boundaries at route level
- Show user-friendly error messages via toast notifications  
- Provide fallback UI for critical component failures
- Log client-side errors for debugging

### Graceful Degradation
- Handle offline scenarios gracefully
- Provide fallback functionality when AI providers are unavailable
- Show loading states for async operations
- Implement retry mechanisms with exponential backoff