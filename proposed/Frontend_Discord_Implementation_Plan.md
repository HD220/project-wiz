# Project Wiz - Plano de Implementação Frontend Discord-like

## Visão Geral

Este documento detalha o plano completo de implementação para criar um frontend semelhante ao Discord para o Project Wiz, uma aplicação desktop que atua como uma "fábrica de software autônoma" utilizando Agentes de IA.

## Objetivos

- Criar uma interface familiar e intuitiva inspirada no Discord
- Implementar comunicação em tempo real com agentes de IA
- Integrar ferramentas de desenvolvimento de forma fluida
- Suportar múltiplos projetos e contextos de trabalho
- Proporcionar uma experiência de usuário profissional e eficiente

## Arquitetura de Layout Principal

### Layout Base Discord-inspired
```
┌─────────────────────────────────────────────────────────┐
│ [Projects] │ [Channels/DMs] │    [Main Content]    │[Panel]│
│     72px   │     240px     │       Flex-1        │ 280px │
│            │               │                     │       │
│  • Proj A  │ # general     │   ┌─────────────────┐ │ Info  │
│  • Proj B  │ # tasks       │   │ Chat Messages   │ │ Panel │
│  • Proj C  │ # agents      │   │                 │ │       │
│            │               │   └─────────────────┘ │       │
│  + Create  │ DMs:          │   [Message Input]    │       │
│            │ @Assistant    │                     │       │
│            │ @CodeReview   │                     │       │
└─────────────────────────────────────────────────────────┘
```

### Componentes Principais

1. **Project Sidebar (72px)**: Lista de projetos ativos
2. **Channels Sidebar (240px)**: Canais de comunicação e DMs com agentes
3. **Main Content (flex-1)**: Área principal de trabalho
4. **Right Panel (280px)**: Painel contextual (opcional, responsivo)

## Estrutura de Componentes

### 1. Layout Components (`src/renderer/components/layout/`)

```
layout/
├── app-layout.tsx              # Layout principal da aplicação
├── discord-layout.tsx          # Layout Discord existente (melhorado)
├── project-sidebar.tsx         # Sidebar de projetos (melhorado)  
├── channels-sidebar.tsx        # Sidebar de canais (melhorado)
├── main-content-area.tsx       # Área principal de conteúdo
├── right-panel.tsx             # Panel lateral direito
├── status-bar.tsx              # Barra de status inferior
├── command-palette.tsx         # Paleta de comandos (Ctrl+K)
└── navigation-breadcrumb.tsx   # Breadcrumb de navegação
```

**Funcionalidades Principais:**
- Layout responsivo e redimensionável
- Persistência de estado das sidebars
- Suporte a atalhos de teclado
- Indicadores de status em tempo real

### 2. Chat Components (`src/renderer/components/chat/`)

```
chat/
├── chat-container.tsx          # Container principal do chat
├── message-list.tsx            # Lista de mensagens
├── message-item.tsx            # Item individual de mensagem
├── message-input.tsx           # Input de mensagem (melhorado)
├── message-thread.tsx          # Thread de mensagens
├── typing-indicator.tsx        # Indicador de digitação
├── agent-status.tsx            # Status do agente
├── code-block.tsx              # Bloco de código em mensagens
└── file-attachment.tsx         # Anexos de arquivo
```

**Funcionalidades Principais:**
- Mensagens em tempo real
- Suporte a markdown e código
- Sistema de threads
- Indicadores de status de agentes
- Histórico de conversas

### 3. Features Modulares

#### Project Management (`src/renderer/features/project-management/`)

```
project-management/
├── components/
│   ├── project-overview.tsx         # Visão geral do projeto
│   ├── project-creation-wizard.tsx  # Wizard de criação
│   ├── project-settings.tsx         # Configurações do projeto
│   ├── project-switcher.tsx         # Seletor de projetos
│   ├── git-integration/
│   │   ├── git-status.tsx          # Status do Git
│   │   ├── git-history.tsx         # Histórico de commits
│   │   ├── branch-manager.tsx      # Gerenciador de branches
│   │   └── merge-requests.tsx      # Merge requests
│   └── file-explorer/
│       ├── file-tree.tsx           # Árvore de arquivos
│       ├── file-viewer.tsx         # Visualizador de arquivos
│       └── file-editor.tsx         # Editor de arquivos
├── hooks/
│   ├── use-project-state.ts
│   ├── use-git-operations.ts
│   └── use-file-system.ts
└── index.tsx
```

