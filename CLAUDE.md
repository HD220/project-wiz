# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Project Wiz** is an enterprise-grade Electron desktop application that serves as an AI-powered software development automation platform. It's designed as a complete team of autonomous AI specialists that help manage and execute software development tasks through natural language interactions.

**Target Users**: CTOs, Tech Leads, Senior Developers, Enterprise Software Teams
**Business Goal**: Reduce development cycles by 60-80% while maintaining enterprise-grade quality

## Essential Development Commands

```bash
# Development workflow
npm install                # Install dependencies  
npm run dev               # Start development with hot reload
npm run build            # Production build
npm run quality:check    # Complete quality verification (lint + type + format + test)

# Database operations
npm run db:generate      # Generate Drizzle migrations from model changes
npm run db:migrate       # Apply database migrations
npm run db:studio        # Open Drizzle Studio for database management

# Testing and quality
npm run test            # Run test suite
npm run test:coverage   # Test coverage report
npm run test:watch      # Watch mode for tests

## Architecture Overview

### Technology Stack
- **Desktop**: Electron 35.1.4 with security hardening
- **Frontend**: React 19.0.0 (function declarations, no React.FC) + TypeScript 5.8.3 strict mode
- **Routing**: TanStack Router 1.115.2 with file-based routing
- **State**: TanStack Query 5.83.0 + Local State + Zustand 5.0.6
- **Database**: SQLite + Drizzle ORM 0.44.2 with 14 tables and 62+ indexes
- **UI**: shadcn/ui + Tailwind CSS 4.0.14
- **AI**: Vercel AI SDK 5.0.0 with multi-provider support
- **Testing**: Vitest 3.1.1 + @testing-library/react

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

**Colocated IPC pattern** with:
- **Type-Safe Communication**: Complete TypeScript coverage across processes
- **Auto-Registration**: Handlers discovered via filesystem at `.handler.ts` files  
- **Event Bus**: Global event coordination for complex workflows
- **Worker Integration**: Isolated AI operations with security guardrails

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
npm run test:coverage     # Coverage report
npm run test:watch        # Watch mode
npm run test:ui           # Vitest UI
```

## Security Architecture

### Data Protection
- **Encryption**: AES-256-GCM for API keys and sensitive data
- **Authentication**: Bcrypt + JWT with automatic session cleanup
- **Input Validation**: DOMPurify sanitization + Zod validation
- **Command Guardrails**: Validation for bash commands and file operations

### Worker Security
- **Isolated Execution**: AI operations in separate worker threads
- **Path Security**: Prevents directory traversal and system access
- **Audit Logging**: Complete operation tracking

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

## Critical Patterns for New Development

1. **Feature-First Organization**: Keep related files together in feature folders
2. **Type Safety**: Use Drizzle for database, Zod for validation, TypeScript everywhere
3. **Security-First**: All external data validated, all AI operations isolated
4. **Quality Gates**: Run `npm run quality:check` before any commits
5. **Database Changes**: Always modify models first, then generate migrations

This is a production-ready, enterprise-grade codebase with sophisticated architecture and strict quality standards. Maintain these standards and follow established patterns for consistency.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.