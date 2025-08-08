# Tech Stack

## Context

Project-specific tech stack for project-wiz - an Electron desktop application for autonomous software engineering workflows.

- App Framework: Electron 32+ (Node.js backend + React 19 frontend)
- Language: TypeScript 5.0+ (100% coverage, strict mode enabled)
- Primary Database: SQLite with Drizzle ORM
- ORM: Drizzle ORM with type-safe queries
- JavaScript Framework: React 19 (latest stable)
- Build Tool: Vite + Electron-Vite
- Import Strategy: Node.js ES modules
- Package Manager: npm
- Node Version: 20 LTS
- CSS Framework: TailwindCSS 4.0+
- UI Components: shadcn/ui components
- UI Installation: Via src/renderer/components/ui/
- Font Provider: Google Fonts
- Font Loading: Self-hosted for performance
- Icons: Lucide React components
- Application Type: Desktop Application (Cross-platform)
- Packaging: Electron Builder
- Distribution: GitHub Releases / App Stores
- Database Hosting: Local SQLite files
- Database Backups: File-based backups
- Asset Storage: Local file system
- CDN: Not applicable (desktop app)
- Asset Access: Local file system access
- CI/CD Platform: GitHub Actions
- CI/CD Trigger: Push to main/staging branches
- Tests: Vitest (run before packaging)
- Testing Framework: Vitest + vitest-mock-extended
- Production Environment: main branch releases
- Staging Environment: staging branch builds

## Architecture Specifics

### Multi-Process Architecture
- **Main Process**: Node.js backend handling IPC, database operations, system interactions
- **Renderer Process**: React 19 frontend with TanStack Router for navigation
- **Worker Process**: Background tasks for AI operations and queue processing
- **IPC Communication**: Type-safe message passing using `createIPCHandler`

### State Management
- **TanStack Query**: Server state and caching
- **TanStack Router**: Routing state and data loading
- **Local React State**: UI-only state
- **Event Bus**: Cross-process event communication

### Security
- **Session-based Authentication**: JWT tokens
- **Password Hashing**: bcrypt
- **API Key Encryption**: AES-256-GCM encryption
- **Context Isolation**: Electron security best practices

### AI Integration
- **Vercel AI SDK**: Unified LLM provider interface
- **Supported Providers**: OpenAI, Anthropic, DeepSeek
- **Provider Configuration**: Encrypted storage in SQLite
- **Text Generation**: `generateText` for AI responses