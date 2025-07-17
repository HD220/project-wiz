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
│   │   ├── api/                         # IPC API Layer (flat organization)
│   │   │   ├── auth-api.ts             # Autenticação e usuários
│   │   │   ├── projects-api.ts         # CRUD projetos
│   │   │   ├── agents-api.ts           # CRUD agentes
│   │   │   ├── channels-api.ts         # CRUD canais
│   │   │   ├── messages-api.ts         # Sistema de mensagens
│   │   │   ├── forum-api.ts            # Fórum de discussões
│   │   │   ├── issues-api.ts           # Sistema de issues
│   │   │   └── git-api.ts              # Operações Git
│   │   ├── services/                    # Business Logic (flat organization)
│   │   │   ├── auth-service.ts         # Lógica autenticação
│   │   │   ├── user-service.ts         # Lógica usuários
│   │   │   ├── agent-service.ts        # Lógica agentes IA
│   │   │   ├── project-service.ts      # Lógica projetos
│   │   │   ├── channel-service.ts      # Lógica canais
│   │   │   ├── chat-service.ts         # Processamento chat
│   │   │   ├── forum-service.ts        # Lógica fórum
│   │   │   ├── issue-service.ts        # Gestão issues
│   │   │   ├── git-service.ts          # Git + Worktrees
│   │   │   └── llm-service.ts          # Integração LLMs
│   │   ├── database/                    # Data Layer (Drizzle ORM)
│   │   │   ├── connection.ts           # Configuração SQLite + Drizzle
│   │   │   ├── schema/                 # Schemas organizados por domínio
│   │   │   │   ├── users.schema.ts     # Schema usuários
│   │   │   │   ├── agents.schema.ts    # Schema agentes
│   │   │   │   ├── projects.schema.ts  # Schema projetos
│   │   │   │   ├── channels.schema.ts  # Schema canais
│   │   │   │   ├── messages.schema.ts  # Schema mensagens
│   │   │   │   ├── forum.schema.ts     # Schema fórum
│   │   │   │   ├── issues.schema.ts    # Schema issues
│   │   │   │   └── index.ts            # Exports consolidados
│   │   │   └── migrations/             # Migrações Drizzle
│   │   │       ├── 0001_initial.sql
│   │   │       ├── 0002_add_agents.sql
│   │   │       └── meta/              # Metadados Drizzle
│   │   ├── workers/                     # Background Workers
│   │   │   ├── agent-worker.ts         # Agentes background
│   │   │   ├── git-worker.ts           # Operações Git background
│   │   │   └── task-queue.ts           # Sistema de filas
│   │   ├── utils/                       # Utilitários backend
│   │   │   ├── crypto.ts               # Funções criptografia
│   │   │   ├── file-system.ts          # Operações arquivo
│   │   │   ├── logger.ts               # Sistema logging
│   │   │   └── validators.ts           # Validadores custom
│   │   └── main.ts                     # Entry point Electron
│   │
│   ├── renderer/                        # Frontend (React)
│   │   ├── app/                        # Routes (TanStack Router)
│   │   │   ├── __root.tsx              # Root layout
│   │   │   ├── index.tsx               # Home page
│   │   │   ├── login.tsx               # Login page
│   │   │   ├── direct-messages/        # DMs routes
│   │   │   │   ├── index.tsx           # Lista DMs
│   │   │   │   └── [agent-id].tsx      # DM específico
│   │   │   ├── project/                # Project routes
│   │   │   │   ├── create.tsx          # Criar projeto
│   │   │   │   └── [project-id]/       # Projeto específico
│   │   │   │       ├── layout.tsx      # Layout projeto
│   │   │   │       ├── index.tsx       # Overview projeto
│   │   │   │       ├── chat/           # Chat routes
│   │   │   │       │   └── [channel-id].tsx
│   │   │   │       ├── forum/          # Forum routes
│   │   │   │       │   ├── index.tsx   # Lista tópicos
│   │   │   │       │   └── [topic-id].tsx
│   │   │   │       ├── issues/         # Issues routes
│   │   │   │       │   ├── index.tsx   # Kanban board
│   │   │   │       │   ├── create.tsx  # Criar issue
│   │   │   │       │   └── [issue-id].tsx
│   │   │   │       ├── agents/         # Agents routes
│   │   │   │       │   └── index.tsx   # Lista agentes
│   │   │   │       └── settings/       # Settings routes
│   │   │   │           └── index.tsx
│   │   │   └── settings/               # Global settings
│   │   │       ├── index.tsx           # Settings gerais
│   │   │       ├── agents.tsx          # Gestão agentes
│   │   │       └── account.tsx         # Configurações conta
│   │   ├── components/                  # UI Components
│   │   │   ├── layout/                 # Layout components
│   │   │   │   ├── discord-layout.tsx  # Layout principal Discord-like
│   │   │   │   ├── server-sidebar.tsx  # Sidebar projetos
│   │   │   │   ├── channel-sidebar.tsx # Sidebar canais
│   │   │   │   ├── member-sidebar.tsx  # Sidebar membros
│   │   │   │   ├── topbar.tsx          # Barra superior
│   │   │   │   └── navigation.tsx      # Componentes navegação
│   │   │   ├── chat/                   # Chat components
│   │   │   │   ├── chat-area.tsx       # Área principal chat
│   │   │   │   ├── message-list.tsx    # Lista mensagens
│   │   │   │   ├── message-item.tsx    # Item mensagem individual
│   │   │   │   ├── chat-input.tsx      # Input mensagem
│   │   │   │   ├── typing-indicator.tsx # Indicador digitação
│   │   │   │   └── emoji-picker.tsx    # Seletor emojis
│   │   │   ├── project/                # Project components
│   │   │   │   ├── project-card.tsx    # Card projeto
│   │   │   │   ├── project-icon.tsx    # Ícone projeto
│   │   │   │   ├── channel-list.tsx    # Lista canais
│   │   │   │   ├── project-header.tsx  # Header projeto
│   │   │   │   └── project-settings.tsx # Settings projeto
│   │   │   ├── agent/                  # Agent components
│   │   │   │   ├── agent-card.tsx      # Card agente
│   │   │   │   ├── agent-avatar.tsx    # Avatar agente
│   │   │   │   ├── agent-status.tsx    # Status agente
│   │   │   │   ├── agent-form.tsx      # Form criar/editar agente
│   │   │   │   └── agent-list.tsx      # Lista agentes
│   │   │   ├── forum/                  # Forum components
│   │   │   │   ├── topic-list.tsx      # Lista tópicos
│   │   │   │   ├── topic-item.tsx      # Item tópico
│   │   │   │   ├── topic-thread.tsx    # Thread discussão
│   │   │   │   ├── post-item.tsx       # Item post individual
│   │   │   │   └── post-composer.tsx   # Composer novo post
│   │   │   ├── issues/                 # Issues components
│   │   │   │   ├── kanban-board.tsx    # Board Kanban
│   │   │   │   ├── kanban-column.tsx   # Coluna Kanban
│   │   │   │   ├── issue-card.tsx      # Card issue
│   │   │   │   ├── issue-form.tsx      # Form criar/editar issue
│   │   │   │   └── issue-detail.tsx    # Detalhes issue
│   │   │   ├── auth/                   # Auth components
│   │   │   │   ├── login-form.tsx      # Form login
│   │   │   │   ├── register-form.tsx   # Form registro
│   │   │   │   └── account-switcher.tsx # Troca contas
│   │   │   └── ui/                     # Base UI (shadcn/ui)
│   │   │       ├── button.tsx          # Componente botão
│   │   │       ├── input.tsx           # Componente input
│   │   │       ├── card.tsx            # Componente card
│   │   │       ├── dialog.tsx          # Componente dialog
│   │   │       ├── dropdown-menu.tsx   # Dropdown menu
│   │   │       ├── sheet.tsx           # Sheet/drawer
│   │   │       ├── toast.tsx           # Notificações
│   │   │       └── [outros-shadcn].tsx # Outros componentes UI
│   │   ├── hooks/                      # Custom React Hooks (flat)
│   │   │   ├── use-auth.ts             # Hook autenticação
│   │   │   ├── use-agents.ts           # Hook agentes
│   │   │   ├── use-projects.ts         # Hook projetos
│   │   │   ├── use-channels.ts         # Hook canais
│   │   │   ├── use-chat.ts             # Hook chat
│   │   │   ├── use-messages.ts         # Hook mensagens
│   │   │   ├── use-forum.ts            # Hook fórum
│   │   │   ├── use-issues.ts           # Hook issues
│   │   │   ├── use-api.ts              # Hook IPC communication
│   │   │   └── use-websocket.ts        # Hook WebSocket (futuro)
│   │   ├── store/                      # Global State (Zustand)
│   │   │   ├── auth-store.ts           # Estado autenticação
│   │   │   ├── app-store.ts            # Estado aplicação global
│   │   │   ├── chat-store.ts           # Estado chat
│   │   │   ├── project-store.ts        # Estado projetos
│   │   │   ├── agent-store.ts          # Estado agentes
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
│       │   ├── auth.ts                 # Types autenticação
│       │   ├── user.ts                 # Types usuário
│       │   ├── agent.ts                # Types agente
│       │   ├── project.ts              # Types projeto
│       │   ├── channel.ts              # Types canal
│       │   ├── message.ts              # Types mensagem
│       │   ├── forum.ts                # Types fórum
│       │   ├── issue.ts                # Types issue
│       │   ├── git.ts                  # Types Git operations
│       │   ├── api.ts                  # Types API/IPC
│       │   └── common.ts               # Types comuns
│       ├── schemas/                    # Zod Validation Schemas
│       │   ├── auth-schemas.ts         # Schemas autenticação
│       │   ├── user-schemas.ts         # Schemas usuário
│       │   ├── agent-schemas.ts        # Schemas agente
│       │   ├── project-schemas.ts      # Schemas projeto
│       │   ├── channel-schemas.ts      # Schemas canal
│       │   ├── message-schemas.ts      # Schemas mensagem
│       │   ├── forum-schemas.ts        # Schemas fórum
│       │   ├── issue-schemas.ts        # Schemas issue
│       │   └── common-schemas.ts       # Schemas comuns
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
│   ├── setup-dev.js                  # Setup ambiente desenvolvimento
│   ├── migrate-database.js           # Script migrações manuais
│   ├── seed-database.js              # Seed dados teste
│   └── build-production.js           # Build personalizado
│
├── config/                            # Arquivos de configuração
│   ├── vite.main.config.ts           # Config Vite main process
│   ├── vite.renderer.config.ts       # Config Vite renderer
│   ├── vite.preload.config.ts        # Config Vite preload
│   ├── drizzle.config.ts             # Config Drizzle ORM
│   ├── eslint.config.js              # Config ESLint
│   ├── tailwind.config.ts            # Config TailwindCSS
│   ├── vitest.config.ts              # Config Vitest
│   └── forge.config.ts               # Config Electron Forge
│
├── .env.example                      # Exemplo variáveis ambiente
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependências e scripts
├── tsconfig.json                     # Config TypeScript
├── README.md                         # README principal
└── ARCHITECTURE.md                   # Visão geral arquitetura
```

---

## 📋 Convenções de Nomenclatura

### Arquivos e Diretórios

```typescript
// ✅ Correto - kebab-case para arquivos
user-service.ts
project-card.tsx
use-auth.ts
auth-store.ts

