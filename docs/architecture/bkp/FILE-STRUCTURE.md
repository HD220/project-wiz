# Project Wiz: Estrutura de Arquivos e Organização

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17

---

## 🎯 Filosofia da Organização

A nova estrutura de arquivos segue os princípios:

1. **Flat is Better than Nested** - Evitar aninhamento desnecessário
2. **Domain-Driven Organization** - Organizar por domínio de negócio, não por tipo técnico
3. **Single Responsibility** - Um arquivo = uma responsabilidade clara
4. **Convention over Configuration** - Convenções claras eliminam configuração
5. **Intuitive Navigation** - Qualquer desenvolvedor encontra o que procura em 30 segundos

---

## 📁 Estrutura Completa

```
project-wiz/
├── docs/                                  # Documentação do projeto
│   ├── architecture/                     # Documentação arquitetural
│   │   ├── NEW-ARCHITECTURE-OVERVIEW.md
│   │   ├── FILE-STRUCTURE.md
│   │   ├── DATABASE-SCHEMA.md
│   │   ├── API-SPECIFICATION.md
│   │   ├── COMPONENT-LIBRARY.md
│   │   └── IMPLEMENTATION-PLAN.md
│   ├── developer/                        # Guias para desenvolvedores
│   │   ├── GETTING-STARTED.md
│   │   ├── CODING-STANDARDS.md
│   │   ├── TESTING-GUIDE.md
│   │   └── DEPLOYMENT-GUIDE.md
│   └── user/                            # Documentação do usuário
│       ├── USER-GUIDE.md
│       └── FAQ.md
│
├── src/                                  # Código fonte
│   ├── main/                            # Backend (Node.js/Electron)
│   │   ├── user/                        # Bounded Context: User
│   │   │   ├── authentication/          # Aggregate: Authentication
│   │   │   │   ├── auth.handlers.ts     # Login, logout, register handlers
│   │   │   │   ├── session.handlers.ts  # Session management handlers
│   │   │   │   ├── auth.service.ts      # Authentication business logic
│   │   │   │   ├── session.service.ts   # Session management logic
│   │   │   │   ├── users.schema.ts      # Users database schema
│   │   │   │   └── sessions.schema.ts   # Sessions database schema
│   │   │   ├── profile/                # Aggregate: Profile
│   │   │   │   ├── user.service.ts      # User business logic
│   │   │   │   ├── profile.service.ts   # Profile business logic
│   │   │   │   └── profiles.schema.ts   # Profile database schema
│   │   │   └── direct-messages/        # Aggregate: Direct Messages
│   │   │       ├── dm.handlers.ts       # Direct messages handlers
│   │   │       ├── dm.service.ts        # DM business logic
│   │   │       └── direct-messages.schema.ts # DM database schema
│   │   ├── project/                     # Bounded Context: Project
│   │   │   ├── channels/               # Aggregate: Channels
│   │   │   │   ├── channel.handlers.ts  # Channel CRUD handlers
│   │   │   │   ├── channel.service.ts   # Channel business logic
│   │   │   │   └── channels.schema.ts   # Channels database schema
│   │   │   ├── members/                # Aggregate: Members
│   │   │   │   ├── member.handlers.ts   # Member management handlers
│   │   │   │   ├── member.service.ts    # Member business logic
│   │   │   │   └── members.schema.ts    # Members database schema
│   │   │   ├── forums/                 # Aggregate: Forums
│   │   │   │   ├── forum.handlers.ts    # Forum handlers
│   │   │   │   ├── forum.service.ts     # Forum business logic
│   │   │   │   └── forums.schema.ts     # Forum database schema
│   │   │   ├── issues/                 # Aggregate: Issues
│   │   │   │   ├── issue.handlers.ts    # Issue handlers
│   │   │   │   ├── issue.service.ts     # Issue business logic
│   │   │   │   └── issues.schema.ts     # Issues database schema
│   │   │   └── core/                   # Core project
│   │   │       ├── project.handlers.ts  # Project CRUD handlers
│   │   │       ├── project.service.ts   # Project business logic
│   │   │       ├── git.service.ts       # Git operations service
│   │   │       └── projects.schema.ts   # Projects database schema
│   │   ├── conversations/               # Bounded Context: Conversations
│   │   │   ├── channels/               # Aggregate: Channel Chat
│   │   │   │   ├── channel-chat.handlers.ts # Channel chat handlers
│   │   │   │   ├── channel-chat.service.ts # Channel chat logic
│   │   │   │   └── channel-messages.schema.ts # Channel messages schema
│   │   │   ├── direct-messages/        # Aggregate: DM Chat
│   │   │   │   ├── dm-chat.handlers.ts  # DM chat handlers
│   │   │   │   ├── dm-chat.service.ts   # DM chat business logic
│   │   │   │   └── dm-conversations.schema.ts # DM conversations schema
│   │   │   ├── routing/                # Aggregate: Message Routing
│   │   │   │   ├── message.router.ts    # Message routing logic
│   │   │   │   ├── notification.service.ts # Notification service
│   │   │   │   └── routing.schema.ts    # Routing database schema
│   │   │   └── core/                   # Core conversations
│   │   │       ├── message.handlers.ts  # Message CRUD handlers
│   │   │       ├── message.service.ts   # Message business logic
│   │   │       └── messages.schema.ts   # Base messages schema
│   │   ├── agents/                      # Bounded Context: Agents
│   │   │   ├── worker/                 # Aggregate: Worker
│   │   │   │   ├── agent.handlers.ts    # Agent CRUD handlers
│   │   │   │   ├── job.handlers.ts      # Job management handlers
│   │   │   │   ├── agent.service.ts     # Agent business logic
│   │   │   │   ├── job.service.ts       # Job management logic
│   │   │   │   ├── llm.service.ts       # LLM integration service
│   │   │   │   ├── agents.schema.ts     # Agents database schema
│   │   │   │   ├── jobs.schema.ts       # Jobs database schema
│   │   │   │   └── agent.worker.ts      # Background agent worker
│   │   │   └── queue/                  # Aggregate: Queue
│   │   │       ├── queue.service.ts     # Queue management logic
│   │   │       └── job-queue.schema.ts  # Job queue database schema
│   │   ├── database/                    # Data Layer (Drizzle ORM)
│   │   │   ├── connection.ts           # SQLite + Drizzle config
│   │   │   ├── migrations/             # Drizzle migrations
│   │   │   │   ├── 0001_initial.sql
│   │   │   │   ├── 0002_add_agents.sql
│   │   │   │   └── meta/              # Drizzle metadata
│   │   │   └── index.ts               # Consolidated exports
│   │   ├── utils/                       # Backend utilities
│   │   │   ├── crypto.ts               # Crypto functions
│   │   │   ├── file-system.ts          # File operations
│   │   │   ├── logger.ts               # Logging system
│   │   │   └── validators.ts           # Custom validators
│   │   └── main.ts                     # Electron entry point
│   │
│   ├── renderer/                        # Frontend (React)
│   │   ├── app/                        # Routes (TanStack Router)
│   │   │   ├── __root.tsx              # Global root layout
│   │   │   ├── index.tsx               # Home page
│   │   │   ├── login.tsx               # Login page
│   │   │   ├── user/                   # User area routes
│   │   │   │   ├── route.tsx           # User area layout
│   │   │   │   ├── index.tsx           # Personal dashboard
│   │   │   │   ├── direct-messages/    # DM routes
|   │   │   │   |   ├── route.tsx       # DM chat layout
│   │   │   │   │   ├── index.tsx       # DM list
│   │   │   │   │   └── [conversation-id]/
│   │   │   │   │       └── index.tsx   # DM chat content
│   │   │   │   └── settings/           # Personal settings
│   │   │   │       ├── route.tsx       # layout
│   │   │   │       ├── index.tsx       # General settings
│   │   │   │       ├── profile.tsx     # User profile
│   │   │   │       └── account.tsx     # Account settings
│   │   │   ├── agents/                 # Agents management routes
│   │   │   │   ├── index.tsx           # Agent list/dashboard
│   │   │   │   ├── create.tsx          # Create agent
│   │   │   │   ├── route.tsx           # Agent layout
│   │   │   │   └── [agent-id]/         # Specific agent
│   │   │   │       ├── index.tsx       # Agent overview
│   │   │   │       ├── settings.tsx    # Agent settings
│   │   │   │       └── jobs.tsx        # Agent jobs
│   │   │   └── project/                # Project area routes
│   │   │       ├── index.tsx           # Project list
│   │   │       ├── create.tsx          # Create project
│   │   │       ├── route.tsx           # Project layout (Discord-like)
│   │   │       └── [project-id]/       # Specific project
│   │   │           ├── index.tsx       # Project overview
│   │   │           ├── channel/        # Channel routes
│   │   │           │   ├── route.tsx   # Channel layout
│   │   │           │   └── [channel-id]/
│   │   │           │       └── index.tsx # Channel chat
│   │   │           ├── forum/          # Forum routes
│   │   │           │   ├── index.tsx   # Topic list
│   │   │           │   ├── route.tsx   # Topic layout
│   │   │           │   └── [topic-id]/
│   │   │           │       └── index.tsx # Topic content
│   │   │           ├── issues/         # Issues routes
│   │   │           │   ├── index.tsx   # Kanban board
│   │   │           │   ├── create.tsx  # Create issue
│   │   │           │   ├── route.tsx   # Issue layout
│   │   │           │   └── [issue-id]/
│   │   │           │       └── index.tsx # Issue details
│   │   │           └── settings/       # Project settings
│   │   │               └── index.tsx
│   │   ├── features/                   # Features organized by domain
│   │   │   ├── user/                   # User features
│   │   │   │   ├── authentication/     # Aggregate: Authentication
│   │   │   │   │   ├── components/     # Auth components
│   │   │   │   │   │   ├── login-form.tsx # Login form
│   │   │   │   │   │   ├── register-form.tsx # Register form
│   │   │   │   │   │   ├── account-switcher.tsx # Account switcher
│   │   │   │   │   │   └── user-layout.tsx # User area layout
│   │   │   │   │   ├── hooks/          # Auth hooks
│   │   │   │   │   │   └── use-auth.ts  # Authentication hook
│   │   │   │   │   └── store/          # Auth state
│   │   │   │   │       └── auth-store.ts # Authentication state
│   │   │   │   ├── profile/            # Aggregate: Profile
│   │   │   │   │   ├── components/     # Profile components
│   │   │   │   │   │   ├── profile-form.tsx # Profile form
│   │   │   │   │   │   └── avatar-upload.tsx # Avatar upload
│   │   │   │   │   └── hooks/          # Profile hooks
│   │   │   │   │       └── use-profile.ts # Profile hook
│   │   │   │   └── dashboard/          # Aggregate: Dashboard
│   │   │   │       ├── components/     # Dashboard components
│   │   │   │       │   ├── dashboard-cards.tsx # Info cards
│   │   │   │       │   └── activity-feed.tsx # Activity feed
│   │   │   │       └── hooks/          # Dashboard hooks
│   │   │   │           └── use-dashboard.ts # Dashboard hook
│   │   │   ├── project/                # Project features
│   │   │   │   ├── core/               # Core project
│   │   │   │   │   ├── components/     # Project components
│   │   │   │   │   │   ├── project-card.tsx # Project card
│   │   │   │   │   │   ├── project-icon.tsx # Project icon
│   │   │   │   │   │   ├── project-header.tsx # Project header
│   │   │   │   │   │   ├── project-form.tsx # Project form
│   │   │   │   │   │   └── project-sidebar.tsx # Project sidebar
│   │   │   │   │   ├── hooks/          # Project hooks
│   │   │   │   │   │   └── use-projects.ts # Projects hook
│   │   │   │   │   └── store/          # Project state
│   │   │   │   │       └── project-store.ts # Project state
│   │   │   │   ├── channels/           # Aggregate: Channels
│   │   │   │   │   ├── components/     # Channel components
│   │   │   │   │   │   ├── channel-list.tsx # Channel list
│   │   │   │   │   │   ├── channel-item.tsx # Channel item
│   │   │   │   │   │   ├── channel-form.tsx # Channel form
│   │   │   │   │   │   └── channel-sidebar.tsx # Channel sidebar
│   │   │   │   │   └── hooks/          # Channel hooks
│   │   │   │   │       └── use-channels.ts # Channels hook
│   │   │   │   ├── members/            # Aggregate: Members
│   │   │   │   │   ├── components/     # Member components
│   │   │   │   │   │   ├── member-list.tsx # Member list
│   │   │   │   │   │   ├── member-item.tsx # Member item
│   │   │   │   │   │   └── member-sidebar.tsx # Member sidebar
│   │   │   │   │   └── hooks/          # Member hooks
│   │   │   │   │       └── use-members.ts # Members hook
│   │   │   │   ├── forums/             # Aggregate: Forums
│   │   │   │   │   ├── components/     # Forum components
│   │   │   │   │   │   ├── topic-list.tsx # Topic list
│   │   │   │   │   │   ├── topic-item.tsx # Topic item
│   │   │   │   │   │   ├── topic-thread.tsx # Discussion thread
│   │   │   │   │   │   ├── post-item.tsx # Post item
│   │   │   │   │   │   └── post-composer.tsx # Post composer
│   │   │   │   │   └── hooks/          # Forum hooks
│   │   │   │   │       └── use-forum.ts # Forum hook
│   │   │   │   └── issues/             # Aggregate: Issues
│   │   │   │       ├── components/     # Issue components
│   │   │   │       │   ├── kanban-board.tsx # Kanban board
│   │   │   │       │   ├── kanban-column.tsx # Kanban column
│   │   │   │       │   ├── issue-card.tsx # Issue card
│   │   │   │       │   ├── issue-form.tsx # Issue form
│   │   │   │       │   └── issue-detail.tsx # Issue details
│   │   │   │       └── hooks/          # Issue hooks
│   │   │   │           └── use-issues.ts # Issues hook
│   │   │   ├── conversations/          # Conversation features
│   │   │   │   ├── components/         # Shared chat components
│   │   │   │   │   ├── chat-area.tsx   # Main chat area (shared)
│   │   │   │   │   ├── message-list.tsx # Message list (shared)
│   │   │   │   │   ├── message-item.tsx # Message item (shared)
│   │   │   │   │   ├── chat-input.tsx  # Message input (shared)
│   │   │   │   │   ├── typing-indicator.tsx # Typing indicator (shared)
│   │   │   │   │   └── emoji-picker.tsx # Emoji picker (shared)
│   │   │   │   ├── channel/            # Aggregate: Channel Chat
│   │   │   │   │   ├── components/     # Channel specific components
│   │   │   │   │   │   └── channel-header.tsx # Channel header
│   │   │   │   │   ├── hooks/          # Channel chat hooks
│   │   │   │   │   │   ├── use-channel-chat.ts # Channel chat hook
│   │   │   │   │   │   └── use-channel-messages.ts # Channel messages hook
│   │   │   │   │   └── store/          # Channel chat state
│   │   │   │   │       └── channel-chat-store.ts # Channel chat state
│   │   │   │   ├── direct-messages/    # Aggregate: DMs
│   │   │   │   │   ├── components/     # DM specific components
│   │   │   │   │   │   ├── dm-list.tsx  # DM list
│   │   │   │   │   │   └── dm-header.tsx # DM header
│   │   │   │   │   └── hooks/          # DM hooks
│   │   │   │   │       └── use-direct-messages.ts # DM hook
│   │   │   │   └── hooks/              # Shared conversation hooks
│   │   │   │       ├── use-messages.ts # Shared messages hook
│   │   │   │       └── use-chat-common.ts # Common chat logic
│   │   │   └── agents/                 # Agent features
│   │   │       ├── components/         # Agent components
│   │   │       │   ├── agent-card.tsx  # Agent card
│   │   │       │   ├── agent-avatar.tsx # Agent avatar
│   │   │       │   ├── agent-status.tsx # Agent status
│   │   │       │   ├── agent-form.tsx  # Agent form
│   │   │       │   └── agent-list.tsx  # Agent list
│   │   │       ├── hooks/              # Agent hooks
│   │   │       │   └── use-agents.ts   # Agents hook
│   │   │       ├── store/              # Agent state
│   │   │       │   └── agent-store.ts  # Agent state
│   │   │       └── jobs/               # Aggregate: Jobs
│   │   │           ├── components/     # Job components
│   │   │           │   ├── job-list.tsx # Job list
│   │   │           │   └── job-item.tsx # Job item
│   │   │           └── hooks/          # Job hooks
│   │   │               └── use-jobs.ts # Jobs hook
│   │   ├── components/                 # Componentes compartilhados
│   │   │   ├── layout/                 # Layout components (generic only)
│   │   │   │   ├── app-layout.tsx      # Main application layout
│   │   │   │   ├── discord-layout.tsx  # Discord-like layout (generic)
│   │   │   │   ├── sidebar-layout.tsx  # Generic sidebar layout
│   │   │   │   ├── header-layout.tsx   # Generic header layout
│   │   │   │   └── content-layout.tsx  # Generic content layout
│   │   │   │   ├── topbar.tsx          # Top navigation bar (global)
│   │   │   │   └── navigation.tsx      # Navigation components (global)
│   │   │   └── ui/                     # Base UI (shadcn/ui)
│   │   │       ├── button.tsx          # Componente botão
│   │   │       ├── input.tsx           # Componente input
│   │   │       ├── card.tsx            # Componente card
│   │   │       ├── dialog.tsx          # Componente dialog
│   │   │       ├── dropdown-menu.tsx   # Dropdown menu
│   │   │       ├── sheet.tsx           # Sheet/drawer
│   │   │       ├── toast.tsx           # Notificações
│   │   │       └── [outros-shadcn].tsx # Outros componentes UI
│   │   ├── hooks/                      # Hooks globais/compartilhados
│   │   │   ├── use-api.ts              # Hook IPC communication
│   │   │   └── use-websocket.ts        # Hook WebSocket (futuro)
│   │   ├── store/                      # Estado global
│   │   │   ├── app-store.ts            # Estado aplicação global
│   │   │   └── ui-store.ts             # Estado UI (modals, etc.)
│   │   └── utils/                      # Utilities (flat)
│   │       ├── api-client.ts           # Cliente IPC
│   │       ├── format.ts               # Formatadores
│   │       ├── date.ts                 # Utilitários data
│   │       ├── string.ts               # Utilitários string
│   │       ├── validation.ts           # Validadores frontend
│   │       └── constants.ts            # Constantes frontend
│   │
│   └── shared/                         # Código compartilhado
│       ├── types/                      # TypeScript Types (organizados por domínio)
│       │   └── common.ts               # Types comuns
│       ├── constants/                  # Constantes globais
│       │   ├── app-constants.ts        # Constantes aplicação
│       │   ├── api-constants.ts        # Constantes API
│       │   └── ui-constants.ts         # Constantes UI
│       └── utils/                      # Utilitários compartilhados
│           ├── id-generator.ts         # Gerador IDs únicos
│           ├── error-handling.ts       # Tratamento erros
│           └── type-guards.ts          # Type guards TypeScript
│
├── tests/                              # Testes organizados por camada
│   ├── main/                          # Testes backend
│   │   ├── services/                  # Testes services
│   │   ├── api/                       # Testes API handlers
│   │   └── database/                  # Testes database
│   ├── renderer/                      # Testes frontend
│   │   ├── components/                # Testes componentes
│   │   ├── hooks/                     # Testes hooks
│   │   └── pages/                     # Testes pages
│   └── shared/                        # Testes código compartilhado
│       ├── schemas/                   # Testes schemas
│       └── utils/                     # Testes utils
│
├── scripts/                           # Scripts de desenvolvimento
│   └── seed-database.js               # Seed dados teste
│
├── vite.main.config.ts                # Config Vite main process
├── vite.renderer.config.ts            # Config Vite renderer
├── vite.preload.config.ts             # Config Vite preload
├── drizzle.config.ts                  # Config Drizzle ORM
├── eslint.config.js                   # Config ESLint
├── tailwind.config.ts                 # Config TailwindCSS
├── vitest.config.ts                   # Config Vitest
├── forge.config.ts                    # Config Electron Forge
├── .env.example                       # Exemplo variáveis ambiente
├── .gitignore                         # Git ignore rules
├── package.json                       # Dependências e scripts
├── tsconfig.json                      # Config TypeScript
└── README.md                          # README principal
```

