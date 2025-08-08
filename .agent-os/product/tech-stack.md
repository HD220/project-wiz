# Tech Stack

## Overview
Project Wiz is built as a desktop-first Electron application with enterprise-grade architecture, combining the security of local execution with the familiarity of web technologies.

## Core Technologies

### Platform & Runtime
- **Electron 35.1.4**: Cross-platform desktop application framework
- **Node.js 20+**: JavaScript runtime for backend processes
- **TypeScript 5.8.3**: Type-safe development across entire codebase

### Frontend Framework
- **React 19.0.0**: Modern UI library with concurrent features
- **TanStack Router 1.115.2**: File-based routing with complete type safety
- **TanStack Query 5.83.0**: Server state management and caching
- **Tailwind CSS 4.0.14**: Utility-first CSS framework
- **shadcn/ui**: 48 production-grade React components

### Backend Architecture
- **IPC Handlers**: Type-safe inter-process communication
- **Worker Threads**: Background processing for AI operations
- **Service Layer**: Domain-driven design with clear separation of concerns

### Database
- **SQLite**: Embedded relational database for local data persistence
- **Drizzle ORM 0.44.4**: Type-safe SQL query builder and ORM
- **Migration System**: Automated schema evolution with drizzle-kit
- **14 Tables**: Comprehensive relational model with 62+ optimized indexes

### AI Integration
- **Vercel AI SDK 5.0.0**: Unified interface for multiple LLM providers
- **@ai-sdk/openai 2.0.0**: OpenAI GPT integration
- **@ai-sdk/anthropic 2.0.0**: Anthropic Claude integration
- **@ai-sdk/deepseek 1.0.0**: DeepSeek model support
- **Custom Provider Support**: Extensible architecture for additional LLMs

### Security
- **bcryptjs 3.0.2**: Password hashing with salt
- **JWT**: Session-based authentication tokens
- **AES-256-GCM**: Native crypto for API key encryption
- **DOMPurify**: XSS protection for user-generated content

### Development Tools
- **Vite 5.4.14**: Lightning-fast build system with HMR
- **Vitest 3.1.1**: Modern testing framework
- **ESLint 9.30.0**: Code quality enforcement with 10+ plugins
- **Prettier**: Consistent code formatting
- **Lingui 5.3.2**: Internationalization framework

### State Management
- **Zustand 5.0.6**: Lightweight state management for UI state
- **React Hook Form 7.61.1**: Performant form handling
- **Zod 3.25.76**: Runtime type validation and schema definition

### UI Components & Libraries
- **Radix UI**: Accessible component primitives (48 components)
- **Lucide React 0.482.0**: Comprehensive icon library
- **React Markdown 10.1.0**: Markdown rendering with syntax highlighting
- **Recharts 2.15.4**: Data visualization
- **Sonner 2.0.6**: Toast notifications

### Version Control & Git
- **simple-git 3.28.0**: Git operations integration
- **Octokit 4.1.2**: GitHub API integration

### Process Management
- **Electron Forge 7.7.0**: Build and distribution toolchain
- **Electron Rebuild 4.0.1**: Native module compilation

## Architecture Patterns

### Frontend Architecture
```
src/renderer/
├── app/              # TanStack Router file-based routes
├── components/       # Reusable UI components
├── features/         # Feature-specific modules
├── hooks/            # Custom React hooks
└── contexts/         # React contexts for global state
```

### Backend Architecture
```
src/main/
├── ipc/             # Domain-organized IPC handlers
├── schemas/         # Drizzle ORM database schemas
├── services/        # Core business logic services
└── utils/           # Shared utilities
```

### Shared Code
```
src/shared/
├── types/           # TypeScript types and Zod schemas
├── services/        # Cross-process services
└── utils/           # Shared utilities
```

## Development Standards

### Code Quality
- **100% TypeScript**: Strict mode enabled across codebase
- **Type-safe IPC**: All process communication validated with Zod
- **Feature-based organization**: Clear module boundaries
- **ESLint boundaries**: Enforced architectural layers

### Testing Strategy
- **Unit Tests**: Vitest for business logic
- **Integration Tests**: IPC handler testing
- **Component Tests**: React Testing Library
- **E2E Tests**: Planned for critical user flows

### Performance Optimizations
- **Code Splitting**: Lazy loading for routes
- **React Suspense**: Progressive loading states
- **Database Indexing**: 62+ optimized indexes
- **Caching Strategy**: TanStack Query with smart invalidation

## Deployment

### Build Process
```bash
npm run build        # Production build
npm run package      # Create distributable
npm run make         # Platform-specific installers
```

### Distribution
- **Windows**: Squirrel installer (.exe)
- **macOS**: DMG and ZIP archives
- **Linux**: AppImage, DEB, RPM packages

### Requirements
- **Node.js**: 20.0.0 or higher
- **npm**: 10.0.0 or higher
- **OS**: Windows 10+, macOS 12+, Ubuntu 20.04+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for application + project data