// ❌ Incorreto
userService.ts
ProjectCard.tsx
useAuth.ts
authStore.ts
```

### Componentes React

```typescript
// ✅ Correto - PascalCase para componentes
export function ProjectCard() { }
export function ChatInput() { }
export function AgentAvatar() { }

// ❌ Incorreto
export function projectCard() { }
export function chatInput() { }
```

### Hooks Customizados

```typescript
// ✅ Correto - use-something pattern
use-auth.ts
use-projects.ts
use-chat.ts

// ❌ Incorreto
auth-hook.ts
projects-hook.ts
```

### Services e APIs

```typescript
// ✅ Correto - domain-service/api pattern
auth-service.ts
project-service.ts
agents-api.ts
messages-api.ts

// ❌ Incorreto
authentication.ts
projects.ts
```

---

## 🎯 Organização por Responsabilidade

### Backend (main/)

```typescript
// api/ - Handlers IPC (apenas validação + chamada service)
export async function handleCreateProject(data: unknown) {
  const validated = ProjectSchema.parse(data);
  return await ProjectService.create(validated);
}

// services/ - Business logic pura
export class ProjectService {
  static async create(data: CreateProjectInput): Promise<Project> {
    // Toda a lógica de negócio aqui
  }
}

// database/ - Acesso dados via Drizzle
export const projectsSchema = sqliteTable('projects', {
  // Schema definition
});
```

### Frontend (renderer/)

```typescript
// app/ - Pages/Routes com TanStack Router
export function ProjectPage() {
  // Lógica página específica
}

