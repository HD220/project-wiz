# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Wiz** is an enterprise-grade Electron desktop application that serves as an AI-powered software development automation platform. It's designed as a complete team of autonomous AI specialists that help manage and execute software development tasks through natural language interactions.

**Target Users**: CTOs, Tech Leads, Senior Developers, Enterprise Software Teams
**Business Goal**: Reduce development cycles by 60-80% while maintaining enterprise-grade quality

## Essential Development Commands

```bash
# Development workflow
npm install                # Install dependencies (runs db:migrate automatically via postinstall)
npm run dev               # Start development with hot reload
npm run build            # Production build (includes Lingui extract & compile)
npm run quality:check    # Complete quality verification (lint + type + format + calisthenics + test)

# Database operations
npm run db:generate      # Generate Drizzle migrations from model changes
npm run db:migrate       # Apply database migrations
npm run db:studio        # Open Drizzle Studio for database management
npm run db:setup-demo    # Setup demo user data for testing

# Code quality and testing
npm run test            # Run test suite
npm run test:coverage   # Test coverage report
npm run test:watch      # Watch mode for tests
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues automatically
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run type-check      # TypeScript type checking
npm run rebuild         # Rebuild native dependencies (better-sqlite3)

# Internationalization
npm run extract         # Extract translation strings
npm run compile         # Compile translations to TypeScript

## Architecture Overview

### Technology Stack
- **Desktop**: Electron 35.1.4 with security hardening
- **Frontend**: React 19.0.0 (function declarations, no React.FC) + TypeScript 5.8.3 strict mode
- **Routing**: TanStack Router 1.115.2 with file-based routing
- **State**: TanStack Query 5.83.0 + Local State + Zustand 5.0.6
- **Database**: SQLite + Drizzle ORM 0.44.4 with 14 tables and 62+ indexes
- **UI**: shadcn/ui + Tailwind CSS 4.0.14
- **AI**: Vercel AI SDK 5.0.0 with multi-provider support (@ai-sdk/anthropic 2.0.0, @ai-sdk/openai 2.0.0, @ai-sdk/deepseek 1.0.0)
- **Testing**: Vitest 3.1.1 + @testing-library/react 16.3.0
- **Build**: Vite 5.4.14 + @vitejs/plugin-react-swc 3.8.0
- **Internationalization**: Lingui 5.3.2 with automatic extraction and TypeScript compilation

### Feature-Based Architecture
```
src/
├── main/                 # Electron main process
│   ├── features/         # Business logic by domain (auth, agent, user, project, llm-provider)
│   ├── handlers/         # IPC handlers (.handler.ts)
│   └── workers/          # Background processing
├── renderer/             # React frontend  
│   ├── app/              # TanStack Router file-based routing
│   ├── components/       # shadcn/ui components
│   └── features/         # Feature-specific React components
├── shared/               # Cross-process utilities
└── worker/               # Worker thread processes
```

## Database Architecture

**14-table enterprise-grade schema** with sophisticated patterns:
- **Soft Deletion**: Universal `isActive`, `deactivatedAt`, `deactivatedBy` fields
- **Foreign Key Constraints**: Rigorous referential integrity
- **AES-256-GCM Encryption**: Native encryption for API keys and sensitive data
- **Performance**: 62+ indexes for sub-second queries

**Key Tables**: users, agents, llm_providers, messages, projects, project_channels, llm_jobs

**Critical Workflow**: 
1. Modify `.model.ts` files first
2. Run `npm run db:generate` to create migrations
3. Run `npm run db:migrate` to apply changes
4. Never edit migration files directly

**Critical Transaction Pattern** (better-sqlite3 is SYNCHRONOUS):
```typescript
// ❌ NEVER do this - async callback will fail
db.transaction(async (tx) => { const result = await tx.select()... });