---

## 📋 Convenções de Nomenclatura

### Arquivos e Diretórios

```typescript
// ✅ Correto - kebab-case para arquivos
user - service.ts;
project - card.tsx;
use - auth.ts;
auth - store.ts;

// ❌ Incorreto
userService.ts;
ProjectCard.tsx;
useAuth.ts;
authStore.ts;
```

### Componentes React

```typescript
// ✅ Correto - PascalCase para componentes
export function ProjectCard() {}
export function ChatInput() {}
export function AgentAvatar() {}

// ❌ Incorreto
export function projectCard() {}
export function chatInput() {}
```

### Hooks Customizados

```typescript
// ✅ Correto - use-something pattern
use - auth.ts;
use - projects.ts;
use - chat.ts;

// ❌ Incorreto
auth - hook.ts;
projects - hook.ts;
```

### Backend Main Process

```typescript
// ✅ Correto - domain.type pattern with dot notation
auth.service.ts;
user.handlers.ts;
project.service.ts;
message.handlers.ts;
agents.schema.ts;

// ❌ Incorreto - dash notation
auth - service.ts;
user - handlers.ts;
project - service.ts;
```

### Frontend Components e Hooks

```typescript
// ✅ Correto - kebab-case for files
agent - card.tsx;
use - projects.ts;
chat - input.tsx;

// ✅ Correto - PascalCase for component names
export function AgentCard() {}
export function ChatInput() {}
```

