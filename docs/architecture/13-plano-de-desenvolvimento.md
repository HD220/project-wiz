# 13. Plano de Desenvolvimento Detalhado

**Versão:** 1.0
**Status:** Rascunho Inicial
**Data:** 2025-07-18

---

## 🎯 Visão Geral do Plano

Este documento apresenta um plano de desenvolvimento detalhado e sequencial para a construção do Project Wiz, seguindo a arquitetura e os princípios definidos nos documentos de design. O objetivo é fornecer um checklist claro e acionável para equipes de desenvolvimento, incluindo Agentes LLM, garantindo a implementação correta e eficiente de cada componente do sistema.

Cada seção representa uma fase de desenvolvimento, com tarefas específicas, referências à documentação de arquitetura e exemplos de implementação quando aplicável.

---

## 🚀 Fases de Desenvolvimento

### Fase 0: Configuração e Infraestrutura Essencial

**Objetivo**: Estabelecer a base do projeto, configurar o ambiente de desenvolvimento e os módulos compartilhados.

- **0.1. Configuração Inicial do Projeto**
  - **Descrição**: Clonar o repositório, instalar dependências, configurar variáveis de ambiente e scripts essenciais.
  - **Referências**:
    - [7. Desenvolvimento e Qualidade - 1. Configuração do Ambiente de Desenvolvimento](docs/architecture/new/07-desenvolvimento-e-qualidade.md#1-configuração-do-ambiente-de-desenvolvimento)
  - **Exemplo de Implementação**:
    ```bash
    git clone <repo_url>
    npm install
    cp .env.example .env
    # Adicionar chaves de API ao .env
    npm run db:reset
    npm run dev
    ```

- **0.2. Configuração do Banco de Dados (SQLite + Drizzle ORM)**
  - **Descrição**: Configurar a conexão com o SQLite e o Drizzle ORM, incluindo a estrutura inicial de migrações.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 4. Data Layer: Persistência com Drizzle ORM](docs/architecture/new/03-camada-backend.md#4-data-layer-persistência-com-drizzle-orm)
    - [2. Estrutura do Projeto - `src/main/database/`](docs/architecture/new/02-estrutura-do-projeto.md#srcmain---backend-detalhado)
  - **Exemplo de Implementação**:
    - Criar `src/main/database/connection.ts`
    - Configurar `drizzle.config.ts`
    - Executar `npm run db:reset`

- **0.3. Módulos Compartilhados (`src/shared/`)**
  - **Descrição**: Definir tipos, schemas de validação (Zod) e utilitários que serão usados tanto no frontend quanto no backend.
  - **Referências**:
    - [2. Estrutura do Projeto - `src/shared/`](docs/architecture/new/02-estrutura-do-projeto.md#srcshared---código-compartilhado-backendfrontend)
  - **Exemplo de Implementação**:
    - `src/shared/types/index.ts`
    - `src/shared/schemas/user.schema.ts` (ex: para validação de login)
    - `src/shared/utils/id-generator.ts`

- **0.4. Ponto de Entrada do Processo Main (Backend)**
  - **Descrição**: Configurar o `main.ts` do Electron para inicializar o backend, incluindo o logger e o gerenciador de janelas.
  - **Referências**:
    - [2. Estrutura do Projeto - `src/main/main.ts`](docs/architecture/new/02-estrutura-do-projeto.md#srcmain---backend-detalhado)
    - [Estrutura de Arquivos - `src/main/app/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/app/) (implícito, para `app-initializer.ts`, `window-manager.ts`)
  - **Exemplo de Implementação**:
    - `src/main/main.ts`
    - `src/main/app/app-initializer.ts`
    - `src/main/app/window-manager.ts`

- **0.5. Ponto de Entrada do Processo Renderer (Frontend)**
  - **Descrição**: Configurar o `main.tsx` do React para renderizar a aplicação frontend, incluindo a inicialização do TanStack Router e provedores de contexto.
  - **Referências**:
    - [2. Estrutura do Projeto - `src/renderer/main.tsx`](docs/architecture/new/02-estrutura-do-projeto.md#srcrenderer---frontend-detalhado)
  - **Exemplo de Implementação**:
    - `src/renderer/main.tsx`
    - `src/renderer/globals.css`
    - `src/renderer/routeTree.gen.ts` (gerado pelo TanStack Router)

- **0.6. Comunicação IPC (Inter-Process Communication)**
  - **Descrição**: Estabelecer a base para a comunicação entre o processo Main e Renderer usando `ipcMain` e `ipcRenderer`, e definir a interface `window.api`.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 2. API Layer: Comunicação via IPC](docs/architecture/new/03-camada-backend.md#2-api-layer-comunicação-via-ipc)
    - [4. Camada Frontend (Renderer Process) - 3. Gerenciamento de Estado - TanStack Query](docs/architecture/new/04-camada-frontend.md#tanstack-query-estado-do-servidor)
    - [Estrutura de Arquivos - `src/main/ipc/main.handlers.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/ipc/main.handlers.ts)
    - [Estrutura de Arquivos - `src/renderer/preload.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/preload.ts)
    - [Estrutura de Arquivos - `src/renderer/window.d.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/window.d.ts)
  - **Exemplo de Implementação**:
    - `src/main/ipc/main.handlers.ts` (para registrar handlers IPC)
    - `src/renderer/preload.ts` (para expor `window.api`)
    - `src/renderer/window.d.ts` (para tipagem da `window.api`)

### Fase 1: Backend - Domínio de Usuário e Autenticação

**Objetivo**: Implementar a lógica de backend para gerenciamento de usuários, autenticação e perfis.

- **1.1. Schema de Usuários e Autenticação**
  - **Descrição**: Definir o schema Drizzle para usuários e a estrutura de dados para autenticação.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 4. Data Layer: Persistência com Drizzle ORM](docs/architecture/new/03-camada-backend.md#4-data-layer-persistência-com-drizzle-orm)
    - [6. Autenticação e Fluxos de Usuário - 1. Sistema de Autenticação Local e Multi-Conta](docs/architecture/new/06-autenticacao-e-fluxos-de-usuario.md#1-sistema-de-autenticação-local-e-multi-conta)
    - [Estrutura de Arquivos - `src/main/user/authentication/users.schema.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/user/authentication/users.schema.ts)
  - **Exemplo de Implementação**:
    - `src/main/user/authentication/users.schema.ts`

- **1.2. Serviço de Autenticação (`AuthService`)**
  - **Descrição**: Implementar a lógica de negócio para registro, login, validação de senha (bcrypt) e geração de tokens JWT.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 3. Service Layer: Lógica de Negócio do Domínio](docs/architecture/new/03-camada-backend.md#3-service-layer-lógica-de-negócio-do-domínio)
    - [6. Autenticação e Fluxos de Usuário - Fluxo de Autenticação (Login)](docs/architecture/new/06-autenticacao-e-fluxos-de-usuario.md#fluxo-de-autenticação-login)
    - [Estrutura de Arquivos - `src/main/user/authentication/auth.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/user/authentication/auth.service.ts)
  - **Exemplo de Implementação**:
    - `src/main/user/authentication/auth.service.ts`

- **1.3. Handlers IPC de Autenticação**
  - **Descrição**: Criar os handlers IPC para expor os métodos de autenticação do `AuthService` ao frontend.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 2. API Layer: Comunicação via IPC](docs/architecture/new/03-camada-backend.md#2-api-layer-comunicação-via-ipc)
    - [Estrutura de Arquivos - `src/main/user/authentication/auth.handlers.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/user/authentication/auth.handlers.ts)
  - **Exemplo de Implementação**:
    - `src/main/user/authentication/auth.handlers.ts`

- **1.4. Serviço de Perfil de Usuário (`ProfileService`)**
  - **Descrição**: Implementar a lógica para gerenciar as configurações e preferências do perfil do usuário.
  - **Referências**:
    - [8. Funcionalidade: Espaço Pessoal e DMs - 2. Configurações Globais](docs/architecture/new/08-funcionalidade-espaco-pessoal-e-dms.md#2-configurações-globais)
    - [Estrutura de Arquivos - `src/main/user/profile/profile.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/user/profile/profile.service.ts)
  - **Exemplo de Implementação**:
    - `src/main/user/profile/profile.service.ts`

### Fase 2: Backend - Domínio de Gerenciamento de Projetos

**Objetivo**: Implementar a lógica de backend para a criação, leitura, atualização e exclusão de projetos, incluindo a integração inicial com Git.

- **2.1. Schema de Projetos**
  - **Descrição**: Definir o schema Drizzle para a tabela de projetos.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 4. Data Layer: Persistência com Drizzle ORM](docs/architecture/new/03-camada-backend.md#4-data-layer-persistência-com-drizzle-orm)
    - [Estrutura de Arquivos - `src/main/project/projects.schema.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/project/projects.schema.ts)
  - **Exemplo de Implementação**:
    - `src/main/project/projects.schema.ts`

- **2.2. Serviço de Projetos (`ProjectService`)**
  - **Descrição**: Implementar a lógica de negócio para operações CRUD de projetos, incluindo a inicialização de repositórios Git e a criação de canais padrão.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 3. Service Layer: Lógica de Negócio do Domínio](docs/architecture/new/03-camada-backend.md#3-service-layer-lógica-de-negócio-do-domínio)
    - [6. Autenticação e Fluxos de Usuário - Fluxo 1: Criação de um Novo Projeto](docs/architecture/new/06-autenticacao-e-fluxos-de-usuario.md#fluxo-1-criação-de-um-novo-projeto)
    - [9. Funcionalidade: Gerenciamento de Projetos - 1. Ciclo de Vida do Projeto](docs/architecture/new/09-funcionalidade-gerenciamento-de-projetos.md#1-ciclo-de-vida-do-projeto)
    - [Estrutura de Arquivos - `src/main/project/project.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/project/project.service.ts)
  - **Exemplo de Implementação**:
    - `src/main/project/project.service.ts` (incluir chamadas ao `GitService` e `ChannelService`)

- **2.3. Handlers IPC de Projetos**
  - **Descrição**: Criar os handlers IPC para expor os métodos do `ProjectService` ao frontend.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 2. API Layer: Comunicação via IPC](docs/architecture/new/03-camada-backend.md#2-api-layer-comunicação-via-ipc)
    - [Estrutura de Arquivos - `src/main/project/project.handlers.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/project/project.handlers.ts)
  - **Exemplo de Implementação**:
    - `src/main/project/project.handlers.ts`

- **2.4. Serviço Git (`GitService`)**
  - **Descrição**: Implementar um serviço para interagir com o Git, incluindo inicialização de repositórios e criação de worktrees.
  - **Referências**:
    - [5. Sistema de Agentes Autônomos - 🤖 O Core do Agent Worker (`agent.worker.ts`)](docs/architecture/new/05-sistema-de-agentes.md#o-core-do-agent-worker-agentworkerts)
    - [6. Autenticação e Fluxos de Usuário - Fluxo 1: Criação de um Novo Projeto](docs/architecture/new/06-autenticacao-e-fluxos-de-usuario.md#fluxo-1-criação-de-um-novo-projeto)
    - [Estrutura de Arquivos - `src/main/project/core/git.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/project/core/git.service.ts) (assumindo um local para serviços core de projeto)
  - **Exemplo de Implementação**:
    - `src/main/project/core/git.service.ts` (métodos como `initializeRepo`, `cloneRepo`, `createWorktreeForTask`, `commitChanges`)

### Fase 3: Backend - Domínio de Conversas e Mensagens

**Objetivo**: Implementar a lógica de backend para o gerenciamento de mensagens e o roteamento inicial de interações.

- **3.1. Schema de Mensagens e Conversas**
  - **Descrição**: Definir os schemas Drizzle para mensagens e conversas (canais, DMs).
  - **Referências**:
    - [3. Camada Backend (Main Process) - 4. Data Layer: Persistência com Drizzle ORM](docs/architecture/new/03-camada-backend.md#4-data-layer-persistência-com-drizzle-orm)
    - [8. Funcionalidade: Espaço Pessoal e DMs - 1. Mensagens Diretas (DMs)](docs/architecture/new/08-funcionalidade-espaco-pessoal-e-dms.md#1-mensagens-diretas-dms)
    - [Estrutura de Arquivos - `src/main/conversations/core/messages.schema.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/conversations/core/messages.schema.ts)
    - [Estrutura de Arquivos - `src/main/conversations/channels/channels.schema.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/conversations/channels/channels.schema.ts)
  - **Exemplo de Implementação**:
    - `src/main/conversations/core/messages.schema.ts`
    - `src/main/conversations/channels/channels.schema.ts`

- **3.2. Serviço de Mensagens (`MessageService`)**
  - **Descrição**: Implementar a lógica de negócio para envio, recebimento e persistência de mensagens.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 3. Service Layer: Lógica de Negócio do Domínio](docs/architecture/new/03-camada-backend.md#3-service-layer-lógica-de-negócio-do-domínio)
    - [6. Autenticação e Fluxos de Usuário - Fluxo 2: Envio de Mensagem e Interação do Agente](docs/architecture/new/06-autenticacao-e-fluxos-de-usuario.md#fluxo-2-envio-de-mensagem-e-interação-do-agente)
    - [8. Funcionalidade: Espaço Pessoal e DMs - 1. Mensagens Diretas (DMs)](docs/architecture/new/08-funcionalidade-espaco-pessoal-e-dms.md#1-mensagens-diretas-dms)
    - [Estrutura de Arquivos - `src/main/conversations/core/message.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/conversations/core/message.service.ts)
  - **Exemplo de Implementação**:
    - `src/main/conversations/core/message.service.ts`

- **3.3. Serviço de Canais (`ChannelService`)**
  - **Descrição**: Implementar a lógica para criação e gerenciamento de canais de projeto.
  - **Referências**:
    - [6. Autenticação e Fluxos de Usuário - Fluxo 1: Criação de um Novo Projeto](docs/architecture/new/06-autenticacao-e-fluxos-de-usuario.md#fluxo-1-criação-de-um-novo-projeto)
    - [Estrutura de Arquivos - `src/main/project/channels/channel.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/project/channels/channel.service.ts)
  - **Exemplo de Implementação**:
    - `src/main/project/channels/channel.service.ts` (método `createDefaultChannels`)

- **3.4. Handlers IPC de Mensagens e Canais**
  - **Descrição**: Criar os handlers IPC para expor os métodos de mensagens e canais ao frontend.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 2. API Layer: Comunicação via IPC](docs/architecture/new/03-camada-backend.md#2-api-layer-comunicação-via-ipc)
    - [Estrutura de Arquivos - `src/main/conversations/channels/channel.handlers.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/conversations/channels/channel.handlers.ts)
    - [Estrutura de Arquivos - `src/main/conversations/core/message.handlers.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/conversations/core/message.handlers.ts)
  - **Exemplo de Implementação**:
    - `src/main/conversations/channels/channel.handlers.ts`
    - `src/main/conversations/core/message.handlers.ts`

- **3.5. Roteador de Mensagens (`MessageRouter`)**
  - **Descrição**: Implementar a lógica inicial para analisar a intenção das mensagens e roteá-las para serviços apropriados (incluindo agentes).
  - **Referências**:
    - [5. Sistema de Agentes Autônomos - 💬 Roteamento e Processamento de Mensagens](docs/architecture/new/05-sistema-de-agentes.md#roteamento-e-processamento-de-mensagens)
    - [6. Autenticação e Fluxos de Usuário - Fluxo 2: Envio de Mensagem e Interação do Agente](docs/architecture/new/06-autenticacao-e-fluxos-de-usuario.md#fluxo-2-envio-de-mensagem-e-interação-do-agente)
    - [12. Funcionalidade: Interação e Fluxo de Trabalho - 1. Iniciação de Tarefas Conversacional](docs/architecture/new/12-funcionalidade-interacao-e-fluxo-de-trabalho.md#1-iniciação-de-tarefas-conversacional)
    - [Estrutura de Arquivos - `src/main/conversations/routing/message.router.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/conversations/routing/message.router.ts)
  - **Exemplo de Implementação**:
    - `src/main/conversations/routing/message.router.ts` (com lógica para identificar menções `@agent-name` e intenções básicas)

### Fase 4: Backend - Domínio do Sistema de Agentes

**Objetivo**: Implementar a lógica de backend para o gerenciamento de agentes, suas filas de tarefas e a execução de workers.

- **4.1. Schema de Agentes e Tarefas**
  - **Descrição**: Definir os schemas Drizzle para agentes (Personas) e suas tarefas.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 4. Data Layer: Persistência com Drizzle ORM](docs/architecture/new/03-camada-backend.md#4-data-layer-persistência-com-drizzle-orm)
    - [5. Sistema de Agentes Autônomos - 🏗️ Arquitetura e Localização no Projeto](docs/architecture/new/05-sistema-de-agentes.md#arquitetura-e-localização-no-projeto)
    - [Estrutura de Arquivos - `src/main/agents/worker/agent.schema.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/agents/worker/agent.schema.ts)
    - [Estrutura de Arquivos - `src/main/agents/queue/task.schema.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/agents/queue/task.schema.ts)
  - **Exemplo de Implementação**:
    - `src/main/agents/worker/agent.schema.ts`
    - `src/main/agents/queue/task.schema.ts`

- **4.2. Serviço de Agentes (`AgentService`)**
  - **Descrição**: Implementar a lógica de negócio para criação, gerenciamento de ciclo de vida (online/offline, busy), e associação de agentes a projetos.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 3. Service Layer: Lógica de Negócio do Domínio](docs/architecture/new/03-camada-backend.md#3-service-layer-lógica-de-negócio-do-domínio)
    - [5. Sistema de Agentes Autônomos - Ciclo de Vida de um Worker](docs/architecture/new/05-sistema-de-agentes.md#ciclo-de-vida-de-um-worker)
    - [10. Funcionalidade: Gerenciamento de Agentes (Equipe de IA) - 1. Contratação de Agentes](docs/architecture/new/10-funcionalidade-gerenciamento-de-agents.md#1-contratação-de-agentes)
    - [Estrutura de Arquivos - `src/main/agents/worker/agent.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/agents/worker/agent.service.ts)
  - **Exemplo de Implementação**:
    - `src/main/agents/worker/agent.service.ts`

- **4.3. Handlers IPC de Agentes**
  - **Descrição**: Criar os handlers IPC para expor os métodos do `AgentService` ao frontend.
  - **Referências**:
    - [3. Camada Backend (Main Process) - 2. API Layer: Comunicação via IPC](docs/architecture/new/03-camada-backend.md#2-api-layer-comunicação-via-ipc)
    - [Estrutura de Arquivos - `src/main/agents/worker/agent.handlers.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/agents/worker/agent.handlers.ts)
  - **Exemplo de Implementação**:
    - `src/main/agents/worker/agent.handlers.ts`

- **4.4. Serviço de Fila (`QueueService`)**
  - **Descrição**: Implementar a lógica para gerenciar a fila de tarefas dos agentes, incluindo adição e despacho de tarefas.
  - **Referências**:
    - [5. Sistema de Agentes Autônomos - 🏗️ Arquitetura e Localização no Projeto](docs/architecture/new/05-sistema-de-agentes.md#arquitetura-e-localização-no-projeto)
    - [12. Funcionalidade: Interação e Fluxo de Trabalho - 1. Iniciação de Tarefas Conversacional](docs/architecture/new/12-funcionalidade-interacao-e-fluxo-de-trabalho.md#1-iniciação-de-tarefas-conversacional)
    - [Estrutura de Arquivos - `src/main/agents/queue/queue.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/agents/queue/queue.service.ts)
  - **Exemplo de Implementação**:
    - `src/main/agents/queue/queue.service.ts`

- **4.5. Worker de Agente (`AgentWorker`)**
  - **Descrição**: Implementar a classe base para os workers de agente, incluindo o fluxo de execução de tarefas (criação de worktree, análise, geração de implementação, escrita de arquivos, execução de testes, commit).
  - **Referências**:
    - [5. Sistema de Agentes Autônomos - 🤖 O Core do Agent Worker (`agent.worker.ts`)](docs/architecture/new/05-sistema-de-agentes.md#o-core-do-agent-worker-agentworkerts)
    - [6. Autenticação e Fluxos de Usuário - Fluxo 3: Agente Executando uma Tarefa de Código](docs/architecture/new/06-autenticacao-e-fluxos-de-usuario.md#fluxo-3-agente-executando-uma-tarefa-de-código)
    - [Estrutura de Arquivos - `src/main/agents/worker/agent.worker.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/agents/worker/agent.worker.ts)
  - **Exemplo de Implementação**:
    - `src/main/agents/worker/agent.worker.ts` (com métodos para `executeTask`, `generateImplementation`, `runTests`, etc.)

- **4.6. Serviço LLM (`LLMService`)**
  - **Descrição**: Implementar um serviço para interagir com modelos de linguagem grandes (LLMs) para análise de intenção e geração de código.
  - **Referências**:
    - [5. Sistema de Agentes Autônomos - 💬 Roteamento e Processamento de Mensagens](docs/architecture/new/05-sistema-de-agentes.md#roteamento-e-processamento-de-mensagens)
    - [6. Autenticação e Fluxos de Usuário - Fluxo 3: Agente Executando uma Tarefa de Código](docs/architecture/new/06-autenticacao-e-fluxos-de-usuario.md#fluxo-3-agente-executando-uma-tarefa-de-código)
    - [Estrutura de Arquivos - `src/main/agents/llm/llm.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/agents/llm/llm.service.ts)
  - **Exemplo de Implementação**:
    - `src/main/agents/llm/llm.service.ts` (métodos como `analyzeIntent`, `generateCode`)

### Fase 5: Frontend - Estrutura da UI e Roteamento

**Objetivo**: Configurar a estrutura básica do frontend, incluindo roteamento, componentes globais e gerenciamento de estado.

- **5.1. Configuração do TanStack Router**
  - **Descrição**: Configurar o roteamento baseado em arquivos e a geração de rotas.
  - **Referências**:
    - [4. Camada Frontend (Renderer Process) - 1. Sistema de Roteamento (TanStack Router)](docs/architecture/new/04-camada-frontend.md#1-sistema-de-roteamento-tanstack-router)
    - [Estrutura de Arquivos - `src/renderer/app/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/app/)
    - [Estrutura de Arquivos - `src/renderer/routeTree.gen.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/routeTree.gen.ts)
  - **Exemplo de Implementação**:
    - `src/renderer/app/__root.tsx`
    - `src/renderer/app/index.tsx` (página inicial)

- **5.2. Componentes de UI Reutilizáveis (`src/renderer/components/`)**
  - **Descrição**: Implementar componentes visuais genéricos (shadcn/ui, layout) que não estão atrelados a domínios específicos.
  - **Referências**:
    - [4. Camada Frontend (Renderer Process) - 4. Componentes de UI Reutilizáveis](docs/architecture/new/04-camada-frontend.md#4-componentes-de-ui-reutilizáveis)
    - [Estrutura de Arquivos - `src/renderer/components/ui/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/app/)
    - [Estrutura de Arquivos - `src/renderer/components/layout/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/app/)
  - **Exemplo de Implementação**:
    - `src/renderer/components/ui/button.tsx`
    - `src/renderer/components/layout/discord-layout.tsx`

- **5.3. Gerenciamento de Estado (TanStack Query e Zustand)**
  - **Descrição**: Configurar os provedores para TanStack Query e Zustand, e criar os primeiros hooks/stores para gerenciamento de estado global e de servidor.
  - **Referências**:
    - [4. Camada Frontend (Renderer Process) - 3. Gerenciamento de Estado](docs/architecture/new/04-camada-frontend.md#3-gerenciamento-de-estado)
    - [Estrutura de Arquivos - `src/renderer/store/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/store/)
    - [Estrutura de Arquivos - `src/renderer/hooks/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/hooks/)
  - **Exemplo de Implementação**:
    - `src/renderer/main.tsx` (para provedores)
    - `src/renderer/store/auth-store.ts` (Zustand)
    - `src/renderer/hooks/use-ipc-query.ts` (wrapper para TanStack Query)

### Fase 6: Frontend - UI de Usuário e Autenticação

**Objetivo**: Implementar as interfaces de usuário para login, registro e gerenciamento de perfil/configurações.

- **6.1. Página de Login/Registro**
  - **Descrição**: Criar a UI para o fluxo de autenticação, interagindo com os handlers IPC de autenticação via TanStack Query.
  - **Referências**:
    - [6. Autenticação e Fluxos de Usuário - Fluxo de Autenticação (Login)](docs/architecture/new/06-autenticacao-e-fluxos-de-usuario.md#fluxo-de-autenticação-login)
    - [4. Camada Frontend (Renderer Process) - 2. Arquitetura de Features (Domain-Driven)](docs/architecture/new/04-camada-frontend.md#2-arquitetura-de-features-domain-driven)
    - [Estrutura de Arquivos - `src/renderer/app/login.tsx`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/app/login.tsx)
    - [Estrutura de Arquivos - `src/renderer/features/user/authentication/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/features/user/authentication/)
  - **Exemplo de Implementação**:
    - `src/renderer/app/login.tsx`
    - `src/renderer/features/user/authentication/components/login-form.tsx`
    - `src/renderer/features/user/authentication/hooks/use-auth.ts`

- **6.2. Página de Configurações Globais do Usuário**
  - **Descrição**: Implementar a UI para gerenciar as configurações globais do usuário (tema, notificações, chaves de API).
  - **Referências**:
    - [8. Funcionalidade: Espaço Pessoal e DMs - 2. Configurações Globais](docs/architecture/new/08-funcionalidade-espaco-pessoal-e-dms.md#2-configurações-globais)
    - [Estrutura de Arquivos - `src/renderer/app/(user)/settings/`](</mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/app/(user)/settings/>)
    - [Estrutura de Arquivos - `src/renderer/features/user/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/features/user/)
  - **Exemplo de Implementação**:
    - `src/renderer/app/(user)/settings/route.tsx`
    - `src/renderer/features/user/hooks/use-user-settings.ts`

### Fase 7: Frontend - UI de Gerenciamento de Projetos

**Objetivo**: Implementar as interfaces de usuário para listar, criar e visualizar projetos.

- **7.1. Página de Criação de Projeto**
  - **Descrição**: Criar a UI para o formulário de criação de projetos, incluindo opções para criar do zero ou clonar de um repositório Git.
  - **Referências**:
    - [9. Funcionalidade: Gerenciamento de Projetos - 1. Ciclo de Vida do Projeto](docs/architecture/new/09-funcionalidade-gerenciamento-de-projetos.md#1-ciclo-de-vida-do-projeto)
    - [Estrutura de Arquivos - `src/renderer/app/create-project.tsx`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/app/create-project.tsx)
    - [Estrutura de Arquivos - `src/renderer/features/project/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/features/project/)
  - **Exemplo de Implementação**:
    - `src/renderer/app/create-project.tsx`
    - `src/renderer/features/project/components/project-form.tsx`
    - `src/renderer/features/project/hooks/use-projects.ts` (para `createProject` mutation)

- **7.2. Listagem de Projetos**
  - **Descrição**: Implementar a UI para exibir a lista de projetos do usuário.
  - **Referências**:
    - [9. Funcionalidade: Gerenciamento de Projetos - 1. Ciclo de Vida do Projeto](docs/architecture/new/09-funcionalidade-gerenciamento-de-projetos.md#1-ciclo-de-vida-do-projeto)
    - [Estrutura de Arquivos - `src/renderer/app/index.tsx`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/app/index.tsx) (ou uma rota específica para dashboard de projetos)
    - [Estrutura de Arquivos - `src/renderer/components/dashboard-cards.tsx`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/components/dashboard-cards.tsx)
    - [Estrutura de Arquivos - `src/renderer/features/project/components/project-card.tsx`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/features/project/components/project-card.tsx)
  - **Exemplo de Implementação**:
    - `src/renderer/app/index.tsx` (ou `src/renderer/app/dashboard/route.tsx`)
    - `src/renderer/features/project/hooks/use-projects.ts` (para `useQuery` de listagem)

- **7.3. Layout e Páginas de Projeto (Detalhe)**
  - **Descrição**: Implementar o layout específico para um projeto (sidebar de canais, área de conteúdo) e as rotas aninhadas para chat, issues, etc.
  - **Referências**:
    - [4. Camada Frontend (Renderer Process) - 1. Sistema de Roteamento (TanStack Router)](docs/architecture/new/04-camada-frontend.md#1-sistema-de-roteamento-tanstack-router)
    - [4. Camada Frontend (Renderer Process) - Exemplo de Rota com Layout e Loader](docs/architecture/new/04-camada-frontend.md#exemplo-de-rota-com-layout-e-loader)
    - [Estrutura de Arquivos - `src/renderer/app/project/$projectId/route.tsx`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/app/project/$projectId/route.tsx)
  - **Exemplo de Implementação**:
    - `src/renderer/app/project/$projectId/route.tsx` (com `ProjectLayout` e `ChannelSidebar`)
    - `src/renderer/features/project/components/channel-sidebar.tsx`

### Fase 8: Funcionalidade - Espaço Pessoal e Mensagens Diretas (DMs)

**Objetivo**: Implementar a funcionalidade de mensagens diretas com agentes (Personas) no espaço pessoal do usuário.

- **8.1. Backend: Lógica de DMs**
  - **Descrição**: Estender o `MessageService` para lidar com DMs e definir o schema para conversas de DM.
  - **Referências**:
    - [8. Funcionalidade: Espaço Pessoal e DMs - 1. Mensagens Diretas (DMs)](docs/architecture/new/08-funcionalidade-espaco-pessoal-e-dms.md#1-mensagens-diretas-dms)
    - [Estrutura de Arquivos - `src/main/conversations/direct-messages/dm-conversations.schema.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/conversations/direct-messages/dm-conversations.schema.ts)
  - **Exemplo de Implementação**:
    - `src/main/conversations/direct-messages/dm-conversations.schema.ts`
    - Atualizar `src/main/conversations/core/message.service.ts` para suportar DMs.

- **8.2. Frontend: UI de DMs**
  - **Descrição**: Criar a interface para listar conversas de DM e exibir/enviar mensagens.
  - **Referências**:
    - [8. Funcionalidade: Espaço Pessoal e DMs - 1. Mensagens Diretas (DMs)](docs/architecture/new/08-funcionalidade-espaco-pessoal-e-dms.md#1-mensagens-diretas-dms)
    - [Estrutura de Arquivos - `src/renderer/app/(user)/direct-messages/[conversation-id]/`](</mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/app/(user)/direct-messages/[conversation-id]/>)
    - [Estrutura de Arquivos - `src/renderer/features/conversations/direct-messages/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/features/conversations/direct-messages/)
  - **Exemplo de Implementação**:
    - `src/renderer/app/(user)/direct-messages/[conversation-id]/route.tsx`
    - `src/renderer/features/conversations/direct-messages/hooks/use-direct-messages.ts`

### Fase 9: Funcionalidade - Gerenciamento de Agentes (Equipe de IA)

**Objetivo**: Implementar a funcionalidade de contratação e gerenciamento de agentes (Personas) para projetos.

- **9.1. Backend: Lógica de Contratação Automática e Manual**
  - **Descrição**: Implementar a lógica no `ProjectService` e `AgentService` para associar agentes a projetos, incluindo a análise de código para sugestão automática.
  - **Referências**:
    - [10. Funcionalidade: Gerenciamento de Agentes (Equipe de IA) - 1. Contratação de Agentes](docs/architecture/new/10-funcionalidade-gerenciamento-de-agents.md#1-contratação-de-agentes)
    - [Estrutura de Arquivos - `src/main/project/project.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/project/project.service.ts)
    - [Estrutura de Arquivos - `src/main/agents/worker/agent.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/agents/worker/agent.service.ts)
    - [Estrutura de Arquivos - `src/main/project/members/project-agents.schema.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/project/members/project-agents.schema.ts) (para tabela de junção)
  - **Exemplo de Implementação**:
    - Métodos em `ProjectService` e `AgentService` para `hireAgent`, `suggestAgentsByCodebase`.
    - `src/main/project/members/project-agents.schema.ts`

- **9.2. Frontend: UI de Criação Manual de Agentes**
  - **Descrição**: Criar o wizard para a criação manual de agentes, definindo nome, role, expertise e personalidade.
  - **Referências**:
    - [10. Funcionalidade: Gerenciamento de Agentes (Equipe de IA) - 1. Contratação de Agentes](docs/architecture/new/10-funcionalidade-gerenciamento-de-agents.md#1-contratação-de-agentes)
    - [Estrutura de Arquivos - `src/renderer/app/agents/create/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/app/agents/create/)
    - [Estrutura de Arquivos - `src/renderer/features/agents/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/features/agents/)
  - **Exemplo de Implementação**:
    - `src/renderer/app/agents/create/route.tsx`
    - `src/renderer/features/agents/components/agent-creation-wizard.tsx`
    - `src/renderer/features/agents/hooks/use-agents.ts`

- **9.3. Frontend: UI de Gerenciamento da Equipe de Projeto**
  - **Descrição**: Implementar a interface para visualizar e gerenciar os agentes associados a um projeto (sidebar de membros).
  - **Referências**:
    - [10. Funcionalidade: Gerenciamento de Agentes (Equipe de IA) - 2. Gerenciamento da Equipe](docs/architecture/new/10-funcionalidade-gerenciamento-de-agents.md#2-gerenciamento-da-equipe)
    - [Estrutura de Arquivos - `src/renderer/features/project/members/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/features/project/members/)
  - **Exemplo de Implementação**:
    - `src/renderer/features/project/members/hooks/use-project-members.ts`
    - Componente para exibir lista de membros na sidebar.

### Fase 10: Funcionalidade - Fórum de Discussão

**Objetivo**: Implementar a funcionalidade de fórum para discussões estruturadas e assíncronas dentro dos projetos.

- **10.1. Backend: Lógica do Fórum**
  - **Descrição**: Implementar o `ForumService` e definir os schemas para tópicos e posts do fórum.
  - **Referências**:
    - [11. Funcionalidade: Fórum de Discussão - 1. Tópicos de Discussão](docs/architecture/new/11-funcionalidade-forum-de-discussao.md#1-tópicos-de-discussão)
    - [Estrutura de Arquivos - `src/main/project/forums/forum.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/project/forums/forum.service.ts)
    - [Estrutura de Arquivos - `src/main/project/forums/forum-topics.schema.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/project/forums/forum-topics.schema.ts)
    - [Estrutura de Arquivos - `src/main/project/forums/forum-posts.schema.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/project/forums/forum-posts.schema.ts)
  - **Exemplo de Implementação**:
    - `src/main/project/forums/forum.service.ts`
    - `src/main/project/forums/forum-topics.schema.ts`
    - `src/main/project/forums/forum-posts.schema.ts`

- **10.2. Frontend: UI do Fórum**
  - **Descrição**: Criar a interface para listar tópicos, visualizar discussões e postar mensagens no fórum.
  - **Referências**:
    - [11. Funcionalidade: Fórum de Discussão - 1. Tópicos de Discussão](docs/architecture/new/11-funcionalidade-forum-de-discussao.md#1-tópicos-de-discussão)
    - [Estrutura de Arquivos - `src/renderer/app/project/[project-id]/forum/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/app/project/[project-id]/forum/)
    - [Estrutura de Arquivos - `src/renderer/features/project/forums/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/features/project/forums/)
  - **Exemplo de Implementação**:
    - `src/renderer/app/project/[project-id]/forum/route.tsx`
    - `src/renderer/features/project/forums/hooks/use-forum.ts`
    - `src/renderer/features/project/forums/components/topic-list.tsx`
    - `src/renderer/features/project/forums/components/topic-thread.tsx`

### Fase 11: Funcionalidade - Interação e Fluxo de Trabalho

**Objetivo**: Implementar o fluxo de trabalho conversacional para iniciar tarefas e monitorar o progresso.

- **11.1. Backend: Iniciação de Tarefas Conversacional**
  - **Descrição**: Integrar o `MessageRouter` com o `QueueService` para criar e enfileirar tarefas de agentes com base em comandos de chat.
  - **Referências**:
    - [12. Funcionalidade: Interação e Fluxo de Trabalho - 1. Iniciação de Tarefas Conversacional](docs/architecture/new/12-funcionalidade-interacao-e-fluxo-de-trabalho.md#1-iniciação-de-tarefas-conversacional)
    - [Estrutura de Arquivos - `src/main/conversations/routing/message.router.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/conversations/routing/message.router.ts)
    - [Estrutura de Arquivos - `src/main/agents/queue/queue.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/agents/queue/queue.service.ts)
  - **Exemplo de Implementação**:
    - Atualizar `MessageRouter` para chamar `QueueService.addJob`
    - Definir tipos de `Job` e `AgentTask`

- **11.2. Backend: Monitoramento de Jobs e Intervenção**
  - **Descrição**: Implementar o `JobService` para atualizar o status das tarefas e expor métodos para pausar/cancelar jobs.
  - **Referências**:
    - [12. Funcionalidade: Interação e Fluxo de Trabalho - 2. Painel de Atividades (Monitoramento de Jobs)](docs/architecture/new/12-funcionalidade-interacao-e-fluxo-de-trabalho.md#2-painel-de-atividades-monitoramento-de-jobs)
    - [12. Funcionalidade: Interação e Fluxo de Trabalho - 3. Intervenção de Exceção](docs/architecture/new/12-funcionalidade-interacao-e-fluxo-de-trabalho.md#3-intervenção-de-exceção)
    - [Estrutura de Arquivos - `src/main/agents/worker/job.service.ts`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/main/agents/worker/job.service.ts) (assumindo um novo serviço para jobs)
  - **Exemplo de Implementação**:
    - `src/main/agents/worker/job.service.ts` (métodos `updateJobStatus`, `pauseJob`, `cancelJob`)
    - Handlers IPC para `jobs:cancel`, `jobs:pause`.

- **11.3. Frontend: Painel de Atividades**
  - **Descrição**: Criar a interface para exibir o status das tarefas dos agentes.
  - **Referências**:
    - [12. Funcionalidade: Interação e Fluxo de Trabalho - 2. Painel de Atividades (Monitoramento de Jobs)](docs/architecture/new/12-funcionalidade-interacao-e-fluxo-de-trabalho.md#2-painel-de-atividades-monitoramento-de-jobs)
    - [Estrutura de Arquivos - `src/renderer/app/project/[project-id]/activity/`](/mnt/d/Documentos/Pessoal/Github/project-wiz/src/renderer/app/project/[project-id]/activity/)
  - **Exemplo de Implementação**:
    - `src/renderer/app/project/[project-id]/activity/route.tsx`
    - `src/renderer/features/agents/hooks/use-jobs.ts`

### Fase 12: Qualidade e Refinamento

**Objetivo**: Garantir a qualidade do código, a cobertura de testes e a conformidade com os padrões de desenvolvimento. Esta fase deve ser contínua e integrada ao longo de todo o processo de desenvolvimento.

- **12.1. Testes Unitários**
  - **Descrição**: Escrever testes unitários para a lógica de negócio em serviços e componentes React.
  - **Referências**:
    - [7. Desenvolvimento e Qualidade - 3. Estratégia de Testes](docs/architecture/new/07-desenvolvimento-e-qualidade.md#3-estratégia-de-testes)
    - [7. Desenvolvimento e Qualidade - Onde os Testes Ficam?](docs/architecture/new/07-desenvolvimento-e-qualidade.md#onde-os-testes-ficam)
  - **Exemplo de Implementação**:
    - `tests/main/user/authentication/auth.service.test.ts`
    - `tests/renderer/features/user/authentication/components/login-form.test.tsx`

- **12.2. Testes de Integração**
  - **Descrição**: Escrever testes de integração para verificar a comunicação entre camadas (IPC, serviço-banco de dados).
  - **Referências**:
    - [7. Desenvolvimento e Qualidade - 3. Estratégia de Testes](docs/architecture/new/07-desenvolvimento-e-qualidade.md#3-estratégia-de-testes)
    - [7. Desenvolvimento e Qualidade - Exemplo de Teste de Integração (Backend)](docs/architecture/new/07-desenvolvimento-e-qualidade.md#exemplo-de-teste-de-integração-backend)
  - **Exemplo de Implementação**:
    - `tests/main/project/project-service.integration.test.ts`

- **12.3. Testes End-to-End (E2E)**
  - **Descrição**: Implementar testes E2E para os fluxos de usuário mais críticos.
  - **Referências**:
    - [7. Desenvolvimento e Qualidade - 3. Estratégia de Testes](docs/architecture/new/07-desenvolvimento-e-qualidade.md#3-estratégia-de-testes)
  - **Exemplo de Implementação**:
    - `tests/e2e/login-flow.spec.ts`

- **12.4. Verificações de Qualidade (Linting, Type Checking, Formatting)**
  - **Descrição**: Garantir que o código esteja em conformidade com os padrões de qualidade definidos.
  - **Referências**:
    - [7. Desenvolvimento e Qualidade - 2. Padrões de Código e Convenções](docs/architecture/new/07-desenvolvimento-e-qualidade.md#2-padrões-de-código-e-convenções)
    - [7. Desenvolvimento e Qualidade - Checklist de Qualidade Antes do Commit](docs/architecture/new/07-desenvolvimento-e-qualidade.md#checklist-de-qualidade-antes-do-commit)
  - **Exemplo de Implementação**:
    - Executar `npm run quality:check` regularmente.
    - Configurar pre-commit hooks (Husky).