// ✅ ALWAYS do this - await the transaction, not the callback
const result = await db.transaction((tx) => {
  const results = tx.select().from(table).all();
  const result = results[0];
  return result;
});
```

## Development Patterns

### File Naming (Strict)
- **All files/folders**: kebab-case (`user-profile.tsx`, `agent-form.tsx`)
- **Required suffixes**: `.model.ts`, `.schema.ts`, `.handler.ts`, `.service.ts`, `.types.ts`
- **React components**: No suffix (`login-form.tsx` NOT `login-form-component.tsx`)
- **Hooks**: `use-*.hook.ts` (though TanStack patterns preferred)

### Code Style Standards
- **React**: Function declarations (not React.FC), no React imports needed
- **TypeScript**: 100% strict mode, zero `any` tolerance
- **Imports**: Absolute paths with @ aliases
- **Architecture**: Feature-based organization (not MVC layers)

### Quality Standards (Production-Critical)
- **100% test pass rate** required before commits
- **Zero tolerance for production bugs** - paranoid mindset required
- **Type safety**: Complete TypeScript coverage with strict mode
- **Security**: AES-256 encryption, JWT sessions, DOMPurify sanitization

## IPC Architecture

**Advanced Colocated IPC pattern** with sophisticated auto-registration system:

### Core Patterns
- **Type-Safe Communication**: Complete TypeScript coverage across processes using module augmentation
- **Auto-Registration**: Handlers discovered via filesystem at `.handler.ts` files with zero configuration
- **Colocated Organization**: All related functionality in same folder (handler, controller, model)
- **Event Bus**: Global event coordination for complex workflows and cross-process communication
- **Worker Integration**: Isolated AI operations with security guardrails and command validation

### File Structure Convention
```
main/features/[domain]/
├── [domain].handler.ts    # IPC entry point (required)
├── [domain].service.ts    # Business logic orchestration (optional)
├── [domain].model.ts      # Data access and business rules (optional)
├── [domain].schema.ts     # Zod validation schemas
└── [domain].types.ts      # TypeScript type definitions
```

### Type Safety with Module Augmentation
Each handler automatically adds its types to the global `WindowAPI` interface:
```typescript
// In any .handler.ts file
declare global {
  namespace WindowAPI {
    interface InvokeHandlers {
      'invoke:user:create': (params: CreateUserParams) => Promise<CreateUserResponse>
    }
  }
}
```

### Critical IPC Patterns
- **Invoke**: Request-response communication (`invoke:domain:action`)
- **Listen**: Event-based updates (`listen:domain:event`)
- **Worker Communication**: Isolated execution for AI operations with guardrails
- **Error Handling**: Unified error responses with type safety

**See `/IPC-ARCHITECTURE.md` for complete implementation details and examples.**

## AI Integration

### Multi-Provider Support
- **Providers**: OpenAI GPT-4, Anthropic Claude, DeepSeek, custom providers
- **Unified Interface**: Vercel AI SDK provides consistency
- **Streaming**: Real-time AI response handling
- **Memory**: Persistent agent memory with relationship mapping
- **Security**: All AI operations run in isolated worker threads

### Agent System
- **Lifecycle Management**: Creation, editing, activation/deactivation
- **Advanced Memory**: Importance scoring and relationship mapping
- **Performance Monitoring**: Analytics and optimization
- **Multi-Agent Collaboration**: Channel-based communication

## Testing Strategy

### Current Coverage
- **Business Logic**: 85+ service functions with comprehensive testing
- **UI Components**: shadcn/ui components with interaction testing
- **Database**: Migration testing and query validation
- **IPC**: Cross-process communication testing

### Testing Commands
```bash
npm run test               # Full test suite
npm run test:coverage     # Coverage report with Vitest
npm run test:watch        # Watch mode for continuous testing
# Note: test:ui not available - use npm run test:coverage for visual coverage reports
```

## Security Architecture

### Data Protection
- **Encryption**: AES-256-GCM for API keys and sensitive data
- **Authentication**: Bcrypt + JWT with automatic session cleanup
- **Input Validation**: DOMPurify sanitization + Zod validation
- **Command Guardrails**: Validation for bash commands and file operations

### Worker Security
- **Isolated Execution**: AI operations in separate worker threads with guardrails
- **Command Validation**: Bash commands validated against blocked patterns and allowed operations
- **Path Security**: Prevents directory traversal and system access outside project workdir
- **Audit Logging**: Complete operation tracking for all file operations and commands
- **Tool Abstraction**: Specific tools for destructive operations (FileTool, GitTool) with validation

### Command Guardrails
```typescript
// Blocked patterns for bash commands
const BLOCKED_PATTERNS = [
  /rm\s+-rf?\s+\//,     // rm -rf /
  /sudo\s+/,           // sudo commands  
  /\.\.\//, // path traversal
  /\/etc\//,           // system directories
  /curl.*\|.*sh/,      // download + execute
]