#### Agent Management (`src/renderer/features/agent-management/`)

```
agent-management/
├── components/
│   ├── agent-dashboard.tsx          # Dashboard de agentes
│   ├── agent-card.tsx              # Card do agente
│   ├── agent-chat.tsx              # Chat com agente
│   ├── agent-status-panel.tsx      # Panel de status
│   ├── agent-creation-wizard.tsx   # Wizard de criação
│   ├── agent-settings.tsx          # Configurações do agente
│   ├── task-assignment.tsx         # Atribuição de tarefas
│   └── execution-monitor.tsx       # Monitor de execução
├── hooks/
│   ├── use-agent-communication.ts
│   ├── use-agent-status.ts
│   └── use-task-execution.ts
└── index.tsx
```

#### Task Management (`src/renderer/features/task-management/`)

```
task-management/
├── components/
│   ├── kanban-board.tsx            # Board Kanban (melhorado)
│   ├── task-card.tsx               # Card de tarefa
│   ├── task-details.tsx            # Detalhes da tarefa
│   ├── task-creation-form.tsx      # Formulário de criação
│   ├── sprint-planning.tsx         # Planejamento de sprint
│   ├── backlog-management.tsx      # Gerenciamento de backlog
│   └── progress-tracker.tsx        # Rastreador de progresso
├── hooks/
│   ├── use-task-management.ts
│   ├── use-kanban-state.ts
│   └── use-sprint-planning.ts
└── index.tsx
```

#### Development Tools (`src/renderer/features/development-tools/`)

```
development-tools/
├── components/
│   ├── terminal/
│   │   ├── terminal-panel.tsx      # Panel do terminal
│   │   ├── terminal-output.tsx     # Output do terminal
│   │   ├── command-history.tsx     # Histórico de comandos
│   │   └── command-input.tsx       # Input de comandos
│   ├── documentation/
│   │   ├── doc-viewer.tsx          # Visualizador (melhorado)
│   │   ├── markdown-renderer.tsx   # Renderizador Markdown
│   │   ├── doc-navigation.tsx      # Navegação de docs
│   │   └── doc-search.tsx          # Busca em documentação
│   └── code-tools/
│       ├── code-review-panel.tsx   # Panel de code review
│       ├── diff-viewer.tsx         # Visualizador de diffs
│       └── syntax-highlighter.tsx  # Highlighter de sintaxe
├── hooks/
│   ├── use-terminal.ts
│   ├── use-documentation.ts
│   └── use-code-review.ts
└── index.tsx
```

## Estrutura de Rotas (TanStack Router)

### Hierarquia Principal

```typescript
/                                    # Home/Dashboard principal
├── /projects                        # Lista de projetos
│   ├── /create                     # Criar novo projeto
│   └── /$projectId                 # Projeto específico
│       ├── /                       # Dashboard do projeto
│       ├── /chat                   # Chat geral do projeto
│       │   ├── /$channelId         # Canal específico
│       │   └── /dm/$agentId        # DM com agente
│       ├── /tasks                  # Gerenciamento de tarefas
│       │   ├── /                   # Lista de tarefas
│       │   ├── /kanban             # Board Kanban
│       │   ├── /create             # Criar tarefa
│       │   └── /$taskId            # Detalhes da tarefa
│       ├── /agents                 # Agentes do projeto
│       │   ├── /                   # Lista de agentes
│       │   ├── /create             # Criar agente
│       │   └── /$agentId           # Detalhes do agente
│       ├── /files                  # Explorador de arquivos
│       │   ├── /                   # Raiz dos arquivos
│       │   └── /**                 # Navegação por pastas
│       ├── /git                    # Controle de versão
│       │   ├── /status             # Status do repositório
│       │   ├── /history            # Histórico de commits
│       │   ├── /branches           # Gerenciamento de branches
│       │   └── /merges             # Merge requests
│       └── /settings               # Configurações do projeto
├── /agents                         # Dashboard global de agentes
│   ├── /                          # Lista de todos os agentes
│   ├── /create                    # Criar novo agente
│   └── /$agentId                  # Detalhes específicos do agente
├── /forum                         # Sistema de fórum
│   ├── /                          # Lista de tópicos
│   ├── /create                    # Criar novo tópico
│   └── /$topicId                  # Thread de discussão
├── /documentation                 # Sistema de documentação
│   ├── /                          # Índice da documentação
│   └── /**                        # Navegação por documentos
├── /terminal                      # Terminal integrado
└── /settings                      # Configurações globais
    ├── /                          # Configurações gerais
    ├── /llm                       # Configuração de LLM
    ├── /appearance                # Aparência e tema
    ├── /shortcuts                 # Atalhos de teclado
    └── /advanced                  # Configurações avançadas
```

