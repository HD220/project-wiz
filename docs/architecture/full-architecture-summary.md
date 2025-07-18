# Full Architecture Summary

**Versão:** 3.0  
**Status:** Design Final  
**Data de Atualização:** 2025-01-18  

## Visão Geral

O **Project Wiz** é uma aplicação desktop desenvolvida em **Electron** que serve como uma "fábrica de software autônoma". A aplicação utiliza **Agentes de IA** para automatizar diversas etapas do ciclo de vida do desenvolvimento de software, permitindo colaboração entre desenvolvedores humanos e agentes autônomos.

## Arquitetura Geral

### Stack Tecnológico

- **Frontend:** React 19 + TypeScript + Tailwind CSS
- **Backend:** Node.js + TypeScript (Processo Principal do Electron)
- **Banco de Dados:** SQLite + Drizzle ORM
- **Roteamento:** TanStack Router
- **Estado:** TanStack Query + Zustand
- **Validação:** Zod + React Hook Form
- **Componentes:** Shadcn/ui + Radix UI
- **Testes:** Vitest + Testing Library
- **IA:** AI SDK (OpenAI, DeepSeek)

### Estrutura de Processos

```
┌─────────────────────────────────────────────────────────────┐
│                    ELECTRON APP                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   MAIN PROCESS      │    │    RENDERER PROCESS         │ │
│  │   (Node.js)         │    │    (React)                  │ │
│  │                     │    │                             │ │
│  │  • Business Logic   │◄──►│  • User Interface           │ │
│  │  • Database         │    │  • Components               │ │
│  │  • File System      │    │  • Routing                  │ │
│  │  • IPC Handlers     │    │  • State Management         │ │
│  │  • AI Workers       │    │  • API Calls (via IPC)     │ │
│  │                     │    │                             │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Domínios de Negócio

### 1. **Users** - Espaço Pessoal
- **Propósito:** Gerenciamento de usuários e conversas diretas
- **Entidades:** `User`, `DirectMessage`, `Conversation`
- **Funcionalidades:**
  - Autenticação multi-conta
  - Mensagens diretas com agentes
  - Histórico de conversas
  - Configurações pessoais

### 2. **Projects** - Container de Colaboração
- **Propósito:** Espaços de trabalho colaborativo
- **Entidades:** `Project`, `Channel`, `ProjectMessage`
- **Funcionalidades:**
  - Criação e gerenciamento de projetos
  - Canais de comunicação
  - Integração com Git
  - Sistema de arquivos

### 3. **Agents** - Workers Autônomos
- **Propósito:** Agentes de IA para automatização
- **Entidades:** `Agent`, `AgentWorker`, `AgentQueue`
- **Funcionalidades:**
  - Definição de agentes personalizados
  - Execução de tarefas automatizadas
  - Gerenciamento de filas de trabalho
  - Integração com LLMs

### 4. **LLM** - Infraestrutura de IA
- **Propósito:** Integração com provedores de IA
- **Entidades:** `LLMProvider`, `TextGeneration`
- **Funcionalidades:**
  - Configuração de provedores (OpenAI, DeepSeek)
  - Geração de texto e código
  - Gerenciamento de tokens
  - Histórico de interações

### 5. **Conversations** - Sistema de Mensagens
- **Propósito:** Unificação de comunicação
- **Entidades:** `Message`, `MessageRouter`
- **Funcionalidades:**
  - Roteamento de mensagens
  - Suporte a diferentes tipos de chat
  - Markdown e formatação
  - Busca e filtros

## Arquitetura do Banco de Dados

### Schema Principal

```sql
-- Usuários e Autenticação
users (id, username, email, password_hash, created_at, updated_at)

-- Projetos
projects (id, name, description, git_url, status, created_at, updated_at)
channels (id, project_id, name, description, type, created_at, updated_at)

-- Agentes
agents (id, name, description, role, llm_provider_id, config, created_at, updated_at)
llm_providers (id, name, provider_type, api_key, model, config, is_default, created_at, updated_at)

-- Mensagens Unificadas
messages (id, content, sender_type, sender_id, channel_id, conversation_id, created_at, updated_at)

-- Conversas Diretas
dm_conversations (id, user_id, agent_id, created_at, updated_at)

-- Relacionamentos
project_users (project_id, user_id, role, joined_at)
project_agents (project_id, agent_id, added_at)

-- Fóruns e Issues
forum_topics (id, project_id, title, description, author_id, created_at, updated_at)
forum_posts (id, topic_id, content, author_id, created_at, updated_at)
issues (id, project_id, title, description, status, priority, assignee_id, created_at, updated_at)
```

## Fluxo de Dados

### 1. **Comunicação Frontend ↔ Backend**

```
┌─────────────────┐    IPC     ┌─────────────────┐
│    RENDERER     │◄──────────►│      MAIN       │
│                 │            │                 │
│  • React Query  │            │  • IPC Handlers │
│  • Zustand      │            │  • Services     │
│  • Components   │            │  • Database     │
└─────────────────┘            └─────────────────┘
```

### 2. **Fluxo de Mensagens**

```
User Input → Chat Component → IPC → Message Router → Service → Database
                                                   ↓
