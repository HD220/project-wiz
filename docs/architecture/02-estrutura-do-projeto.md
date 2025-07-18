# 2. Estrutura do Projeto

**Versão:** 3.0  
**Status:** Design Final  
**Data:** 2025-01-17

---

## 🎯 Filosofia da Organização

A estrutura de arquivos do Project Wiz é um dos pilares da nossa filosofia de simplicidade e clareza. Ela foi desenhada para ser intuitiva e escalável, seguindo os princípios:

1.  **Domain-Driven Organization**: O código é organizado por domínios de negócio (ex: `user`, `project`, `agents`), não por tipo técnico (ex: `controllers`, `models`).
2.  **Flat is Better than Nested**: Evitamos aninhamento desnecessário de diretórios para facilitar a navegação e a descoberta de arquivos.
3.  **Separação Clara de Responsabilidades**: As fronteiras entre o backend (`main`), o frontend (`renderer`) e o código compartilhado (`shared`) são estritamente definidas.
4.  **Convention over Configuration**: A estrutura e as convenções de nomenclatura são previsíveis, reduzindo a carga cognitiva e a necessidade de configuração.

---

## 📁 Estrutura de Diretórios Completa

A estrutura de código é organizada em `src` e dividida em `main` (backend) e `renderer` (frontend). A organização interna segue uma abordagem de Domain-Driven Design (DDD) com Bounded Contexts e Aggregates.

```
src/
├── main/                            # Backend (Node.js/Electron)
│   ├── user/                        # Bounded Context: User
│   │   ├── authentication/          # Aggregate: Authentication
│   │   │   ├── auth.handlers.ts
│   │   │   ├── auth.service.ts
│   │   │   └── users.schema.ts
│   │   └── profile/                 # Aggregate: Profile
│   │       └── profile.service.ts
│   ├── project/                     # Bounded Context: Project
│   │   ├── project.handlers.ts      # Handlers do projeto principal
│   │   ├── project.service.ts       # Serviço do projeto principal
│   │   ├── projects.schema.ts       # Schema do projeto principal
│   │   ├── channels/                # Aggregate: Channels
│   │   ├── issues/                  # Aggregate: Issues
│   │   └── ...
│   ├── agents/                      # Bounded Context: Agents
│   │   ├── worker/                  # Aggregate: Worker
│   │   │   ├── agent.handlers.ts
│   │   │   ├── agent.service.ts
│   │   │   └── agent.worker.ts
│   │   └── queue/                   # Aggregate: Queue
│   │       └── queue.service.ts
│   ├── conversations/               # Bounded Context: Conversations
│   │   ├── message.service.ts       # Core messaging logic
│   │   ├── routing/                 # Agent interaction routing
│   │   └── ...                      # DMs, channel messages
│   ├── database/                    # Camada de Dados (Drizzle ORM)
│   │   ├── connection.ts
│   │   ├── migrations/
│   │   └── index.ts
│   └── main.ts                      # Ponto de entrada do Electron
│
└── renderer/                        # Frontend (React)
    ├── app/                         # Rotas (TanStack Router)
    │   ├── __root.tsx
    │   ├── index.tsx
    │   └── project/
    │       └── [project-id]/        # Rota de Projeto
    │           └── ...
    ├── features/                    # Features organizadas por domínio
    │   ├── user/
    │   │   └── authentication/      # Aggregate: Authentication
    │   │       ├── components/      # Componentes de Autenticação
    │   │       │   └── login-form.tsx
    │   │       ├── hooks/
    │   │       │   └── use-auth.ts
    │   │       └── store/
    │   │           └── auth-store.ts
    │   ├── project/               # Feature: Project
    │   │   ├── components/        # Componentes do projeto
    │   │   │   ├── project-card.tsx
    │   │   │   └── kanban-board.tsx  # Componente do agregado Issues
    │   │   ├── hooks/             # Hooks do projeto
    │   │   │   ├── use-projects.ts
    │   │   │   └── use-issues.ts     # Hook do agregado Issues
    ├── components/                  # Componentes de UI compartilhados
    │   ├── layout/
    │   └── ui/                      # Componentes base (shadcn/ui)
    ├── hooks/                       # Hooks globais
    ├── store/                       # Stores globais
    └── utils/                       # Utilitários do Frontend
```

### `src/main` - Backend Detalhado

