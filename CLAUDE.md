# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # Start Electron app with hot reload
npm run build        # Build the application for production
npm run package      # Package the app without making distributables
```

### Database
```bash
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Apply migrations to database
npm run db:studio    # Open Drizzle Studio for database inspection
```

### Quality & Testing
```bash
npm run lint         # Run ESLint checks
npm run lint:fix     # Auto-fix ESLint issues
npm run type-check   # Run TypeScript type checking
npm run test         # Run Vitest tests
npm run test:watch   # Run tests in watch mode
npm run format       # Format code with Prettier
npm run quality:check # Run all quality checks (lint, type-check, format, test)
```

### Internationalization
```bash
npm run extract      # Extract i18n messages
npm run compile      # Compile i18n messages with TypeScript support
```

## Architecture

### Application Structure
This is an Electron desktop application with:
- **Main Process**: Node.js backend handling IPC, database operations, and system interactions
- **Renderer Process**: React 19 frontend with TanStack Router for navigation
- **Worker Process**: Background tasks for AI operations and queue processing
- **IPC Communication**: Type-safe message passing between processes using `createIPCHandler`

### Key Directories
- `src/main/` - Main process (backend)
  - `ipc/` - IPC handlers organized by domain (auth, user, agent, project, etc.)
  - `schemas/` - Drizzle ORM database schemas
  - `services/` - Core services (session management, worker management)
- `src/renderer/` - Renderer process (frontend)
  - `app/` - TanStack Router file-based routes
  - `components/` - React components (UI primitives, layout, features)
  - `features/` - Feature-specific components and logic
  - `hooks/` - Custom React hooks
- `src/shared/` - Code shared between processes
  - `types/` - Shared TypeScript types and Zod schemas
  - `services/` - Shared services (logger, event bus)
  - `utils/` - Shared utilities (including IPC handler creator)

### IPC Pattern
All IPC communication follows a standardized pattern using `createIPCHandler`:

```typescript
// Main process handler (src/main/ipc/[domain]/[action]/invoke.ts)
const handler = createIPCHandler({
  inputSchema: zod.schema,    // Input validation
  outputSchema: zod.schema,    // Output validation
  handler: async (input) => {
    // Business logic here
    return result;
  }
});
```

### Database Pattern
- **SQLite** with **Drizzle ORM** for data persistence
- Schemas in `src/main/schemas/*.schema.ts`
- Soft deletion pattern: `isActive`, `deactivatedAt`, `deactivatedBy`
- All tables include: `id`, `createdAt`, `updatedAt`
- Foreign key constraints and indexes for performance

### Frontend Data Loading
Data loading follows TanStack Router patterns with helper functions:
- `loadApiData()` - Load critical data (throws on error)
- Mutations use `useApiMutation()` hook for consistent error handling

### Type Safety
- **100% TypeScript** with strict mode enabled
- **Zod schemas** for runtime validation at IPC boundaries
- **Module augmentation** for global type definitions
- Shared types between processes in `src/shared/types/`

### State Management
- **TanStack Query** for server state and caching
- **TanStack Router** for routing state and data loading
- **Local React state** for UI-only state
- **Event Bus** for cross-process event communication

### Security
- **Session-based authentication** with JWT tokens
- **bcrypt** for password hashing
- **AES-256-GCM** encryption for API keys
- Context isolation in Electron for security

### AI Integration
- **Vercel AI SDK** for unified LLM provider interface
- Support for multiple providers: OpenAI, Anthropic, DeepSeek
- Provider configurations stored encrypted in database
- Text generation using `generateText` for AI responses

## Code Style

### TypeScript
- Use explicit types, avoid `any`
- Prefer interfaces for object shapes
- Use Zod schemas for runtime validation
- Follow naming conventions:
  - Files: kebab-case
  - Variables/functions: camelCase
  - Classes/Components: PascalCase
  - Database columns: snake_case

### React Components
- Functional components with hooks
- Props interfaces defined above component
- Use shadcn/ui components from `src/renderer/components/ui/`
- Feature components in `src/renderer/features/[feature]/components/`

### Error Handling
- IPC handlers return `{ success: true, data } | { success: false, error }`
- Use try-catch in async functions
- Log errors with structured logger
- Show user-friendly error messages via toast

### Imports
- Use absolute imports with `@/` alias
- Group imports: external, internal, types, styles
- Avoid circular dependencies (enforced by ESLint boundaries)

## Testing
- **Vitest** for unit and integration tests
- Test files alongside source with `.test.ts` extension
- Mock IPC calls in renderer tests
- Use `vitest-mock-extended` for complex mocks