Agent Worker ← LLM Provider ← Agent Service ← Message Handler
```

### 3. **Gerenciamento de Estado**

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND STATE                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────┐ │
│  │  ZUSTAND       │  │  REACT QUERY   │  │  REACT     │ │
│  │                │  │                │  │  HOOK FORM │ │
│  │  • UI State    │  │  • Server Data │  │            │ │
│  │  • User Prefs  │  │  • Caching     │  │  • Forms   │ │
│  │  • Navigation  │  │  • Mutations   │  │  • Validation│ │
│  │                │  │  • Sync        │  │            │ │
│  └────────────────┘  └────────────────┘  └────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Estrutura de Arquivos

### Backend (Main Process)

```
src/main/
├── app/                    # Configuração da aplicação
│   ├── app-initializer.ts  # Inicialização
│   ├── window-manager.ts   # Gerenciamento de janelas
│   └── handlers-registry.ts# Registro de handlers IPC
├── user/                   # Domínio de usuários
│   ├── authentication/     # Autenticação
│   └── profile/           # Perfil do usuário
├── project/               # Domínio de projetos
│   ├── channels/          # Canais
│   ├── files/             # Sistema de arquivos
│   ├── forums/            # Fóruns
│   ├── issues/            # Issues
│   └── terminal/          # Terminal integrado
├── agents/                # Domínio de agentes
│   ├── worker/            # Workers
│   ├── queue/             # Filas
│   └── llm/               # Integração LLM
├── conversations/         # Sistema de mensagens
│   ├── core/              # Funcionalidades centrais
│   ├── routing/           # Roteamento
│   └── direct-messages/   # Mensagens diretas
├── database/              # Camada de dados
│   ├── connection.ts      # Conexão
│   ├── schema-consolidated.ts # Schema completo
│   └── migrations/        # Migrações
└── utils/                 # Utilitários
```

### Frontend (Renderer Process)

```
src/renderer/
├── app/                   # Páginas/Rotas
│   ├── login.tsx          # Login
│   ├── (user)/            # Área do usuário
│   └── project/           # Área de projetos
├── components/            # Componentes reutilizáveis
│   ├── ui/                # Componentes base
│   ├── forms/             # Formulários
│   └── layout/            # Layout
├── features/              # Features por domínio
│   ├── users/             # Features de usuários
│   ├── projects/          # Features de projetos
│   ├── agents/            # Features de agentes
│   └── conversations/     # Features de conversas
├── hooks/                 # Hooks customizados
├── store/                 # Estado global
└── services/              # Serviços de API
```

## Padrões de Desenvolvimento

### 1. **Domain-Driven Design (DDD)**
- Organização por domínios de negócio
- Linguagem ubíqua
- Separação clara de responsabilidades

### 2. **Clean Architecture**
- Inversão de dependências
- Independência de frameworks
- Testabilidade

### 3. **KISS (Keep It Simple, Stupid)**
- Simplicidade acima de complexidade
- Soluções diretas
- Código legível

### 4. **Type Safety**
- TypeScript rigoroso
- Validação em runtime com Zod
- Tipagem fim-a-fim

### 5. **Reactive Programming**
- React Query para estado do servidor
- Zustand para estado local
- Observables para eventos

## Funcionalidades Principais

### 1. **Autenticação Multi-Conta**
- Login local com JWT
- Múltiplas contas por dispositivo
- Persistência de sessão

### 2. **Workspace Colaborativo**
- Projetos como containers
- Canais de comunicação
- Integração com Git

### 3. **Agentes de IA**
- Definição de personas
- Execução automatizada
- Integração com múltiplos LLMs

### 4. **Sistema de Mensagens**
- Chat em tempo real
- Suporte a Markdown
- Histórico persistente

### 5. **Gerenciamento de Projetos**
- Estrutura de arquivos
- Terminal integrado
- Issues e fóruns

## Integrações Externas

### 1. **LLM Providers**
- OpenAI GPT-4
- DeepSeek
- Configuração flexível

### 2. **Git Integration**
- Clone de repositórios
- Monitoramento de mudanças
- Integração com workflow

### 3. **File System**
- Navegação de arquivos
- Visualização de código
- Edição básica

## Padrões de Qualidade

### 1. **Testing**
- Testes unitários com Vitest
- Testes de integração
- Cobertura de código

### 2. **Linting & Formatting**
- ESLint para qualidade
- Prettier para formatação
- Configurações consistentes

### 3. **Type Checking**
- TypeScript strict mode
- Validação em build time
- Interfaces bem definidas

## Deployment

### 1. **Electron Forge**
- Build para múltiplas plataformas
- Empacotamento automático
- Distribuição de atualizações

### 2. **Environment Management**
- Configurações por ambiente
- Variáveis de ambiente
- Secrets management

## Roadmap de Evolução

### Fase 1: MVP (Atual)
- ✅ Autenticação básica
- ✅ Interface Discord-like
- ✅ Integração com LLMs
- ✅ Mensagens diretas

### Fase 2: Colaboração
- 🔄 Projetos compartilhados
- 🔄 Canais de equipe
- 🔄 Agentes em projetos

### Fase 3: Automação
- 📋 Workflows automatizados
- 📋 Integração CI/CD
- 📋 Agentes especializados

### Fase 4: Extensibilidade
- 📋 Plugin system
- 📋 APIs externas
- 📋 Marketplace de agentes

## Considerações de Segurança

### 1. **Autenticação**
- Hashing seguro de senhas
- Tokens JWT com expiração
- Validação de sessões

### 2. **Dados Sensíveis**
- Criptografia de API keys
- Sanitização de inputs
- Validação de dados

### 3. **Comunicação**
- IPC seguro
- Validação de mensagens
- Prevenção de XSS

## Performance

### 1. **Frontend**
- Lazy loading de components
- Memoização estratégica
- Virtualização de listas

### 2. **Backend**
- Conexão pooling
- Caching inteligente
- Queries otimizadas

### 3. **Database**
- Índices apropriados
- Queries eficientes
- Limpeza de dados antigos

---

**Nota:** Esta documentação representa o estado atual da arquitetura do Project Wiz v3.0. Para detalhes técnicos específicos, consulte os arquivos de código e documentação complementar.