- **Bounded Contexts (`user/`, `project/`, `agents/`, `conversations/`)**: Cada diretório representa um domínio de negócio principal.
- **Aggregates (`authentication/`, `channels/`, `worker/`)**: Dentro de um Bounded Context, os agregados agrupam funcionalidades relacionadas. A lógica principal do contexto (ex: `project.service.ts`) fica na raiz do diretório do contexto e geralmente orquestra os serviços dos agregados filhos (ex: invocar o `ChannelService` para criar canais).

### `src/renderer` - Frontend Detalhado

- **`app/`**: As rotas da aplicação, seguindo a convenção do TanStack Router.
- **`features/`**: A implementação da UI para os domínios de negócio, espelhando a estrutura do backend.
  - `features/project/components/`: Contém componentes React específicos para o domínio de projetos.
  - `features/project/hooks/`: Contém hooks React que encapsulam a lógica de estado e acesso a dados para o domínio de projetos.
- **`components/`**: Contém componentes de UI que são puramente visuais e reutilizáveis em múltiplos domínios.

---

## 🔧 Utilitários de Infraestrutura

### Sistema de Eventos (`src/main/utils/events.ts`)

O Project Wiz utiliza um sistema de eventos centralizado baseado em EventBus para facilitar a comunicação entre diferentes partes do sistema sem acoplamento direto.

**Características:**

- **EventBus Singleton**: Uma instância única e global para toda a aplicação
- **Type-Safe Events**: Todos os eventos são tipados com TypeScript para garantir consistência
- **Domain Events**: Eventos organizados por domínio (user, project, agent, message, etc.)
- **Error Handling**: Tratamento automático de erros em handlers de eventos
- **Logging**: Log automático de publicação e subscrição de eventos

**Domínios de Eventos Suportados:**

- **User Events**: `user.created`, `user.updated`, `user.deactivated`, `user.preferences.updated`
- **Project Events**: `project.created`, `project.updated`, `project.archived`, `project.deleted`
- **Agent Events**: `agent.created`, `agent.updated`, `agent.status_changed`, `agent.added_to_project`, `agent.removed_from_project`
- **Message Events**: `message.sent`, `message.edited`, `message.deleted`
- **Channel Events**: `channel.created`, `channel.updated`, `channel.deleted`
- **Issue Events**: `issue.created`, `issue.updated`, `issue.status_changed`, `issue.assigned`, `issue.completed`

**Uso:**

```typescript
// Publicar evento
publishEvent("project.created", {
  projectId: "proj123",
  name: "New Project",
  ownerId: "user456",
});

// Subscrever evento
const unsubscribe = subscribeToEvent("project.created", (data) => {
  console.log(`Project ${data.name} created by ${data.ownerId}`);
});

// Cancelar subscrição
unsubscribe();
```

### Gerador de IDs (`src/main/utils/id-generator.ts`)

Sistema centralizado para geração de IDs únicos com prefixos específicos de domínio, garantindo identificação consistente em toda a aplicação.

**Características:**

- **Baseado em Crypto**: Utiliza `crypto.randomBytes` para melhor entropia que `Math.random()`
- **Prefixos de Domínio**: Cada domínio tem seu próprio prefixo (ex: `user_`, `project_`, `agent_`)
- **Timestamp Legível**: Inclui timestamp em base36 para facilitar debugging
- **IDs Curtos**: Função especial para IDs de display com apenas 8 caracteres

**Geradores Disponíveis:**

- `generateUserId()` → `user_<timestamp>-<random>`
- `generateProjectId()` → `project_<timestamp>-<random>`
- `generateAgentId()` → `agent_<timestamp>-<random>`
- `generateChannelId()` → `channel_<timestamp>-<random>`
- `generateMessageId()` → `msg_<timestamp>-<random>`
- `generateIssueId()` → `issue_<timestamp>-<random>`
- `generateForumTopicId()` → `topic_<timestamp>-<random>`
- `generateForumPostId()` → `post_<timestamp>-<random>`
- `generateConversationId()` → `conv_<timestamp>-<random>`

**Uso:**

```typescript
// Gerar ID com prefixo específico
const userId = generateUserId(); // user_lz1234-abcd1234ef567890

// Gerar ID genérico com prefixo personalizado
const customId = generateId("custom"); // custom_lz1234-abcd1234ef567890

// Gerar ID curto para display
const shortId = generateShortId(); // abcd1234
```

**Implicações Arquiteturais:**

- **Rastreabilidade**: IDs com prefixo facilitam debugging e logs
- **Unicidade**: Combinação de timestamp e random garante unicidade global
- **Legibilidade**: Base36 timestamp permite identificar idade do objeto
- **Consistência**: Todos os domínios seguem o mesmo padrão de geração