---

## 🎯 Organização por Responsabilidade

### Backend (main/) - Bounded Contexts

```typescript
// project/core/project.handlers.ts - IPC handlers
export async function handleCreateProject(data: unknown) {
  const validated = CreateProjectSchema.parse(data);
  return await projectService.create(validated);
}

// project/core/project.service.ts - Business logic
export class ProjectService {
  static async create(data: CreateProjectInput): Promise<Project> {
    // Lógica de negócio específica do domínio
  }
}

// project/core/projects.schema.ts - Database schema
export const projectsSchema = sqliteTable("projects", {
  // Schema definition
});
```

### Frontend (renderer/) - Features Organizadas

```typescript
// app/project/[project-id]/index.tsx - Routes/Pages com TanStack Router
export function ProjectPage() {
  // Lógica página específica usando features
}

// features/project/core/components/project-card.tsx - Componentes específicos
export function ProjectCard({ project }: { project: Project }) {
  // Lógica apresentação específica do domínio
}

// features/project/core/hooks/use-projects.ts - Hooks específicos
export function useProjects() {
  // Lógica state management específica
}

// components/layout/discord-layout.tsx - Componentes globais
export function DiscordLayout() {
  // Layout reutilizável em toda aplicação
}

// shared/types/common.ts - Types compartilhados IPC
export interface ProjectResponse {
  // Tipos que trafegam via IPC
}
```