### Layouts por Contexto

```typescript
Root Layout (AppLayout)              # Layout base da aplicação
├── Discord Layout                   # Layout Discord para áreas principais
│   ├── Project Routes (/projects/*)
│   ├── Agent Routes (/agents/*)
│   └── Forum Routes (/forum/*)
├── Settings Layout                  # Layout específico para configurações
│   └── Settings Routes (/settings/*)
├── Documentation Layout             # Layout para documentação
│   └── Docs Routes (/documentation/*)
└── Modal Layout                     # Layout para modais/wizards
    ├── Project Creation
    ├── Agent Creation
    └── Task Creation
```

## Estratégia de Estado Global

### Estado Principal (Zustand + TanStack Query)

```typescript
// Store Principal da Aplicação
interface AppStore {
  // UI State
  theme: 'dark' | 'light' | 'auto'
  sidebarCollapsed: boolean
  activeProject: string | null
  activeChannel: string | null
  
  // User State
  user: User | null
  preferences: UserPreferences
  
  // Real-time State
  onlineAgents: string[]
  activeConnections: Connection[]
  
  // Navigation State
  breadcrumb: BreadcrumbItem[]
  commandPaletteOpen: boolean
}

// Stores Específicos
interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  projectSettings: ProjectSettings
}

interface AgentStore {
  agents: Agent[]
  agentStatuses: Record<string, AgentStatus>
  currentTasks: Record<string, Task[]>
}

interface ChatStore {
  messages: Record<string, Message[]>
  typingIndicators: Record<string, string[]>
  unreadCounts: Record<string, number>
}
```

### Cache de Dados (TanStack Query)

```typescript
// Queries principais
const queries = {
  projects: useProjects(),
  agents: useAgents(),
  messages: useMessages(channelId),
  tasks: useTasks(projectId),
  files: useProjectFiles(projectId),
  gitStatus: useGitStatus(projectId),
}

// Mutations principais
const mutations = {
  createProject: useCreateProject(),
  sendMessage: useSendMessage(),
  createTask: useCreateTask(),
  updateAgentStatus: useUpdateAgentStatus(),
}
```

## Sistema Responsivo

### Breakpoints e Layout

```typescript
// Breakpoints Discord-inspired
const breakpoints = {
  mobile: '768px',     // < 768px: Mobile/tablet portrait
  tablet: '1024px',    # < 1024px: Tablet landscape
  desktop: '1440px',   # < 1440px: Desktop padrão
  wide: '1920px',      # >= 1920px: Monitores largos
}

// Layout responsivo por viewport
Mobile (< 768px):     [Projects] overlay + [Main Content] (full width)
Tablet (768-1024px):  [Projects] + [Main Content] (no right panel)
Desktop (1024-1440px): [Projects] + [Channels] + [Main Content]
Wide (>= 1440px):     [Projects] + [Channels] + [Main Content] + [Right Panel]
```

### CSS Grid Layout

```css
.app-layout {
  display: grid;
  grid-template-columns: 
    var(--sidebar-width, 72px)     /* Projects sidebar */
    var(--channels-width, 240px)   /* Channels sidebar */
    1fr                            /* Main content */
    var(--panel-width, 280px);     /* Right panel */
  grid-template-rows: 1fr auto;    /* Content + status bar */
  height: 100vh;
}

.responsive-layout {
  @media (max-width: 768px) {
    --channels-width: 0px;
    --panel-width: 0px;
  }
  
  @media (max-width: 1024px) {
    --panel-width: 0px;
  }
  
  @media (max-width: 1440px) {
    --panel-width: 240px;
  }
}
```

## Funcionalidades Específicas por Tela

### 1. Dashboard Principal
- **Componentes**: ProjectOverview, AgentStatusCards, RecentActivity
- **Funcionalidades**: 
  - Visão geral de todos os projetos
  - Status dos agentes ativos
  - Atividade recente
  - Acesso rápido a projetos favoritos

