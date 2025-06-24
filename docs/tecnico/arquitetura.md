# Arquitetura de Software - Project Wiz

Este documento descreve a arquitetura de software para o Project Wiz. A arquitetura é projetada para ser robusta, escalável, manutenível e testável, aderindo às melhores práticas modernas e aos requisitos específicos do projeto.

## 1. Princípios Arquiteturais Fundamentais

*   **Clean Architecture:** O sistema segue estritamente os princípios da Clean Architecture. Isso organiza a base de código em camadas concêntricas (Domínio, Aplicação, Infraestrutura), com as dependências fluindo para dentro. Isso garante que a lógica de negócios principal seja independente de frameworks e tecnologias externas.
*   **Object Calisthenics:** Todas as nove regras do Object Calisthenics devem ser aplicadas compulsoriamente durante o desenvolvimento para promover um código orientado a objetos extremamente limpo, legível e manutenível.
*   **SOLID, DRY, KISS:** Princípios de design de software padrão como SOLID (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion), DRY (Don't Repeat Yourself) e KISS (Keep It Simple, Stupid) devem ser seguidos.
*   **Modularidade e Separação de Preocupações:** Cada componente e camada tem responsabilidades bem definidas.

## 2. Tecnologias Chave

*   **Framework da Aplicação:** ElectronJS (para estrutura de aplicação desktop).
*   **Frontend:** React, TypeScript, Tailwind CSS (estilização), Vite (bundler).
    *   **Roteamento:** TanStack Router (`@tanstack/react-router`).
    *   **Internacionalização (i18n):** LinguiJS (`@lingui/*`).
    *   **Componentes de UI:** Uso extensivo de primitivas Radix UI (`@radix-ui/*`), ícones de Lucide React (`lucide-react`), notificações por Sonner (`sonner`), e gráficos por Recharts (`recharts`).
    *   **Manuseio de Formulários:** React Hook Form (`react-hook-form`) com Zod para validação (`@hookform/resolvers` e `zod`).
*   **Backend/Lógica Principal:** TypeScript, Node.js.
    *   **Injeção de Dependência (DI):** InversifyJS (`inversify`, `reflect-metadata`) é usado para gerenciar dependências, particularmente nos serviços de backend.
*   **Integração IA/LLM:** AI SDK (`ai` library) para interagir com Modelos de Linguagem Grandes (ex: OpenAI via `@ai-sdk/openai`, DeepSeek via `@ai-sdk/deepseek`).
*   **Banco de Dados/Persistência:** SQLite (via `better-sqlite3`) com Drizzle ORM (`drizzle-orm`, `drizzle-kit`).
*   **API/Ferramentas Adicionais:** Octokit (`octokit`) pode ser usado para interações com GitHub.

## 3. Camadas Arquiteturais (Clean Architecture)

### 3.1. Camada de Domínio (Core)
*   **Propósito:** Contém a lógica e as políticas de negócios de toda a empresa. É a camada mais independente.
*   **Componentes Chave:**
    *   **Entidades:** Objetos que representam conceitos de negócios centrais, possuindo uma identidade e um ciclo de vida (ex: `Job`, `AgentInternalState`, `Project`, `LLMProviderConfig`, `User`, `Worker`). Encapsulam atributos e regras de validação intrínsecas. Aderência ao Object Calisthenics significa que as entidades serão pequenas e focadas.
    *   **Value Objects (VOs):** Objetos imutáveis que representam aspectos descritivos do domínio sem uma identidade conceitual (ex: `JobId`, `JobStatus`, `ActivityContext` e seus componentes como `ActivityHistory`, `ProjectName`, `AgentId`, `PersonaRole`). Lidam com a validação de seus valores específicos.
    *   **Eventos de Domínio (Opcional/Futuro):** Podem ser usados para sinalizar ocorrências significativas dentro do domínio.
    *   **Interfaces de Repositório:** Definem contratos para persistência de dados, implementados pela camada de Infraestrutura. São definidos em termos de objetos de domínio (ex: `IJobRepository`, `IAgentRepository`, `IPersonaRepository`, `IProjectRepository`).

### 3.2. Camada de Aplicação (Casos de Uso)
*   **Propósito:** Contém a lógica de negócios específica da aplicação. Orquestra o fluxo de dados de e para a camada de Domínio e direciona as entidades de Domínio para executar sua lógica.
*   **Componentes Chave:**
    *   **Casos de Uso (Interactors):** Implementam operações específicas da aplicação ou histórias de usuário (ex: `CreateProjectUseCase`, `CreatePersonaUseCase`, `CreateJobUseCase`, `CreateAgentUseCase`, `ProcessJobUseCase`). Coordenam a recuperação e modificação de entidades de domínio através de interfaces de repositório.
    *   **Serviços de Aplicação:** Coordenam tarefas e operações, frequentemente encapsulando lógica que não se encaixa perfeitamente em um único caso de uso ou envolve múltiplas entidades de domínio (ex: `GenericAgentExecutor` como implementação de `IAgentExecutor`, `WorkerService`).
    *   **Portas (Interfaces para Infraestrutura):** Definem interfaces para comunicação de saída com a camada de Infraestrutura (ex: `IJobQueue`, `IFileSystem`, `IVersionControlSystem`, `ILLM` interface, `IAgentTool` interface).
    *   **Data Transfer Objects (DTOs) / Schemas de Entrada:** Schemas Zod são usados para validação de entrada para casos de uso.
    *   **Fábricas:** Responsáveis pela criação de objetos complexos, garantindo que sejam instanciados corretamente (ex: `TaskFactoryImpl` para criar instâncias de `ITask`).

### 3.3. Camada de Infraestrutura (Preocupações Externas)
*   **Propósito:** Contém todos os detalhes externos à aplicação, como UI, acesso ao banco de dados, integrações de API externas e código específico do framework.
*   **Componentes Chave:**
    *   **Implementações de Persistência:** Implementações concretas de Interfaces de Repositório usando Drizzle ORM e SQLite (ex: `DrizzleJobRepository`, `DrizzleAgentRepository`, `FileSystemAgentPersonaTemplateRepository`).
    *   **Implementações de Fila:** Implementação concreta da interface `IJobQueue` (ex: `SqliteJobQueue` que opera sobre o `IJobRepository`).
    *   **Implementações de Worker Pool:** Implementação concreta de gerenciamento de workers (ex: `ChildProcessWorkerPoolService` usando processos filhos Node.js, com `job-processor.worker.ts` como ponto de entrada do worker).
    *   **Adaptadores de Ferramentas (`IAgentTool`):** Implementações concretas de interfaces `IAgentTool` (ex: `FileSystemTool`, `TerminalTool`, `MemoryTool`, `AnnotationTool`, `TaskTool`). Adaptam tecnologias ou bibliotecas específicas à interface genérica de ferramenta usada pela camada de Aplicação.
    *   **Adaptadores LLM:** Implementações concretas da interface `ILLM` usando o AI SDK (ex: `IPCLLMAdapter` para workers, ou uma implementação direta em `AgentServiceImpl`).
    *   **Processo Principal Electron & IPC:**
        *   O processo principal do Electron lida com gerenciamento de janelas, ciclo de vida da aplicação e interações nativas do SO.
        *   Manipuladores de Comunicação Entre Processos (IPC) no processo principal (definidos usando `ipcMain` do Electron) recebem requisições do processo Renderer (UI) e delegam para casos de uso/serviços da camada de Aplicação, frequentemente resolvidos via InversifyJS.
    *   **UI (Frontend - React):** A interface do usuário é uma Single Page Application (SPA) construída com React, TypeScript e Vite. Ela reside na camada de Apresentação (`src_refactored/presentation/ui/`) e interage com o processo principal do Electron via IPC. A arquitetura detalhada do frontend é descrita na Seção 3.4.
    *   **Integrações de Serviços Externos:** Quaisquer outras interações com APIs de terceiros.
    *   **`ToolRegistry`**: Singleton que armazena e fornece instâncias de `IAgentTool`.

### 3.4. Arquitetura do Frontend (UI - React)

A interface do usuário (UI) do Project Wiz é uma Single Page Application (SPA) construída com React, TypeScript e Vite, localizada em `src_refactored/presentation/ui/`. Ela é responsável por toda a interação visual com o usuário e se comunica com o processo principal do Electron através de IPC (detalhado na camada de serviços do frontend e na configuração de preload do Electron).

A organização interna de `src_refactored/presentation/ui/` visa clareza, Developer Experience (DX), separação de conceitos pragmática e escalabilidade:

*   **Ponto de Entrada (`src_refactored/presentation/ui/`):**
    *   `index.html`: O arquivo HTML raiz servido pelo Vite para o processo de renderer do Electron. Contém a `div#root` onde a aplicação React é montada.
    *   `main.tsx`: O ponto de entrada TypeScript/React. Responsável por:
        *   Importar estilos globais (`./styles/globals.css`).
        *   Inicializar e configurar providers globais essenciais, como:
            *   `ThemeProvider` (para temas claro/escuro).
            *   `QueryClientProvider` (para TanStack Query, gerenciando estado do servidor/IPC).
            *   `RouterProvider` (do TanStack Router, para habilitar o roteamento).
            *   `I18nProvider` (do LinguiJS, se a funcionalidade de i18n for mantida/reimplementada).
        *   Renderizar a aplicação React no DOM.

*   **Organização de Diretórios em `src_refactored/presentation/ui/`:**

    *   `assets/`: Contém recursos estáticos como imagens, fontes, etc., que são diretamente utilizados pela UI.

    *   `components/`: Armazena componentes React reutilizáveis em toda a aplicação, subdivididos para clareza:
        *   `common/`: Componentes de UI genéricos, pequenos, e altamente reutilizáveis, sem lógica de negócio específica (ex: `LoadingSpinner`, `ErrorFallback`, `PageTitle`). São blocos de construção básicos.
        *   `layout/`: Componentes responsáveis pela estrutura visual principal das páginas e seções da aplicação (ex: `AppShell` para o contêiner principal, `MainSidebar`, `ContextSidebar` para barras laterais contextuais, `PageHeader`).
        *   `ui/`: Componentes base da biblioteca Shadcn/UI (ex: `button.tsx`, `card.tsx`, `dialog.tsx`). Estes são tipicamente adicionados via CLI do Shadcn/UI e podem ser customizados para atender ao `visual_style_guide.md`.

    *   `config/`: Centraliza as configurações principais da aplicação UI:
        *   `router.ts`: Criação e exportação da instância principal do TanStack Router, configurada com o `routeTree` gerado.
        *   `queryClient.ts`: Criação e exportação da instância do `QueryClient` do TanStack Query.
        *   `i18n.ts`: (Se aplicável) Configuração do LinguiJS, incluindo carregamento de catálogos de mensagens e ativação de locale.

    *   `features/`: Este é um diretório chave para a organização modular da UI. Cada subdiretório representa uma funcionalidade ou domínio de negócio principal da aplicação (ex: `auth`, `project`, `dashboard`, `chat`, `settings`). Dentro de cada feature:
        *   `components/`: Componentes React reutilizáveis *exclusivamente* dentro desta feature.
        *   `hooks/`: Hooks React customizados contendo lógica de UI, estado e efeitos colaterais específicos da feature.
        *   `pages/`: Componentes de página completos que são os pontos de entrada para as rotas da feature (ex: `ProjectListPage.tsx`, `AuthPage.tsx`).
        *   `services.ts`: (Opcional, ou pode estar em `services/` global) Funções que encapsulam chamadas IPC específicas da feature, utilizando a abstração global de IPC.
        *   `types.ts`: (Opcional) Definições de tipo TypeScript específicas para esta feature.
        *   `index.ts`: (Opcional) Pode servir como ponto de entrada para exportar elementos públicos da feature, facilitando importações.
        A estrutura de `features/` promove alta coesão (mantendo juntos os artefatos de uma funcionalidade) e baixo acoplamento (minimizando dependências diretas entre features).

    *   `hooks/`: Contém hooks React globais, que são utilitários e reutilizáveis em múltiplas features (ex: `useDebounce`, `useLocalStorage`, `useAppTheme`).

    *   `lib/`: Funções utilitárias puras JavaScript/TypeScript (não-React) que podem ser usadas em qualquer lugar no frontend (ex: `cn` para classnames, utilitários de data, formatação de strings).

    *   `services/`: Define a camada de abstração para a comunicação com o backend (processo principal do Electron via IPC).
        *   `coreService.ts` (ou similar): Exporta funções que encapsulam as chamadas `window.api.invoke("namespace:action", payload)`, fornecendo uma interface tipada e centralizada para interações com o backend. Isso desacopla a lógica da UI dos detalhes da implementação do IPC.

    *   `store/`: Para gerenciamento de estado global do cliente que não é estado do servidor (já coberto pelo TanStack Query).
        *   Exemplos: Contexto/store para o tema da UI (`ThemeContext`), estado de autenticação do usuário (`AuthUserContext` ou um pequeno store Zustand/Jotai).

    *   `styles/`: Arquivos de estilo globais.
        *   `globals.css`: Contém os imports base do Tailwind, definições de variáveis CSS para temas (light/dark), e quaisquer outros estilos globais ou camadas base do Tailwind.

    *   `types/`: Definições de tipo TypeScript globais para o frontend, que podem ser usadas em múltiplas features ou componentes.

    *   `routeTree.gen.ts`: Arquivo gerado automaticamente pelo plugin Vite do TanStack Router, contendo a árvore de rotas da aplicação com base nos arquivos em `features/**/pages/`.

**Justificativa da Estrutura do Frontend:**
Esta organização visa:
*   **Developer Experience (DX):** Facilitar a localização de código e a compreensão das responsabilidades de cada módulo através do agrupamento por features e da clara distinção entre UI, lógica de feature, serviços e estado.
*   **Separação de Conceitos:** Isolar componentes de UI puros, lógica de apresentação, lógica de comunicação com o backend e gerenciamento de estado.
*   **Escalabilidade:** Permitir que novas features sejam adicionadas de forma modular e independente.
*   **Manutenibilidade:** Reduzir o acoplamento entre diferentes partes da aplicação, facilitando modificações e refatorações.
*   **Testabilidade:** A separação clara facilita a escrita de testes unitários para componentes, hooks e serviços, e testes de integração para fluxos de features.
*   **Alinhamento com o Ecossistema:** Adota convenções comuns do ecossistema React e Vite, e se integra bem com bibliotecas como TanStack Router, TanStack Query e Shadcn/UI.

## 4. Padrões de Design e Conceitos Chave

*   **Repositório:** Desacopla a lógica de domínio e aplicação dos mecanismos de persistência de dados.
*   **Camada de Serviço:** Encapsula a lógica da aplicação não pertencente a entidades específicas.
*   **Fábrica:** Usado para criar instâncias de objetos complexos.
*   **Value Objects:** Reforçam a validade e imutabilidade para aspectos descritivos do domínio.
*   **Entidades:** Modelam conceitos centrais do domínio com identidade.
*   **Casos de Uso/Interactors:** Definem operações específicas da aplicação.
*   **Injeção de Dependência (DI):** InversifyJS é usado para gerenciar dependências.
*   **Processamento Assíncrono (Jobs & Fila):**
    *   **Jobs/Activities:** Entidade `Job` representa unidades de trabalho.
    *   **Fila (`IJobQueue` / `SqliteJobQueue`):** Gerencia o ciclo de vida dos Jobs.
    *   **Workers (`WorkerService`, `job-processor.worker.ts`):** Processos que pegam Jobs da Fila. O `WorkerService` (domínio) usa um `IAgentExecutor`. O `job-processor.worker.ts` (infra) é um worker de processo filho que usa serviços baseados em IPC.
    *   **Agentes (`GenericAgentExecutor`):** As entidades inteligentes (configuradas por `AgentPersonaTemplate` e instanciadas como `Agent`) que realizam o trabalho de um Job.
    *   **Ferramentas (`IAgentTool`):** Capacidades usadas por Agentes para interagir com o ambiente.

## 5. Fluxo de Dados Exemplo (Simplificado: Criação e Processamento de um Job)

1.  **UI/Gatilho Externo:** Ação do usuário na UI React (Infraestrutura - especificamente `presentation/ui/`) inicia uma requisição.
2.  **IPC:** Requisição é enviada ao Processo Principal Electron via IPC (Infraestrutura - via `presentation/electron/preload/` e `presentation/ui/services/`).
3.  **Manipulador IPC (Processo Principal - `presentation/electron/main/` ou `infrastructure/ipc/`):** Recebe a requisição. Resolve o Caso de Uso apropriado da camada de Aplicação (ex: `CreateJobUseCase`) usando o container DI (InversifyJS).
4.  **Caso de Uso (`CreateJobUseCase` - `core/application/`):**
    *   Valida a entrada.
    *   Cria uma entidade `Job` (`core/domain/`).
    *   Usa `IJobRepository` (interface do `core/domain/`, implementada na `infrastructure/persistence/`) para persistir o `Job`.
    *   Usa `IJobQueue` (porta da `core/application/`, implementada na `infrastructure/queue/`) para adicionar o `Job` à fila.
5.  **Worker (`WorkerService` - `core/application/` ou `infrastructure/worker-pool/`):**
    *   Monitora a `IJobQueue`.
    *   Remove um `Job` pendente.
    *   Invoca o `GenericAgentExecutor` (serviço da `core/application/`) com o `Job`.
6.  **Agente (`GenericAgentExecutor` - `core/application/`):**
    *   Carrega o `AgentInternalState` (`core/domain/`) via `IAgentRepository`.
    *   Usa LLM (via porta `ILLM`) com `AgentInternalState` e `Job.data.agentState.activityContext` (`core/domain/`) para decidir a ação.
    *   Executa `IAgentTool`s (portas da `core/application/`, implementadas na `infrastructure/tools/`).
    *   Atualiza `Job.data.agentState.activityContext` e determina se o Job está completo para este ciclo.
7.  **Worker & Fila:** Worker recebe resultado do Agente, notifica `IJobQueue` para atualizar o status do Job (ex: finalizado, falhou, atrasado).

Esta arquitetura promove uma clara separação de preocupações, tornando o sistema mais fácil de desenvolver, testar e manter, enquanto adere aos padrões de qualidade do projeto.