---

## 📊 Benefícios da Nova Organização

### 🎯 Para Encontrar Código

- **Bounded contexts claros** - Organização por domínios de negócio
- **Features isoladas** - Componentes, hooks e stores agrupados por funcionalidade
- **Nomenclatura consistente** - Dot notation no backend, kebab-case no frontend
- **Responsabilidade única** - Cada arquivo tem propósito específico e claro

### 🔧 Para Manutenção

- **Isolamento de domínios** - Mudanças em um bounded context não afetam outros
- **Fronteiras bem definidas** - Backend/Frontend/Shared com responsabilidades claras
- **Refatoração segura** - Features isoladas facilitam mudanças
- **Escalabilidade natural** - Estrutura cresce organicamente

### 👨‍💻 Para Desenvolvedores

- **DDD pragmático** - Conceitos de domínio refletidos na estrutura
- **Padrões previsíveis** - Convenções aplicadas consistentemente
- **Autodocumentação** - Estrutura explica arquitetura e organização
- **Onboarding rápido** - Navegação intuitiva para novos desenvolvedores

### 🚀 Para Produtividade

- **Componentes reutilizáveis** - Separação clara entre global e específico
- **IPC otimizado** - Contratos bem definidos na pasta shared
- **Hot reload eficiente** - Estrutura otimizada para desenvolvimento
- **Debugging facilitado** - Organização permite localização rápida de problemas

---

## 🚀 Próximos Documentos

1. **DATABASE-SCHEMA.md** - Estrutura completa banco dados
2. **API-SPECIFICATION.md** - Especificação APIs IPC
3. **COMPONENT-LIBRARY.md** - Sistema design componentes
4. **CODING-STANDARDS.md** - Padrões e convenções código

---

_Esta estrutura foi projetada para maximizar produtividade e minimizar complexidade, seguindo os princípios KISS e Clean Code._