### 2. Chat com Agentes
- **Componentes**: ChatContainer, MessageList, MessageInput, AgentStatus
- **Funcionalidades**:
  - Comunicação em tempo real
  - Comandos de texto para agentes
  - Histórico de conversas
  - Indicadores de execução de tarefas
  - Anexos de arquivos e código

### 3. Kanban Board
- **Componentes**: KanbanBoard, TaskCard, TaskModal
- **Funcionalidades**:
  - Arrastar e soltar tarefas
  - Filtros e busca
  - Atribuição a agentes
  - Progress tracking
  - Estimativas de tempo

### 4. Explorador de Arquivos
- **Componentes**: FileTree, FileViewer, FileEditor
- **Funcionalidades**:
  - Navegação em árvore
  - Preview de arquivos
  - Edição inline
  - Integração com Git
  - Busca por conteúdo

### 5. Terminal Integrado
- **Componentes**: TerminalPanel, CommandInput, OutputViewer
- **Funcionalidades**:
  - Execução de comandos
  - Histórico de comandos
  - Output colorizado
  - Múltiplas abas
  - Integração com agentes

### 6. Gerenciamento de Agentes
- **Componentes**: AgentDashboard, AgentCard, AgentCreationWizard
- **Funcionalidades**:
  - Criação de agentes personalizados
  - Configuração de personas
  - Monitoramento de performance
  - Atribuição de tarefas
  - Logs de execução

## Fluxos de Usuário Principais

### 1. Criação de Projeto
```
Home → Create Project → Wizard → [Name/Description] → [Git Options] → Confirmation → Project Dashboard
```

### 2. Interação com Agente
```
Project → Agent DM → Message Input → Agent Processing → Task Creation → Progress Updates → Completion
```

### 3. Gerenciamento de Tarefas
```
Project → Tasks → Kanban Board → Create Task → Assign Agent → Monitor Progress → Review Results
```

### 4. Exploração de Código
```
Project → Files → Navigate Tree → View File → Edit → Git Integration → Commit Changes
```

## Considerações Técnicas

### Performance
- Virtualização de listas longas (mensagens, arquivos)
- Lazy loading de componentes
- Memoização de componentes pesados
- Cache inteligente de dados

### Acessibilidade
- Suporte a screen readers
- Navegação por teclado
- Contraste adequado
- Textos alternativos para ícones

### Internacionalização
- Suporte a múltiplos idiomas (LinguiJS)
- Formatação de datas/números por região
- RTL support (futuro)

### Segurança
- Sanitização de entrada do usuário
- Validação de dados no frontend
- Escape de conteúdo markdown
- Proteção contra XSS

## Cronograma de Implementação

### Fase 1: Fundação (2-3 semanas)
- [ ] Layout base e routing
- [ ] Componentes UI fundamentais
- [ ] Sistema de estado global
- [ ] IPC client setup

### Fase 2: Core Features (3-4 semanas)
- [ ] Sistema de chat
- [ ] Gerenciamento de projetos
- [ ] Dashboard de agentes
- [ ] Terminal integrado

### Fase 3: Advanced Features (2-3 semanas)
- [ ] Kanban board
- [ ] Explorador de arquivos
- [ ] Git integration
- [ ] Documentation viewer

### Fase 4: Polish & Testing (1-2 semanas)
- [ ] Responsive design
- [ ] Performance optimization
- [ ] Testing e2e
- [ ] Accessibility compliance

## Recursos Necessários

### Dependências Adicionais
- `@dnd-kit/core` - Drag and drop para Kanban
- `@monaco-editor/react` - Editor de código
- `react-window` - Virtualização de listas
- `framer-motion` - Animações
- `zustand` - Estado global
- `@tanstack/react-query` - Cache de dados

### Assets
- Ícones para diferentes tipos de arquivo
- Avatares para agentes
- Temas Discord-like (dark/light)
- Animações de loading

## Conclusão

Este plano de implementação visa criar uma interface familiar, moderna e eficiente para o Project Wiz, aproveitando os padrões de UX do Discord enquanto integra as funcionalidades específicas de uma ferramenta de desenvolvimento assistida por IA. A arquitetura modular permitirá desenvolvimento incremental e fácil manutenção, enquanto o sistema responsivo garantirá uma boa experiência em diferentes tamanhos de tela.

A implementação seguirá os princípios de Clean Architecture já estabelecidos no projeto, mantendo a separação clara entre UI, lógica de negócio e camadas de dados.