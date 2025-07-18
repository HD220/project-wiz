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

A estrutura de código é organizada em `src` e dividida em `main` (backend), `renderer` (frontend) e `shared`. A organização interna segue uma abordagem de Domain-Driven Design (DDD) com Bounded Contexts e Aggregates.

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
├── renderer/                        # Frontend (React)
│   ├── app/                         # Rotas (TanStack Router)
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   └── project/
│   │       └── [project-id]/        # Rota de Projeto
│   │           └── ...
│   ├── features/                    # Features organizadas por domínio
│   │   ├── user/
│   │   │   └── authentication/      # Aggregate: Authentication
│   │   │       ├── components/      # Componentes de Autenticação
│   │   │       │   └── login-form.tsx
│   │   │       ├── hooks/
│   │   │       │   └── use-auth.ts
│   │   │       └── store/
│   │   │           └── auth-store.ts
│   │   ├── project/               # Feature: Project
│   │   │   ├── components/        # Componentes do projeto
│   │   │   │   └── project-card.tsx
│   │   │   ├── hooks/             # Hooks do projeto
│   │   │   │   └── use-projects.ts
│   │   │   └── issues/            # Aggregate: Issues
│   │   │       ├── components/
│   │   │       │   └── kanban-board.tsx
│   │   │       └── hooks/
│   │   │           └── use-issues.ts
│   ├── components/                  # Componentes de UI compartilhados
│   │   ├── layout/
│   │   └── ui/                      # Componentes base (shadcn/ui)
│   ├── hooks/                       # Hooks globais
│   ├── store/                       # Stores globais
│   └── utils/                       # Utilitários do Frontend
│
└── shared/                          # Código compartilhado (backend/frontend)
    ├── types/                       # Definições de tipos TypeScript
    ├── schemas/                     # Schemas de validação Zod
    └── utils/                       # Utilitários compartilhados
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