// Allowed safe commands
const ALLOWED_COMMANDS = [
  'npm run', 'npm install', 'git status', 'git add', 'git commit',
  'ls', 'cat', 'echo', 'mkdir', 'touch', 'cp', 'mv'
]
```

## Development Philosophy

### Inline-First Philosophy (Modified DRY)
- Write inline when < 15 lines, single use, related operations
- Extract function only when 3+ exact duplications OR > 20 lines
- Copy-paste is OK for simple, contextually different logic
- Optimize for junior developers - readable without file jumping

### Production-Critical Mindset
- Be paranoid about every decision - assume it could bankrupt the company
- Research everything before making assumptions
- Document all reasoning and research findings obsessively
- Validate ruthlessly - check and double-check every assumption

## Key Project Status

### ✅ Completed (90%+ implemented)
- Authentication & Security (100%)
- AI Agent Ecosystem (95%) 
- Communication System (90%)
- Project Management (85%)

### 🚧 Current Development Areas
- Enterprise integrations and scaling
- Advanced AI workflow automation
- Performance optimization and monitoring

## Internationalization System

**Complete i18n implementation** with Lingui 5.3.2:
- **Languages**: English (en) and Portuguese Brazil (pt-BR) fully implemented
- **File Structure**: `src/renderer/locales/[lang]/` with `.po` and `.ts` files
- **Build Integration**: Automatic extraction and compilation in build process
- **Type Safety**: Generated TypeScript files for compile-time validation

### Working with Translations
```bash
npm run extract          # Extract strings from code to .po files
npm run compile          # Compile .po files to TypeScript
```

### Translation Files
```
src/renderer/locales/
├── en/
│   ├── common.po       # Common UI strings
│   ├── glossary.po     # Technical terminology
│   └── validation.po   # Form validation messages
└── pt-BR/
    ├── common.po
    ├── glossary.po
    └── validation.po
```

## Critical Patterns for New Development

1. **Feature-First Organization**: Keep related files together in feature folders
2. **Type Safety**: Use Drizzle for database, Zod for validation, TypeScript everywhere
3. **Security-First**: All external data validated, all AI operations isolated
4. **Quality Gates**: Run `npm run quality:check` before any commits
5. **Database Changes**: Always modify models first, then generate migrations
6. **Internationalization**: Use Lingui macros for all user-facing strings
7. **IPC Communication**: Follow colocated handler pattern with module augmentation

## Comprehensive Documentation System

**Enterprise-grade documentation** located in `/docs/` directory:

### Developer Documentation (`/docs/developer/`)
- **Architecture Guides**: IPC patterns, cross-reference systems, soft deletion architecture
- **Coding Standards**: Complete code style guidelines and best practices
- **Technology Stack**: Detailed technology choices and implementation patterns
- **Database Patterns**: Transaction patterns, data loading, error handling

### Technical Guides (`/docs/technical-guides/`)
- **AI Integration**: Vercel AI SDK implementation, provider patterns, queue systems
- **Electron**: Worker threads, async patterns, native dependencies
- **Frontend**: TanStack Router data loading patterns and best practices

### Design System (`/docs/design/`)
- **Component Guidelines**: shadcn/ui implementation and compound component patterns
- **Design Tokens**: Color palette, typography system, spacing guidelines
- **Visual Principles**: Complete design system specification

### Templates (`/docs/templates/`)
- **Architecture Templates**: ADR, database design, system integration templates
- **Planning Templates**: Requirements, brainstorming, use cases

**Always consult relevant documentation in `/docs/` before implementing new features or making architectural decisions.**

This is a production-ready, enterprise-grade codebase with sophisticated architecture and strict quality standards. Maintain these standards and follow established patterns for consistency.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.