// components/ - Componentes UI reutilizáveis
export function ProjectCard({ project }: { project: Project }) {
  // Lógica apresentação
}

// hooks/ - Lógica state/side effects
export function useProjects() {
  // Lógica state management
}

// store/ - Estado global Zustand
export const useProjectStore = create<ProjectState>(() => ({
  // Estado global
}));
```

---

## 📊 Benefícios da Organização

### 🎯 Para Encontrar Código

- **Flat organization** - Menos níveis de navegação
- **Domain-driven** - Agrupamento lógico por funcionalidade
- **Consistent naming** - Padrões previsíveis
- **Single responsibility** - Um arquivo = uma função

### 🔧 Para Manutenção

- **Isolation** - Mudanças localizadas
- **Clear boundaries** - Responsabilidades bem definidas
- **Easy refactoring** - Estrutura suporta mudanças
- **Scalable** - Cresce naturalmente

### 👨‍💻 Para Desenvolvedores

- **Intuitive** - Qualquer dev encontra o que precisa
- **Consistent** - Padrões aplicados consistentemente
- **Self-documenting** - Estrutura explica organização
- **Onboarding friendly** - Rápido para começar

---

## 🚀 Próximos Documentos

1. **DATABASE-SCHEMA.md** - Estrutura completa banco dados
2. **API-SPECIFICATION.md** - Especificação APIs IPC
3. **COMPONENT-LIBRARY.md** - Sistema design componentes
4. **CODING-STANDARDS.md** - Padrões e convenções código

---

*Esta estrutura foi projetada para maximizar produtividade e minimizar complexidade, seguindo os princípios KISS e Clean Code.*