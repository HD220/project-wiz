# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Overview

**Project Wiz** is a desktop application for automating the software development lifecycle with AI Agents. It combines artificial intelligence with project management to revolutionize software development through customizable AI agents, team collaboration, and integration with multiple LLM providers.

### Key Features
- **Intelligent AI Agents**: Create assistants with specific roles, backstories, and goals
- **Multi-Provider LLM Support**: OpenAI, Anthropic, DeepSeek, Google, and custom providers
- **Advanced Project Management**: Git integration, team collaboration, organized channels
- **Integrated Communication**: Project channels, direct messaging, AI chat
- **Enterprise Security**: Local SQLite database, API key encryption, secure authentication

### Target Users
- **Developers**: Automate code reviews, configure specialized assistants, manage multiple projects
- **Teams**: Create specialized agents, centralize project communication, maintain decision history
- **Enterprises**: Local deployment, corporate AI providers, permission management

## Common Development Commands

**Development**: `npm run dev` - Starts Electron app with hot reload via electron-forge
**Build**: `npm run build` - Extracts i18n, compiles translations, and builds app via electron-forge
**Package**: `npm run package` - Creates distributable package
**Testing**: 
- `npm run test` - Run all tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

**Code Quality**:
- `npm run lint` - ESLint check
- `npm run lint:fix` - ESLint with auto-fix
- `npm run type-check` - TypeScript type checking
- `npm run format` - Prettier format
- `npm run format:check` - Check Prettier formatting
- `npm run quality:check` - Run all quality checks (lint, type-check, format, tests)

**Database**:
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations (runs on postinstall)
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:setup-demo` - Setup demo user data

**Internationalization**:
- `npm run extract` - Extract i18n strings
- `npm run compile` - Compile translations to TypeScript

## Architecture Overview

### Multi-Process Electron Architecture
- **Main Process** (`src/main/`): Node.js backend handling IPC, database, and system operations
- **Renderer Process** (`src/renderer/`): React frontend with TanStack Router
- **Worker Process** (`src/worker/`): Background job processing (currently disabled)
- **Shared** (`src/shared/`): Common types, utilities, and services

### Key Architectural Components

**IPC Communication**: Extensive IPC handlers in `src/main/ipc/` organized by domain (agent, auth, channel, dm, etc.). Each handler follows the pattern `invoke.ts` with co-located `queries.ts` for database operations.

**Database**: SQLite with Drizzle ORM. Schemas in `src/main/schemas/` and worker schemas in `src/worker/schemas/`. Database file: `project-wiz.db`

**Frontend Structure**:
- File-based routing with TanStack Router in `src/renderer/app/`
- Feature-based organization in `src/renderer/features/`
- Shared UI components using Radix UI + Tailwind in `src/renderer/components/ui/`
- Authentication context and protected routes

**Event System**: Type-safe EventBus (`src/shared/services/events/event-bus.ts`) for cross-process communication

### Core Domain Entities
- **Users**: Humans and AI agents with role-based differentiation
- **Projects**: Workspaces containing channels and members  
- **Channels**: Project-specific communication threads
- **DM Conversations**: Direct messaging between users
- **Messages**: Communication records with metadata
- **LLM Providers**: AI service configurations (Anthropic, OpenAI, DeepSeek, etc.)
- **Agents**: AI entities with roles, backstories, and provider assignments

### Technology Stack
- **Frontend**: React 19, TanStack Router, TanStack Query, Tailwind CSS, Radix UI
- **Backend**: Electron, Drizzle ORM, SQLite, Node.js
- **AI Integration**: Vercel AI SDK with multiple provider support
- **Build Tools**: Vite, Electron Forge, TypeScript, ESLint
- **Testing**: Vitest, Testing Library
- **I18n**: LinguiJS with Portuguese and English support

## Key Development Notes

**Database Migrations**: Run automatically on `npm install`. Use `npm run db:generate` after schema changes.

**IPC Pattern**: All IPC handlers are auto-registered in `main.ts`. New handlers should follow the existing domain structure.

**Routing**: Uses file-based routing. Protected routes are under `_authenticated/` directory.

**Styling**: Custom CSS variables with Tailwind. Theme support via `next-themes`.

**Logging**: Pino logger with separate configs for main/renderer processes.

**Worker System**: Currently disabled but architecture remains for future AI job processing.

**Security**: Content Security Policy enforced, external window creation blocked, Node integration disabled in renderer.

## Development Guidelines

### When Working with Features

**Agent Management**:
- Agents are AI entities with configurable roles, backstories, goals, and LLM provider assignments
- Each agent has a status (active/inactive/busy) and model configuration
- Agent forms are in `src/renderer/features/agent/components/`
- Database schema: `src/main/schemas/agent.schema.ts`

**Project Management**:
- Projects can have Git integration (gitUrl, branch, localPath)
- Each project contains channels for team communication
- Project forms and components: `src/renderer/features/project/`
- Support for project archiving and member management

**LLM Providers**:
- Support for OpenAI, Anthropic, DeepSeek, Google, and custom providers
- Each provider has API keys, base URLs, and default models
- Provider constants and schemas: `src/renderer/features/agent/provider-*`
- API keys are encrypted and stored locally

**Communication System**:
- **Channels**: Project-specific communication threads
- **DMs**: Direct messaging between users (humans and agents)
- Messages support markdown rendering and are stored with metadata
- Chat components: `src/renderer/features/chat/` and `src/renderer/features/conversation/`

### Code Patterns to Follow

**IPC Handlers**: Always create handlers in domain-specific directories under `src/main/ipc/` with:
```
domain/
├── action/
│   └── invoke.ts
├── queries.ts
```

**React Components**: Use feature-based organization:
```
features/
├── domain/
│   ├── components/
│   ├── hooks/
│   ├── actions/
│   └── utils/
```

**Database Operations**: Use Drizzle ORM with proper schemas and migrations. Always run `npm run db:generate` after schema changes.

**Styling**: Use Tailwind CSS with Radix UI components. Follow the established design system in `src/renderer/components/ui/`.

**I18n**: Use LinguiJS macros for all user-facing text. Run `npm run extract` to extract strings and `npm run compile` to generate TypeScript files.

### Testing & Quality

Always run before committing:
```bash
npm run quality:check  # Runs lint, type-check, format:check, and tests
```

For database work:
```bash
npm run db:studio      # Visual database management
npm run db:setup-demo  # Setup demo data for testing
```